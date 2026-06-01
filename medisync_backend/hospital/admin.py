from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Doctor, Patient, Appointment, Queue, Medicine, Prescription, PrescriptionMedicine, Bill, Feedback

admin.site.register(User, UserAdmin)
admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(Queue)
admin.site.register(Medicine)
admin.site.register(Prescription)
admin.site.register(PrescriptionMedicine)
admin.site.register(Bill)
admin.site.register(Feedback)
