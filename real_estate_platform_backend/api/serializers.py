from rest_framework import serializers

from api.models import Client, Realtor, Property, Offer, Demand, Deal


class ClientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Client
		fields = '__all__'


class RealtorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Realtor
		fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
	full_address = serializers.CharField(source='get_full_address', read_only=True)

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
			if any(data.get(field) is not None for field in ["floor", "total_floors", "rooms"]):
				raise serializers.ValidationError(
					"Земельный участок не может иметь поля 'этаж', 'этажность дома' или 'количество комнат'"
				)

		return data


class OfferSerializer(serializers.ModelSerializer):
	client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
	property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())
	realtor = serializers.PrimaryKeyRelatedField(
		queryset=Realtor.objects.all(), required=False, allow_null=True
	)

	class Meta:
		model = Offer
		fields = ('id', 'price', 'status', 'created_at', 'client', 'property', 'realtor', 'fulfilled')
		read_only_fields = ('status', 'created_at', 'fulfilled')

	def validate_price(self, value):
		# Здесь можно добавить дополнительную логику проверки цены
		if value <= 0:
			raise serializers.ValidationError("Цена должна быть положительной")
		return value

	def validate_client(self, value):
		if not value:
			raise serializers.ValidationError("Клиент обязателен")
		return value

	def to_representation(self, instance):
		representation = super().to_representation(instance)
		# Преобразуем числовые id в вложенные объекты при выводе
		representation['client'] = ClientSerializer(instance.client).data
		representation['property'] = PropertySerializer(instance.property).data
		representation['realtor'] = (
			RealtorSerializer(instance.realtor).data if instance.realtor else None
		)
		return representation


class DemandSerializer(serializers.ModelSerializer):
	client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
	realtor = serializers.PrimaryKeyRelatedField(queryset=Realtor.objects.all(), required=True, allow_null=False)
	address = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())

	class Meta:
		model = Demand
		fields = '__all__'
		read_only_fields = ('created_at', 'fulfilled')

	def validate(self, data):
		if data['min_price'] >= data['max_price']:
			raise serializers.ValidationError("Минимальная цена должна быть меньше максимальной")

		# Дополнительная проверка может быть оставлена только для проверки корректности, но не обязательности:
		# Например, если поле указано, оно должно быть положительным:
		for field in ['min_area', 'max_area', 'min_rooms', 'max_rooms', 'min_floor', 'max_floor',
		              'min_total_floors', 'max_total_floors']:
			value = data.get(field)
			if value is not None and value <= 0:
				raise serializers.ValidationError({field: "Значение должно быть положительным"})
		return data

	def to_representation(self, instance):
		representation = super().to_representation(instance)
		representation['client'] = ClientSerializer(instance.client).data
		representation['realtor'] = RealtorSerializer(instance.realtor).data
		representation['address'] = PropertySerializer(instance.address).data
		return representation


class DealSerializer(serializers.ModelSerializer):
	offer_details = serializers.SerializerMethodField()
	demand_details = serializers.SerializerMethodField()

	class Meta:
		model = Deal
		fields = '__all__'
		read_only_fields = (
			'seller_fee',
			'buyer_fee',
			'company_share',
			'realtor_share',
			'created_at'
		)

	def create(self, validated_data):
		deal = Deal(**validated_data)
		# Не нужно вызывать full_clean() здесь, если save() вызовет его
		deal.save()
		return deal

	def get_offer_details(self, obj):
		return {
			"id": obj.offer.id,
			"price": obj.offer.price,
			"property": obj.offer.property.get_full_address()
		}

	def get_demand_details(self, obj):
		return {
			"id": obj.demand.id,
			"min_price": obj.demand.min_price,
			"max_price": obj.demand.max_price,
			"property_type": obj.demand.property_type,
		}
