from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Doctor, Patient
from .serializers import UserSerializer

class RegisterView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        # Only Patients can self-register right now
        role = 'PATIENT'

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email, role=role)
        
        # When a user registers, create a blank Patient profile automatically
        Patient.objects.create(
            user=user,
            name=username,
            age=0,
            gender='Other',
            phone='',
            address=''
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)

            # Return additional profile info depending on role
            profile_id = None
            if user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
                 profile_id = user.doctor_profile.id
            elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
                 profile_id = user.patient_profile.id

            return Response({
                'user': UserSerializer(user).data,
                'profile_id': profile_id,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
