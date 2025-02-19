from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ClientViewSet, RealtorViewSet, PropertyViewSet, OfferViewSet, DemandViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'realtors', RealtorViewSet)
router.register(r'properties', PropertyViewSet)
router.register(r'offers', OfferViewSet)
router.register(r'demands', DemandViewSet)

urlpatterns = [
	path('', include(router.urls)),
]
