from django.urls import path
from .views import *

urlpatterns = [
    path('search/', search, name='search'),
    path('nifty50/', get_NIFTY_50, name='get_NIFTY_50')

]
