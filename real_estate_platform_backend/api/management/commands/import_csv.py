import csv

from django.core.management.base import BaseCommand

from api.models import Client, Realtor


class Command(BaseCommand):
	help = "Импортирует клиентов и риэлторов из CSV"

	def handle(self, *args, **kwargs):
		self.import_clients('/app/api/management/commands/csv/clients.csv')
		self.import_realtors('/app/api/management/commands/csv/agents.csv')

	def import_clients(self, file_path):
		with open(file_path, encoding='utf-8') as file:
			reader = csv.DictReader(file, delimiter=',')
			for row in reader:
				client, created = Client.objects.get_or_create(
					last_name=row.get("LastName", "").strip() or None,
					first_name=row.get("FirstName", "").strip() or None,
					middle_name=row.get("MiddleName", "").strip() or None,
					phone_number=row.get("Phone", "").strip() or None,
					email=row.get("Email", "").strip() or None,
				)
				if created:
					self.stdout.write(self.style.SUCCESS(f"Добавлен клиент: {client}"))
				else:
					self.stdout.write(self.style.WARNING(f"Клиент уже существует: {client}"))

	def import_realtors(self, file_path):
		with open(file_path, encoding='utf-8') as file:
			reader = csv.DictReader(file, delimiter=',')
			for row in reader:
				realtor, created = Realtor.objects.get_or_create(
					last_name=row.get("LastName", "").strip(),
					first_name=row.get("FirstName", "").strip(),
					middle_name=row.get("MiddleName", "").strip(),
					commission_rate=float(row.get("DealShare", "0").strip() or 0),
				)
				if created:
					self.stdout.write(self.style.SUCCESS(f"Добавлен риэлтор: {realtor}"))
				else:
					self.stdout.write(self.style.WARNING(f"Риэлтор уже существует: {realtor}"))
