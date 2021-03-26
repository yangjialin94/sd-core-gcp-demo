from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    ReadUserSerializer,
    OrderSerializer,
    UpdateOrderSerializer,
    OrderDetailSerializer,
    CustomerSerializer,
    ProductSerializer,
)
from django.contrib.auth.models import User
from .models import Order, OrderDetail, Product, Customer


# Create a new order.
class CreateOrder(APIView):
    serializer_class = OrderSerializer

    def post(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            created_by = current_user.first_name + " " + current_user.last_name   
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                order = Order(
                    stage=serializer.data.get("stage"),
                    status=serializer.data.get("status"),
                    created_by=created_by,
                    sap_order_number=serializer.data.get("sap_order_number"),
                    product_total=serializer.data.get("product_total"),
                    tax=serializer.data.get("tax"),
                    total_amount=serializer.data.get("total_amount"),
                    currency=serializer.data.get("currency"),
                    purchase_order=serializer.data.get("purchase_order"),
                    alert=serializer.data.get("alert"),
                    alert_message=serializer.data.get("alert_message"),
                    sold_to=serializer.data.get("sold_to"),
                    ship_to=serializer.data.get("ship_to"),
                    bill_to=serializer.data.get("bill_to"),
                    created_on=serializer.data.get("created_on"),
                    requested_delivery_date=serializer.data.get("requested_delivery_date"),
                )
                order.save()
                return Response(self.serializer_class(order).data, status=status.HTTP_201_CREATED)

            return Response(
                {"Bad Request": "Invalid data."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )
        

# Create new order details.
class CreateOrderDetails(APIView):
    serializer_class = OrderDetailSerializer

    def post(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            serializer = self.serializer_class(
                data=request.data.get("order_details"), many=True
            )
            if serializer.is_valid():
                for detail in serializer.data:
                    order_detail = OrderDetail(
                        sap_order_number=detail.get("sap_order_number"),
                        name=detail.get("name"),
                        number=detail.get("number"),
                        description=detail.get("description"),
                        quantity=detail.get("quantity"),
                        unit_price=detail.get("unit_price"),
                        uom=detail.get("uom"),
                        subtotal=detail.get("subtotal"),
                        tax=detail.get("tax"),
                        currency=detail.get("currency"),
                        delivery_number=detail.get("delivery_number"),
                        status=detail.get("status"),
                        date=detail.get("date"),
                        tracking=detail.get("tracking"),
                    )
                    order_detail.save()
            else:
                return Response(
                    {"Bad Request": "Invalid data."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"Message": "Order details creted successfully."},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Read user by logged in user
class ReadUser(APIView):
    serializer_class = ReadUserSerializer

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:   
            data = self.serializer_class(current_user).data
            return Response(data, status=status.HTTP_200_OK)
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Read orders by logged in user
class ReadOrders(APIView):
    serializer_class = OrderSerializer

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            created_by = current_user.first_name + " " + current_user.last_name      
            is_staff = current_user.is_staff
            if is_staff == True:
                orders = Order.objects.all()
            else:
                orders = Order.objects.filter(created_by=created_by)
            data = []
            if len(orders) > 0:
                for order in orders:
                    data.append(self.serializer_class(order).data)
            return Response(data, status=status.HTTP_200_OK)
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Read an order by sap_order_number
class ReadOrder(APIView):
    serializer_class = OrderSerializer
    lookup_url_kwarg = "sap_order_number"

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            created_by = current_user.first_name + " " + current_user.last_name
            sap_order_number = request.GET.get(self.lookup_url_kwarg)
            if sap_order_number != None:
                order = Order.objects.filter(created_by=created_by,sap_order_number=sap_order_number)
                if len(order) > 0:
                    data = self.serializer_class(order[0]).data
                    return Response(data, status=status.HTTP_200_OK)
                return Response(
                    {"Order Not Found": "Invalid order number."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {"Order Not Found": "Invalid order number."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Read order details by sap_order_number
class ReadOrderDetail(APIView):
    serializer_class = OrderDetailSerializer
    lookup_url_kwarg = "sap_order_number"

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            sap_order_number = request.GET.get(self.lookup_url_kwarg)
            if sap_order_number != None:
                data = []
                order_details = OrderDetail.objects.filter(sap_order_number=sap_order_number)
                if len(order_details) > 0:
                    for detail in order_details:
                        data.append(self.serializer_class(detail).data)
                return Response(data, status=status.HTTP_200_OK)
            return Response(
                {"Order Not Found": "Invalid order number."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )

# Read customers by partner_type
class ReadCustomer(APIView):
    serializer_class = CustomerSerializer
    lookup_url_kwarg = "partner_type"

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            partner_type = request.GET.get(self.lookup_url_kwarg)
            if partner_type != None:
                customers = Customer.objects.filter(partner_type__contains=partner_type)
                data = []
                if len(customers) > 0:
                    for customer in customers:
                        data.append(self.serializer_class(customer).data)
                    return Response(data, status=status.HTTP_200_OK)
                return Response(
                    {"Customer Not Found": "Invalid parter type."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {"Bad Request": "Parter type not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )

# Read products by sold_to
class ReadProduct(APIView):
    serializer_class = ProductSerializer
    lookup_url_kwarg = "sold_to"

    def get(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            sold_to = request.GET.get(self.lookup_url_kwarg)
            if sold_to != None:
                products = Product.objects.filter(sold_to=sold_to)
                data = []
                if len(products) > 0:
                    for product in products:
                        data.append(self.serializer_class(product).data)
                    return Response(data, status=status.HTTP_200_OK)
                return Response(
                    {"Product Not Found": "Invalid sold to."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {"Bad Request": "Sold to not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Update an order by sap_order_number
class UpdateOrder(APIView):
    serializer_class = UpdateOrderSerializer

    def patch(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            created_by = current_user.first_name + " " + current_user.last_name
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                sap_order_number = request.data.get("sap_order_number")
                queryset = Order.objects.filter(sap_order_number=sap_order_number)
                if queryset.exists():
                    order = queryset[0]
                    order.stage = serializer.data.get("stage")
                    order.created_by = created_by
                    order.product_total = serializer.data.get("product_total")
                    order.tax = serializer.data.get("tax")
                    order.total_amount = serializer.data.get("total_amount")
                    order.currency = serializer.data.get("currency")
                    order.purchase_order = serializer.data.get("purchase_order")
                    order.alert = serializer.data.get("alert")
                    order.sold_to = serializer.data.get("sold_to")
                    order.ship_to = serializer.data.get("ship_to")
                    order.bill_to = serializer.data.get("bill_to")
                    order.requested_delivery_date = serializer.data.get(
                        "requested_delivery_date"
                    )
                    order.save(
                        update_fields=[
                            "stage",
                            "created_by",
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
                        ]
                    )
                    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"Order Not Found": "Invalid order number."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            return Response(
                {"Error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Update order details by sap_order_number
class UpdateOrderDetails(APIView):
    serializer_class = OrderDetailSerializer

    def patch(self, request, format=None):
        current_user = User.objects.filter(username=request.user)[0]
        if current_user != None:
            serializer = self.serializer_class(
                data=request.data.get("order_details"), many=True
            )
            if serializer.is_valid():
                sap_order_number = sap_order_number = request.data.get("sap_order_number")
                OrderDetail.objects.filter(sap_order_number=sap_order_number).delete()
                for detail in serializer.data:
                    order_detail = OrderDetail(
                        sap_order_number=detail.get("sap_order_number"),
                        name=detail.get("name"),
                        number=detail.get("number"),
                        description=detail.get("description"),
                        quantity=detail.get("quantity"),
                        unit_price=detail.get("unit_price"),
                        uom=detail.get("uom"),
                        subtotal=detail.get("subtotal"),
                        tax=detail.get("tax"),
                        currency=detail.get("currency"),
                        delivery_number=detail.get("delivery_number"),
                        status=detail.get("status"),
                        date=detail.get("date"),
                        tracking=detail.get("tracking"),
                    )
                    order_detail.save()
            else:
                return Response(
                    {"Bad Request": "Invalid data..."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"Message": "Create Order Details Success"},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"Bad Request": "Invalid user."},
            status=status.HTTP_400_BAD_REQUEST,
        )

# Read all orders.
class OrderView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# Read all customers.
class CustomerView(generics.ListAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


# Read all products.
class ProductView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# Update an order by sap_order_number
class DeleteOrder(APIView):
    def post(self, request, format=None):
        sap_order_number = request.data.get("sap_order_number")
        queryset = Order.objects.filter(sap_order_number=sap_order_number)
        if queryset.exists():
            order = queryset[0]
            order.delete()

        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


# Update an order detail by id (pk)
class DeleteOrderDetail(APIView):
    def post(self, request, format=None):
        id = request.data.get("id")
        queryset = OrderDetail.objects.filter(id=id)
        if queryset.exists():
            order_detail = queryset[0]
            order_detail.delete()

        return Response({"Message": "Success"}, status=status.HTTP_200_OK)
