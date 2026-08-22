from django.db import models
from django.conf import settings
# Create your models here.

class Warehouse(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='warehouse')
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=300)
    longitude = models.DecimalField(max_digits=9,decimal_places=6,blank = True)
    latitude = models.DecimalField(max_digits=9,decimal_places=6, blank = True)
