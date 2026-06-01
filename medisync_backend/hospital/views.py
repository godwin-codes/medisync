from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Max
from .models import User, Doctor, Patient, Appointment, Queue, Medicine, Prescription, PrescriptionMedicine, Bill, Feedback
from .serializers import UserSerializer, DoctorSerializer, PatientSerializer, AppointmentSerializer, QueueSerializer, MedicineSerializer, PrescriptionSerializer, BillSerializer, FeedbackSerializer

from .permissions import IsAdminUser, IsDoctorUser, IsPatientUser, IsAdminOrDoctor

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def perform_create(self, serializer):
        email = serializer.validated_data.get('email', '')
        name = serializer.validated_data.get('name', '').replace(' ', '.').lower()
        base_username = email.split('@')[0] if email else name
        
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = User.objects.create_user(
            username=username,
            password='doctorpassword',
            email=email,
            role='DOCTOR'
        )
        serializer.save(user=user)

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', 'patient').replace(' ', '.').lower()
        
        username = name
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{name}{counter}"
            counter += 1
            
        user = User.objects.create_user(
            username=username,
            password='patientpassword',
            role='PATIENT'
        )
        serializer.save(user=user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Patient.objects.all()
        elif user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            # Doctors can see patients they have appointments with
            patient_ids = Appointment.objects.filter(doctor=user.doctor_profile).values_list('patient_id', flat=True)
            return Patient.objects.filter(id__in=patient_ids).distinct()
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Patient.objects.filter(id=user.patient_profile.id)
        return Patient.objects.none()

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Appointment.objects.all()
        elif user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Appointment.objects.filter(patient=user.patient_profile)
        return Appointment.objects.none()

    @action(detail=False, methods=['post'], url_path='book')
    def book(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save()
            
            # Auto-assign queue and calculate estimated wait time
            # Assuming 15 mins per patient
            today_appointments = Appointment.objects.filter(
                doctor=appointment.doctor,
                appointment_date=appointment.appointment_date
            )
            
            current_queue = Queue.objects.filter(appointment__in=today_appointments).aggregate(Max('queue_number'))['queue_number__max'] or 0
            new_queue_number = current_queue + 1
            estimated_wait = (new_queue_number - 1) * 15 # 15 mins per patient before them
            
            queue = Queue.objects.create(
                appointment=appointment,
                queue_number=new_queue_number,
                estimated_wait_time=estimated_wait
            )
            
            return Response({
                'appointment': AppointmentSerializer(appointment).data,
                'queue': QueueSerializer(queue).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Queue.objects.all()
        elif user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            return Queue.objects.filter(appointment__doctor=user.doctor_profile)
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Queue.objects.filter(appointment__patient=user.patient_profile)
        return Queue.objects.none()

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Prescription.objects.all()
        elif user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            return Prescription.objects.filter(doctor=user.doctor_profile)
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Prescription.objects.filter(appointment__patient=user.patient_profile)
        return Prescription.objects.none()

    @action(detail=False, methods=['post'], url_path='create')
    def create_prescription(self, request):
        data = request.data
        appointment_id = data.get('appointment')
        doctor_id = data.get('doctor')
        notes = data.get('notes', '')
        medicines_data = data.get('medicines', []) # list of dict: {medicine_id, dosage, quantity}
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            doctor = Doctor.objects.get(id=doctor_id)
        except (Appointment.DoesNotExist, Doctor.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        prescription = Prescription.objects.create(
            appointment=appointment,
            doctor=doctor,
            notes=notes
        )
        
        total_bill_amount = 0
        
        for item in medicines_data:
            medicine = Medicine.objects.get(id=item['medicine_id'])
            quantity = int(item['quantity'])
            
            # Reduce stock
            if medicine.stock_quantity >= quantity:
                medicine.stock_quantity -= quantity
                medicine.save()
            else:
                return Response({'error': f'Not enough stock for {medicine.name}'}, status=status.HTTP_400_BAD_REQUEST)
                
            PrescriptionMedicine.objects.create(
                prescription=prescription,
                medicine=medicine,
                dosage=item['dosage'],
                quantity=quantity
            )
            
            total_bill_amount += (medicine.price * quantity)
            
        # Add consultation fee (assuming fixed 500)
        total_bill_amount += 500
            
        # Automatically generate Bill
        bill = Bill.objects.create(
            patient=appointment.patient,
            appointment=appointment,
            amount=total_bill_amount
        )
        
        # Mark appointment as completed
        appointment.status = 'COMPLETED'
        appointment.save()
        
        return Response({
            'prescription': PrescriptionSerializer(prescription).data,
            'bill': BillSerializer(bill).data
        }, status=status.HTTP_201_CREATED)


class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Bill.objects.all()
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Bill.objects.filter(patient=user.patient_profile)
        return Bill.objects.none()

    @action(detail=True, methods=['post'], url_path='pay')
    def pay_bill(self, request, pk=None):
        try:
            bill = self.get_object()
            bill.status = 'PAID'
            bill.save()
            return Response({'status': 'Bill paid successfully', 'bill': BillSerializer(bill).data})
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Feedback.objects.all()
        elif user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            return Feedback.objects.filter(doctor=user.doctor_profile)
        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            return Feedback.objects.filter(patient=user.patient_profile)
        return Feedback.objects.none()
