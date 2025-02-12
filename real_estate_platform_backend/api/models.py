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
