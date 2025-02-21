from rest_framework import serializers

from api.models import Client, Realtor, Property, Offer, Demand


class ClientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Client
		fields = '__all__'


class RealtorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Realtor
		fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
	class Meta:
		model = Property
		fields = "__all__"

	def validate_latitude(self, value):
		if value is not None and (value < -90 or value > 90):
			raise serializers.ValidationError("Широта должна быть в пределах от -90 до +90")
		return value

	def validate_longitude(self, value):
		if value is not None and (value < -180 or value > 180):
			raise serializers.ValidationError("Долгота должна быть в пределах от -180 до +180")
		return value

	def validate(self, data):
		if "property_type" not in data:
			raise serializers.ValidationError("Не указан тип недвижимости")

		property_type = data["property_type"]
		if property_type == "apartment":
			if data.get("total_floors") is not None:
				raise serializers.ValidationError({"total_floors": "Квартира не может иметь поле 'этажность дома'"})
		elif property_type == "house":
			if data.get("floor") is not None:
				raise serializers.ValidationError({"floor": "Дом не может иметь поле 'этаж'"})
		elif property_type == "land":
			if any(field in data for field in ["floor", "total_floors", "rooms"]):
				raise serializers.ValidationError(
					"Земельный участок не может иметь поля 'этаж', 'этажность дома' или 'количество комнат'")

		return data


class OfferSerializer(serializers.ModelSerializer):
	class Meta:
		model = Offer
		fields = '__all__'

	def validate_price(self, value):
		"""Проверка цены предложения"""
		property_instance = self.instance.property if self.instance else self.initial_data.get('property')
		if property_instance and property_instance.price != value:
			raise serializers.ValidationError("Цена предложения должна совпадать с ценой недвижимости")
		if value <= 0:
			raise serializers.ValidationError("Цена должна быть положительной")
		return value

	def validate_client(self, value):
		"""Клиент обязателен"""
		if not value:
			raise serializers.ValidationError("Клиент обязателен")
		return value


class DemandSerializer(serializers.ModelSerializer):
	class Meta:
		model = Demand
		fields = '__all__'

	def validate(self, data):
		"""Проверка диапазона цен"""
		if data['min_price'] >= data['max_price']:
			raise serializers.ValidationError("Минимальная цена должна быть меньше максимальной")
		return data
