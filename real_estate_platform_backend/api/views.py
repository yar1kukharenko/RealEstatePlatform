from rest_framework import viewsets

from api.models import Client, Realtor
from .serializers import ClientSerializer, RealtorSerializer


class ClientViewSet(viewsets.ModelViewSet):
	queryset = Client.objects.all()
	serializer_class = ClientSerializer


class RealtorViewSet(viewsets.ModelViewSet):
	queryset = Realtor.objects.all()
	serializer_class = RealtorSerializer
