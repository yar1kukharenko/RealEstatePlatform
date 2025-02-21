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

	def __str__(self):
		return f"{self.title} - {self.city}, {self.street}, {self.house_number} ({self.property_type})"


class Offer(models.Model):
	"""Предложение (продажа недвижимости)"""
	client = models.ForeignKey('Client', on_delete=models.CASCADE)
	property = models.ForeignKey(Property, on_delete=models.CASCADE)
	realtor = models.ForeignKey('Realtor', on_delete=models.SET_NULL, null=True, blank=True)
	price = models.DecimalField(max_digits=12, decimal_places=2)
	status = models.CharField(max_length=50, choices=[('active', 'Активно'), ('closed', 'Закрыто')], default='active')
	created_at = models.DateTimeField(auto_now_add=True)

	def clean(self):
		"""Проверки перед сохранением"""
		if self.price <= 0:
			raise ValidationError("Цена предложения должна быть положительной")
		if not self.client:
			raise ValidationError("Клиент обязателен для предложения")
		if self.property.price != self.price:
			raise ValidationError("Цена предложения должна совпадать с ценой недвижимости")

	def save(self, *args, **kwargs):
		"""Вызов clean() перед сохранением"""
		self.clean()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Предложение {self.client} - {self.property} за {self.price} руб."


class Demand(models.Model):
	"""Потребность (покупка недвижимости)"""
	client = models.ForeignKey('Client', on_delete=models.CASCADE)
	min_price = models.DecimalField(max_digits=12, decimal_places=2)
	max_price = models.DecimalField(max_digits=12, decimal_places=2)
	property_type = models.CharField(max_length=50, choices=[('apartment', 'Квартира'), ('house', 'Дом'),
	                                                         ('commercial', 'Коммерческая')])
	realtor = models.ForeignKey('Realtor', on_delete=models.SET_NULL, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def clean(self):
		"""Проверки перед сохранением"""
		if self.min_price <= 0 or self.max_price <= 0:
			raise ValidationError("Минимальная и максимальная цена должны быть положительными")
		if self.min_price >= self.max_price:
			raise ValidationError("Минимальная цена должна быть меньше максимальной")

	def save(self, *args, **kwargs):
		"""Вызов clean() перед сохранением"""
		self.clean()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Потребность клиента {self.client}: {self.property_type} от {self.min_price} до {self.max_price} руб."
