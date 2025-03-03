from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Client, Realtor, Property, Offer, Demand
from .serializers import ClientSerializer, RealtorSerializer, PropertySerializer, OfferSerializer, DemandSerializer


class ClientViewSet(viewsets.ModelViewSet):
	queryset = Client.objects.all()
	serializer_class = ClientSerializer

	def update(self, request, *args, **kwargs):
		"""Обновление клиента"""
		client = get_object_or_404(Client, pk=kwargs["pk"])
		serializer = self.get_serializer(client, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def destroy(self, request, *args, **kwargs):
		"""Удаление клиента"""
		client = get_object_or_404(Client, pk=kwargs["pk"])
		client.delete()
		return Response({"message": "Клиент удалён"}, status=status.HTTP_204_NO_CONTENT)

	@action(detail=True, methods=['get'])
	def related(self, request, pk=None):
		client = self.get_object()
		offers = Offer.objects.filter(client=client)
		demands = Demand.objects.filter(client=client)
		data = {
			"offers": OfferSerializer(offers, many=True).data,
			"demands": DemandSerializer(demands, many=True).data,
		}
		return Response(data, status=status.HTTP_200_OK)


class RealtorViewSet(viewsets.ModelViewSet):
	queryset = Realtor.objects.all()
	serializer_class = RealtorSerializer

	def update(self, request, *args, **kwargs):
		"""Обновление риэлтора"""
		realtor = get_object_or_404(Realtor, pk=kwargs["pk"])
		serializer = self.get_serializer(realtor, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def destroy(self, request, *args, **kwargs):
		"""Удаление риэлтора"""
		realtor = get_object_or_404(Realtor, pk=kwargs["pk"])
		realtor.delete()
		return Response({"message": "Риэлтор удалён"}, status=status.HTTP_204_NO_CONTENT)

	@action(detail=True, methods=['get'])
	def related(self, request, pk=None):
		realtor = self.get_object()
		offers = Offer.objects.filter(realtor=realtor)
		demands = Demand.objects.filter(realtor=realtor)
		data = {
			"offers": OfferSerializer(offers, many=True).data,
			"demands": DemandSerializer(demands, many=True).data,
		}
		return Response(data, status=status.HTTP_200_OK)


class PropertyViewSet(viewsets.ModelViewSet):
	"""API для объектов недвижимости"""
	queryset = Property.objects.all()
	serializer_class = PropertySerializer


class OfferViewSet(viewsets.ModelViewSet):
	"""API для предложений"""
	queryset = Offer.objects.all()
	serializer_class = OfferSerializer


class DemandViewSet(viewsets.ModelViewSet):
	"""API для потребностей"""
	queryset = Demand.objects.all()
	serializer_class = DemandSerializer
