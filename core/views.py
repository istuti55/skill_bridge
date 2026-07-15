from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserRegisterSerializer, UserSerializer
import fitz  # PyMuPDF
from .ai_service import extract_cv_data


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password_hash):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Candidate
import os
from django.conf import settings


class CVUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('cv_file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.pdf'):
            return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

        # Save file to media/cvs/
        save_dir = os.path.join(settings.MEDIA_ROOT, 'cvs')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Update the candidate's profile with the file path
        candidate = Candidate.objects.get(user=request.user)
        candidate.cv_file_path = f'media/cvs/{file.name}'
        candidate.save()
        # Extract text from PDF
        doc = fitz.open(file_path)
        resume_text = ""
        for page in doc:
            resume_text += page.get_text()
        doc.close()

        # Send to Ollama for structured extraction
        ai_result = extract_cv_data(resume_text)

        candidate.extracted_skills = ai_result.get('skills', [])
        candidate.education = ai_result.get('education', [])
        candidate.experience_years = ai_result.get('experience_years', 0)
        candidate.save()

        return Response({
            'message': 'CV uploaded successfully',
            'cv_file_path': candidate.cv_file_path
        }, status=status.HTTP_200_OK)