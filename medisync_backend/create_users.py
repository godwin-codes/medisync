import os
import django
import sys

sys.path.append('C:\\Users\\GODWIN K BENNY\\OneDrive\\Desktop\\scratch\\medisync_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisync_backend.settings')
django.setup()

from hospital.models import User, Doctor, Patient
from django.db import transaction

@transaction.atomic
def generate_users():
    print("Generating User accounts for Doctors and Patients...")

    # Create an Admin User
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@medisync.com", "admin123", role="ADMIN")
        print("Created Admin user (admin / admin123)")

    # Create Users for Doctors
    for doctor in Doctor.objects.all():
        if not doctor.user:
            username = doctor.email.split('@')[0]
            password = "doctorpassword"
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User.objects.create_user(username=username, email=doctor.email, password=password, role="DOCTOR")
            doctor.user = user
            doctor.save(update_fields=['user'])
            print(f"Created user for Doctor {doctor.name} ({username} / {password})")

    # Create Users for Patients
    for patient in Patient.objects.all():
        if not patient.user:
            username = patient.name.lower().replace(' ', '.')
            password = "patientpassword"
            
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User.objects.create_user(username=username, password=password, role="PATIENT")
            patient.user = user
            patient.save(update_fields=['user'])
            print(f"Created user for Patient {patient.name} ({username} / {password})")

    print("Successfully linked all profiles to User accounts!")

if __name__ == '__main__':
    generate_users()
