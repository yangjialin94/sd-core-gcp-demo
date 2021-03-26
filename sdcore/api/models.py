from django.db import models

# Create your models here.
class Order(models.Model):
    stage = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=100, blank=True)
    created_by = models.CharField(max_length=100, blank=True)
    sap_order_number = models.CharField(
        max_length=100, blank=False, null=False, unique=True
    )
    product_total = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    tax = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    currency = models.CharField(max_length=100, blank=True)
    purchase_order = models.CharField(max_length=100, blank=True)
    alert = models.IntegerField(default=0)
    alert_message = models.CharField(max_length=100, blank=True)
    sold_to = models.CharField(max_length=100, blank=True)
    ship_to = models.CharField(max_length=100, blank=True)
    bill_to = models.CharField(max_length=100, blank=True)
    created_on = models.BigIntegerField(default=0)
    requested_delivery_date = models.BigIntegerField(default=0, null=True)

    def __str__(self) -> str:
        return self.sap_order_number


class OrderDetail(models.Model):
    sap_order_number = models.CharField(max_length=100, default="")
    name = models.CharField(max_length=100, default="")
    number = models.CharField(max_length=100, default="")
    description = models.CharField(max_length=100, blank=False, default="")
    quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    uom = models.CharField(max_length=100, default="")
    subtotal = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    tax = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    currency = models.CharField(max_length=100, default="")
    delivery_number = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(max_length=100, blank=True, default="")
    date = models.BigIntegerField(default=0)
    tracking = models.CharField(max_length=100, blank=True, default="")

    def __str__(self) -> str:
        return self.name


class Customer(models.Model):
    name = models.CharField(max_length=100, default="")
    partner_type = models.CharField(max_length=100, default="")
    address = models.CharField(max_length=80, default="")
    city = models.CharField(max_length=40, default="")
    state = models.CharField(max_length=2, default="")
    zip = models.CharField(max_length=11, default="")
    country = models.CharField(max_length=2, default="")
    email = models.CharField(max_length=241, default="")
    phone_number = models.CharField(max_length=30, default="")

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100, default="")
    number = models.CharField(max_length=18, default="")
    description = models.CharField(max_length=40, default="")
    description_language = models.CharField(max_length=1, default="")
    unit_price = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    currency = models.CharField(max_length=100, default="")
    sales_uom = models.CharField(max_length=5, default="")
    gross_weight = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    gross_weight_unit = models.CharField(max_length=3, default="")
    quantity_available = models.IntegerField(default=0)
    sold_to = models.CharField(max_length=100, blank=True)

    def __str__(self) -> str:
        return self.description
