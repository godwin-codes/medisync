from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsDoctorUser(permissions.BasePermission):
    """
    Allows access only to Doctor users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DOCTOR')

class IsPatientUser(permissions.BasePermission):
    """
    Allows access only to Patient users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PATIENT')

class IsAdminOrDoctor(permissions.BasePermission):
    """
    Allows access to both Admins and Doctors.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'DOCTOR'])
