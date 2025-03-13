from django.core.exceptions import ValidationError
from django.db import models


class Client(models.Model):
	last_name = models.CharField(max_length=100, blank=True, null=True)
	first_name = models.CharField(max_length=100, blank=True, null=True)
	middle_name = models.CharField(max_length=100, blank=True, null=True)
	phone_number = models.CharField(max_length=20, blank=True, null=True)
	email = models.EmailField(blank=True, null=True)

	def save(self, *args, **kwargs):
		if not self.phone_number and not self.email:
			raise ValueError("Должен быть указан хотя бы номер телефона или email")
		super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.last_name or ''} {self.first_name or ''} {self.middle_name or ''}".strip()


class Realtor(models.Model):
	last_name = models.CharField(max_length=100)
	first_name = models.CharField(max_length=100)
	middle_name = models.CharField(max_length=100)
	commission_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

	def __str__(self):
		return f"{self.last_name} {self.first_name} {self.middle_name}"


class Property(models.Model):
	"""Модель объекта недвижимости"""
	# title = models.CharField(max_length=255)
	# description = models.TextField(blank=True, null=True)
	# price = models.DecimalField(max_digits=12, decimal_places=2)

	# Адресные данные
	city = models.CharField(max_length=100, blank=True, null=True)
	street = models.CharField(max_length=100, blank=True, null=True)
	house_number = models.CharField(max_length=10, blank=True, null=True)
	apartment_number = models.CharField(max_length=10, blank=True, null=True)

	# Координаты
	latitude = models.FloatField(blank=True, null=True)
	longitude = models.FloatField(blank=True, null=True)

	# Тип недвижимости
	property_type = models.CharField(
		max_length=50,
		choices=[
			("apartment", "Квартира"),
			("house", "Дом"),
			("land", "Земля"),
		],
	)

	# Специфические поля
	floor = models.PositiveIntegerField(blank=True, null=True)  # Только для квартир
	total_floors = models.PositiveIntegerField(blank=True, null=True)  # Только для домов
	rooms = models.PositiveIntegerField(blank=True, null=True)  # Количество комнат (для квартир и домов)
	area = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Площадь (для всех типов)

	created_at = models.DateTimeField(auto_now_add=True)

	def clean(self):
		"""Валидация модели"""
		if self.latitude and (self.latitude < -90 or self.latitude > 90):
			raise ValidationError("Широта должна быть в пределах от -90 до +90")
		if self.longitude and (self.longitude < -180 or self.longitude > 180):
			raise ValidationError("Долгота должна быть в пределах от -180 до +180")

		# Проверяем соответствие полей типу недвижимости
		if self.property_type == "apartment":
			if self.total_floors is not None:
				raise ValidationError("Квартира не может иметь поле 'этажность дома'")
		elif self.property_type == "house":
			if self.floor is not None:
				raise ValidationError("Дом не может иметь поле 'этаж'")
		elif self.property_type == "land":
			if self.floor is not None or self.total_floors is not None or self.rooms is not None:
				raise ValidationError(
					"Земельный участок не может иметь поля 'этаж', 'этажность дома' или 'количество комнат'")

	def delete(self, *args, **kwargs):
		"""Запрещаем удаление, если объект связан с предложением"""
		if self.offer_set.exists():
			raise ValidationError("Нельзя удалить объект недвижимости, связанный с предложением")
		super().delete(*args, **kwargs)

	def get_full_address(self):
		"""Возвращает полный адрес объекта недвижимости"""
		parts = []
		if self.city:
			parts.append(self.city)
		if self.street:
			parts.append(self.street)
		if self.house_number:
			parts.append("д. " + self.house_number)
		if self.apartment_number:
			parts.append("кв. " + self.apartment_number)
		return ", ".join(parts)

	def __str__(self):
		return f"{self.city}, {self.street}, {self.house_number} ({self.property_type})"


class Offer(models.Model):
	"""Предложение (продажа недвижимости)"""
	client = models.ForeignKey('Client', on_delete=models.CASCADE)
	property = models.ForeignKey(Property, on_delete=models.CASCADE)
	realtor = models.ForeignKey('Realtor', on_delete=models.SET_NULL, null=True, blank=True)
	# Цена – целое положительное число
	price = models.PositiveIntegerField()
	status = models.CharField(
		max_length=50,
		choices=[('active', 'Активно'), ('closed', 'Закрыто')],
		default='active'
	)
	created_at = models.DateTimeField(auto_now_add=True)
	fulfilled = models.BooleanField(default=False)

	def clean(self):
		if self.price <= 0:
			raise ValidationError("Цена предложения должна быть положительной")
		if not self.client:
			raise ValidationError("Клиент обязателен для предложения")

	def save(self, *args, **kwargs):
		self.clean()
		super().save(*args, **kwargs)

	def delete(self, *args, **kwargs):
		# Если предложение участвует в сделке (например, имеет статус closed) – удаление запрещено
		if self.status == 'closed':
			raise ValidationError("Нельзя удалить предложение, участвующее в сделке")
		super().delete(*args, **kwargs)

	def __str__(self):
		return f"Предложение {self.client} - {self.property} за {self.price} руб."


class Demand(models.Model):
	"""Потребность (покупка недвижимости)"""
	client = models.ForeignKey('Client', on_delete=models.CASCADE)
	realtor = models.ForeignKey('Realtor', on_delete=models.SET_NULL, null=True, blank=True)
	# Тип объекта – только квартира, дом или земля
	property_type = models.CharField(
		max_length=50,
		choices=[('apartment', 'Квартира'), ('house', 'Дом'), ('land', 'Земля')]
	)
	address = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, blank=True)  # Обязательное поле адреса
	min_price = models.PositiveIntegerField()
	max_price = models.PositiveIntegerField()
	created_at = models.DateTimeField(auto_now_add=True)
	fulfilled = models.BooleanField(default=False)

	# Дополнительные поля для квартиры
	min_area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
	max_area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
	min_rooms = models.PositiveIntegerField(null=True, blank=True)
	max_rooms = models.PositiveIntegerField(null=True, blank=True)
	min_floor = models.PositiveIntegerField(null=True, blank=True)
	max_floor = models.PositiveIntegerField(null=True, blank=True)

	# Дополнительные поля для дома
	min_total_floors = models.PositiveIntegerField(null=True, blank=True)
	max_total_floors = models.PositiveIntegerField(null=True, blank=True)

	def clean(self):
		if self.min_price <= 0 or self.max_price <= 0:
			raise ValidationError("Минимальная и максимальная цена должны быть положительными")
		if self.min_price >= self.max_price:
			raise ValidationError("Минимальная цена должна быть меньше максимальной")

		# Дополнительная валидация дополнительных полей можно оставить по желанию, но ошибки за отсутствие не выбрасывать.
		# Например, если значение указано, оно должно быть положительным:
		for field in ['min_area', 'max_area', 'min_rooms', 'max_rooms', 'min_floor', 'max_floor',
		              'min_total_floors', 'max_total_floors']:
			value = getattr(self, field)
			if value is not None and value <= 0:
				raise ValidationError({field: "Значение должно быть положительным"})

	def save(self, *args, **kwargs):
		self.clean()
		super().save(*args, **kwargs)

	def delete(self, *args, **kwargs):
		# Здесь можно реализовать проверку – если потребность участвует в сделке, удаление запрещено.
		# Например, если будет связь с моделью Deal:
		# if self.deal_set.exists():
		#     raise ValidationError("Нельзя удалить потребность, участвующую в сделке")
		super().delete(*args, **kwargs)

	def __str__(self):
		return f"Потребность клиента {self.client}: {self.property_type} от {self.min_price} до {self.max_price} руб."


class Deal(models.Model):
	offer = models.OneToOneField('Offer', on_delete=models.PROTECT, related_name='deal')
	demand = models.OneToOneField('Demand', on_delete=models.PROTECT, related_name='deal')
	created_at = models.DateTimeField(auto_now_add=True)

	# Комиссии – разрешаем null и blank, так как они вычисляются на сервере
	seller_fee = models.PositiveIntegerField(null=True, blank=True)
	buyer_fee = models.PositiveIntegerField(null=True, blank=True)
	company_share = models.PositiveIntegerField(null=True, blank=True)
	realtor_share = models.PositiveIntegerField(null=True, blank=True)

	def clean(self):
		if Deal.objects.filter(offer=self.offer).exclude(pk=self.pk).exists():
			raise ValidationError("Сделка уже создана для данного предложения.")
		if Deal.objects.filter(demand=self.demand).exclude(pk=self.pk).exists():
			raise ValidationError("Сделка уже создана для данной потребности.")
		self.calculate_fees()

	def calculate_fees(self):
		property_type = self.offer.property.property_type
		price = self.offer.price

		if property_type == 'apartment':
			self.seller_fee = int(36000 + price * 0.01)
		elif property_type == 'land':
			self.seller_fee = int(30000 + price * 0.02)
		elif property_type == 'house':
			self.seller_fee = int(30000 + price * 0.01)

		self.buyer_fee = int(price * 0.03)
		total_fee = self.seller_fee + self.buyer_fee

		realtor = self.offer.realtor
		realtor_percentage = realtor.commission_rate if realtor and realtor.commission_rate else 45
		self.realtor_share = int(total_fee * (realtor_percentage / 100))
		self.company_share = total_fee - self.realtor_share

	def save(self, *args, **kwargs):
		self.full_clean()
		self.calculate_fees()
		# Сначала сохраняем сделку
		super().save(*args, **kwargs)
		# Потом обновляем флаги fulfilled у связанных объектов
		self.offer.fulfilled = True
		self.offer.save(update_fields=["fulfilled"])
		self.demand.fulfilled = True
		self.demand.save(update_fields=["fulfilled"])

	def delete(self, *args, **kwargs):
		# Сбрасываем флаги у связанных объектов
		self.offer.fulfilled = False
		self.offer.save(update_fields=["fulfilled"])
		self.demand.fulfilled = False
		self.demand.save(update_fields=["fulfilled"])
		super().delete(*args, **kwargs)
