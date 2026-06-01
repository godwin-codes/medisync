from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, DoctorViewSet, PatientViewSet, AppointmentViewSet, 
    QueueViewSet, MedicineViewSet, PrescriptionViewSet, BillViewSet, FeedbackViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'queues', QueueViewSet, basename='queue')
router.register(r'medicines', MedicineViewSet)
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'bills', BillViewSet, basename='bill')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

from .auth_views import LoginView, RegisterView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
