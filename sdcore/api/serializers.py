from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Order, OrderDetail, Customer, Product


class ReadUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class UpdateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            "stage",
            "product_total",
            "tax",
            "total_amount",
            "currency",
            "purchase_order",
            "alert",
            "sold_to",
            "ship_to",
            "bill_to",
            "requested_delivery_date",
        )


class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"