from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Client, Realtor, Property, Offer, Demand, Deal
from .serializers import ClientSerializer, RealtorSerializer, PropertySerializer, OfferSerializer, DemandSerializer, \
	DealSerializer


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

	@action(detail=True, methods=['get'])
	def search_demands(self, request, pk=None):
		"""Ищем потребности, которые может удовлетворить предложение"""
		offer = self.get_object()

		# Базовый фильтр: совпадение по типу, цене и fulfilled=False
		demands = Demand.objects.filter(
			property_type=offer.property.property_type,
			min_price__lte=offer.price,
			max_price__gte=offer.price,
			fulfilled=False
		)

		# Фильтруем по адресу, если в offer.property есть ID
		if offer.property_id:
			demands = demands.filter(address=offer.property)

		# Дополнительные проверки для квартир/домов
		# 1. Проверка комнат (rooms)
		if offer.property.property_type in ["apartment", "house"]:
			# Если у объекта недвижимости вообще указано rooms
			if offer.property.rooms is not None:
				# Ищем все demand, где либо min_rooms не заполнено, либо min_rooms <= offer.property.rooms
				# И аналогично max_rooms
				demands = demands.filter(
					Q(min_rooms__isnull=True) | Q(min_rooms__lte=offer.property.rooms),
					Q(max_rooms__isnull=True) | Q(max_rooms__gte=offer.property.rooms),
				)

		# 2. Проверка этажей (floor) - только для apartment
		if offer.property.property_type == "apartment":
			if offer.property.floor is not None:
				demands = demands.filter(
					Q(min_floor__isnull=True) | Q(min_floor__lte=offer.property.floor),
					Q(max_floor__isnull=True) | Q(max_floor__gte=offer.property.floor),
				)

		# 3. Проверка этажности (total_floors) - только для house
		if offer.property.property_type == "house":
			if offer.property.total_floors is not None:
				demands = demands.filter(
					Q(min_total_floors__isnull=True) | Q(min_total_floors__lte=offer.property.total_floors),
					Q(max_total_floors__isnull=True) | Q(max_total_floors__gte=offer.property.total_floors),
				)

		return Response(DemandSerializer(demands, many=True).data, status=status.HTTP_200_OK)


class DemandViewSet(viewsets.ModelViewSet):
	"""API для потребностей"""
	queryset = Demand.objects.all()
	serializer_class = DemandSerializer

	@action(detail=True, methods=['get'])
	def search_offers(self, request, pk=None):
		"""Ищем предложения, подходящие под потребность"""
		demand = self.get_object()

		# Базовый фильтр: совпадение по типу, цене и fulfilled=False
		offers = Offer.objects.filter(
			property__property_type=demand.property_type,
			price__gte=demand.min_price,
			price__lte=demand.max_price,
			fulfilled=False
		)

		# Фильтруем по адресу, если в demand.address есть ID
		if demand.address_id:
			offers = offers.filter(property=demand.address)

		# Дополнительные проверки для квартир/домов
		# 1. Проверка комнат (rooms)
		if demand.property_type in ["apartment", "house"]:
			# Применяем фильтр, только если min_rooms/max_rooms заданы
			if demand.min_rooms is not None:
				offers = offers.filter(
					Q(property__rooms__isnull=True) | Q(property__rooms__gte=demand.min_rooms)
				)
			if demand.max_rooms is not None:
				offers = offers.filter(
					Q(property__rooms__isnull=True) | Q(property__rooms__lte=demand.max_rooms)
				)

		# 2. Проверка этажей (floor) - только для apartment
		if demand.property_type == "apartment":
			if demand.min_floor is not None:
				offers = offers.filter(
					Q(property__floor__isnull=True) | Q(property__floor__gte=demand.min_floor)
				)
			if demand.max_floor is not None:
				offers = offers.filter(
					Q(property__floor__isnull=True) | Q(property__floor__lte=demand.max_floor)
				)

		# 3. Проверка этажности (total_floors) - только для house
		if demand.property_type == "house":
			if demand.min_total_floors is not None:
				offers = offers.filter(
					Q(property__total_floors__isnull=True) | Q(property__total_floors__gte=demand.min_total_floors)
				)
			if demand.max_total_floors is not None:
				offers = offers.filter(
					Q(property__total_floors__isnull=True) | Q(property__total_floors__lte=demand.max_total_floors)
				)

		return Response(OfferSerializer(offers, many=True).data, status=status.HTTP_200_OK)


class DealViewSet(viewsets.ModelViewSet):
	"""API для сделок"""
	queryset = Deal.objects.all()
	serializer_class = DealSerializer

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		instance.delete()  # Это вызовет метод delete() модели Deal, который сбрасывает fulfilled для offer и demand
		return Response(status=status.HTTP_204_NO_CONTENT)
