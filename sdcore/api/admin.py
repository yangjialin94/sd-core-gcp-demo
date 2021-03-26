from django.contrib import admin
from .models import Order, OrderDetail, Customer, Product

# change admin header
admin.site.site_header = "SD Core Admin"
admin.site.site_title = "SD Core Admin Area"
admin.site.index_title = "Welcome to the SD Core admin area"

# Register your models here.
admin.site.register(Order)
admin.site.register(OrderDetail)
admin.site.register(Customer)
admin.site.register(Product)
