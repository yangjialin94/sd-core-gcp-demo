from django.urls import path
from .views import (
    CreateOrder,
    CreateOrderDetails,
    #
    ReadUser,
    ReadOrders,
    ReadOrder,
    ReadOrderDetail,
    ReadCustomer,
    ReadProduct,
    #
    UpdateOrder,
    UpdateOrderDetails,
    #
    OrderView,
    CustomerView,
    ProductView,
    DeleteOrder,
    DeleteOrderDetail,
)

app_name = "api"
urlpatterns = [
    path("create-order", CreateOrder.as_view()),
    path("create-order_details", CreateOrderDetails.as_view()),
    #
    path("read-user", ReadUser.as_view()),
    path("read-orders", ReadOrders.as_view()),
    path("read-order", ReadOrder.as_view()),
    path("read-order_detail", ReadOrderDetail.as_view()),
    path("read-customer", ReadCustomer.as_view()),
    path("read-product", ReadProduct.as_view()),
    #
    path("update-order", UpdateOrder.as_view()),
    path("update-order_detail", UpdateOrderDetails.as_view()),
    #
    path("order", OrderView.as_view()),
    path("customer", CustomerView.as_view()),
    path("product", ProductView.as_view()),
    path("delete-order", DeleteOrder.as_view()),
    path("delete-order_detail", DeleteOrderDetail.as_view()),
]
