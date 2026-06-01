from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import uuid

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT')
    created_at = models.DateTimeField(auto_now_add=True)

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile', null=True, blank=True)
    doctor_code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    
    def save(self, *args, **kwargs):
        if not self.doctor_code:
            self.doctor_code = f"TEMP-{uuid.uuid4()}"
            super().save(*args, **kwargs)
            self.doctor_code = f"DOC{self.id:04d}"
            kwargs.pop('force_insert', None)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.specialization}"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    patient_code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=(('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')))
    phone = models.CharField(max_length=20)
    address = models.TextField()

    def save(self, *args, **kwargs):
        if not self.patient_code:
            self.patient_code = f"TEMP-{uuid.uuid4()}"
            super().save(*args, **kwargs)
            self.patient_code = f"PAT{self.id:04d}"
            kwargs.pop('force_insert', None)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('BOOKED', 'Booked'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BOOKED')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['patient', 'appointment_date', 'appointment_time'], name='unique_patient_appointment'),
            models.UniqueConstraint(fields=['doctor', 'appointment_date', 'appointment_time'], name='unique_doctor_appointment'),
        ]

    def __str__(self):
        return f"{self.patient.name} with {self.doctor.name} on {self.appointment_date}"

class Queue(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='queue')
    queue_number = models.IntegerField()
    estimated_wait_time = models.IntegerField(help_text="Estimated wait time in minutes")

    def __str__(self):
        return f"Queue {self.queue_number} for {self.appointment.patient.name}"

class Medicine(models.Model):
    medicine_code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.medicine_code:
            self.medicine_code = f"TEMP-{uuid.uuid4()}"
            super().save(*args, **kwargs)
            self.medicine_code = f"MED{self.id:04d}"
            kwargs.pop('force_insert', None)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    prescription_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Prescription for {self.appointment.patient.name} on {self.prescription_date}"

class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medicines')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.medicine.name} - {self.quantity}"

class Bill(models.Model):
    STATUS_CHOICES = (
        ('PAID', 'Paid'),
        ('UNPAID', 'Unpaid'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, related_name='bills')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='UNPAID')

    def __str__(self):
        return f"Bill {self.id} for {self.patient.name} - {self.amount}"

class Feedback(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='feedbacks')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.patient.name} for {self.doctor.name} ({self.rating}/5)"
