from rest_framework import serializers

from api.models import Client, Realtor


class ClientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Client
		fields = '__all__'


class RealtorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Realtor
		fields = '__all__'
