sap.ui.define([
	"./BaseController",
	"../libs/data",
	"../model/formatter",
	"../libs/utils",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (BaseController, data, formatter, utils, Filter, MessageBox, MessageToast, Fragment) {
	"use strict";

	return BaseController.extend("sdCore.controller.Order", {
		formatter: formatter,

		/**
		 * Initialize the router.
		 */
		onInit: function () {
			this.getRouter().getRoute("Order").attachMatched(this.onRouteMatched, this);
		},

		/**
		 * Destroy all global models.
		 */
		onExit: function () {
			data.destroyGlobalModels();
		},

		/**
		 * Call function to set models.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onRouteMatched: function (oEvent) {
			let sOrderNumber = oEvent.getParameter("arguments").sap_order_number;
			this.resetModel(sOrderNumber);
		},

		/**
		 * Set models.
		 * 
		 * @param {string} sOrderNumber sap_order_number.
		 */
		resetModel: function (sOrderNumber) {
			let that = this;
			let i18n = data.getResBundle(this, "i18n");
			let oView = this.getView();
			let oOrderITB = this.getView().byId("orderITB");

			// set visibility
			oView.byId("salesITF").setVisible(true);
			oView.byId("editITF").setVisible(false);
			this.getView().byId("orderP").setShowNavButton(true);

			// get order from Django model
			data.createPromise({
				type: "GET",
				url: "/api/read-order?sap_order_number=" + sOrderNumber,
				contentType: "application/json",
				async: false
			}).then(function (oResponse) {
				// set Order model
				oResponse.ship_to_valid = true;
				oResponse.bill_to_valid = true;
				oResponse.requested_delivery_date_valid = true;
				oResponse.purchase_order_valid = true;
				data.setModel(null, oResponse, oView, "Order");
				oOrderITB.setSelectedKey(oResponse.stage);

				// get order items from Django model
				return data.createPromise({
					type: "GET",
					url: "/api/read-order_detail?sap_order_number=" + sOrderNumber,
					contentType: "application/json",
					async: false
				});
			}).then(function (oResponse) {
				// set Item model
				let oData = {
					count: oResponse.length,
					results: oResponse
				}
				data.setModel(null, oData, oView, "Item");
				
			}).catch(function (oError) {
				// show error message box
				MessageBox.confirm(JSON.stringify(oError), {
					title: i18n.getText("title.error"),
					actions: [
						MessageBox.Action.OK
					],
					emphasizedAction: MessageBox.Action.OK
				});
			});
		},

		/**
		 * Navigate to sales overview page.
		 */
		onNavBack: function () {
			utils.navTo({}, this, "Home");
		},

		/************************************************ Sales/Shipping/Billing Form ************************************************/

		/**
		 * Navigate to overview page and filter order by created_by.
		 * 
		 * @param {object} oEvent evnet triggered.
		 */
		onFilterCreatedBy: function (oEvent) {
			sessionStorage.setItem("onFilterCreatedBy", oEvent.getSource().getCustomData()[0].getValue());
			utils.navTo({}, this, "Home");
		},

		/************************************************ Sales Item Table Footer ************************************************/

		/**
		 * Hide read sales tab and show edit sales tab.
		 */
		onEdit: function () {
			this.getView().byId("salesITF").setVisible(false);
			this.getView().byId("editITF").setVisible(true);
			this.getView().byId("orderP").setShowNavButton(false);
		},

		/**
		 * Save data to sessionStorage and navigate to New page.
		 */
		onBuyAgain: function () {
			sessionStorage.setItem("sap_order_number", this.getView().getModel("Order").getData().sap_order_number);
			utils.navTo({}, this, "New");
		},

		/************************************************ Edit Sales Form ************************************************/

		/**
		 * Open the customer fragment.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onSelectCustomer: function (oEvent) {
			let sCustomerType = oEvent.getSource().getCustomData()[0].getValue();
			let that = this;

			// get customer from Django model
			data.createPromise({
				type: "GET",
				url: "/api/read-customer?partner_type=" + sCustomerType,
				contentType: "application/json",
				async: false
			}).then(function (oResponse) {
				// crete oData
				let oData = {
					count: oResponse.length,
					type: sCustomerType,
					results: oResponse
				}

				// open customer fragment
				that.onOpenCustomerD(oData);
			}).catch(function (oError) {
				// show error message box
				MessageBox.confirm(JSON.stringify(oError), {
					title: i18n.getText("title.error"),
					actions: [
						MessageBox.Action.OK
					],
					emphasizedAction: MessageBox.Action.OK
				});
			});
		},

		/**
		 * Open the customer fragment and bind it with data.
		 * 
		 * @param {object} oData data to be bind to the fragment.
		 */
		onOpenCustomerD: function (oData) {
			// open customer dialog
			if (!this.customerD) {
				Fragment.load({
					id: "customerD",
					name: "sdCore.view.fragment.Customer",
					controller: this
				}).then(function (oDialog) {
					this.customerD = oDialog;
					this.getView().addDependent(this.customerD);
					data.setModel(null, oData, this.customerD, "Customer");
					oDialog.open();
				}.bind(this));
			} else {
				data.setModel(null, oData, this.customerD, "Customer");
				this.customerD.open();
			}
		},

		/**
		 * Show selected customer name in customer field.
		 */
		onSetCustomer: function () {
			let sType = this.customerD.getModel("Customer").getData().type;
			let oCustomer = this.customerD.getContent()[1].getSelectedItem().getCustomData()[0].getValue();
			let sName = oCustomer.name;

			// close the product fragment"
			this.onCloseCustomerD();

			// refreh order model
			let oModel = this.getView().getModel("Order");
			let oData = oModel.getData();

			if (sType === "ship_to") {
				oData.ship_to = sName;
				oData.bill_to = "";
				oData.ship_to_valid = true;
				oData.bill_to_valid = false;
			} else {
				oData.bill_to = sName;
				oData.bill_to_valid = true;
			}
			oModel.refresh();
		},

		/**
		 * Close the customer fragment.
		 */
		onCloseCustomerD: function () {
			this.customerD.close();
		},

		/**
		 * Destroy the customer fragment.
		 */
		onAfterCloseCustomerD: function () {
			this.customerD.destroy();
			this.customerD = null;
		},

		/**
		 * Validate Requested Delivery Date input.
		 *
		 * @param {object} oEvent event triggered.
		 */
		onChangeReqDelDate: function (oEvent) {
			// refreh order model
			let oModel = this.getView().getModel("Order");
			let oData = oModel.getData();
			oData.requested_delivery_date = oEvent.getSource().getValue().trim();
			oData.requested_delivery_date_valid = data.isDateValid(oData.requested_delivery_date);
			oModel.refresh();
		},

		/**
		 * Validate Purchase Order input.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onChangePurOrder: function (oEvent) {
			// refreh order model
			let oModel = this.getView().getModel("Order");
			let oData = oModel.getData();
			oData.purchase_order = oEvent.getSource().getValue().trim();
			oData.purchase_order_valid = oData.purchase_order !== "";
			oModel.refresh();
		},

		/************************************************ Edit Sales Item Table ************************************************/

		/**
		 * Refresh product total with updated quantity.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onChangeQty: function (oEvent) {
			// parse quantity input
			let sQty = oEvent.getSource().getValue().trim().replace("-", "").split(".")[0];
			if (sQty === "0") {
				oEvent.getSource().setValue("1");
			} else {
				oEvent.getSource().setValue(sQty);
			}

			// refreh NewItem model
			let iQty = oEvent.getSource().getValue();
			let iDate = oEvent.getSource().getParent().getCustomData()[0].getValue().date;
			let oItemModel = this.getView().byId("editItemP").getModel("Item");
			let oItem = oItemModel.getData();
			for (var i in oItem.results) {
				if (oItem.results[i].date === iDate) {
					var fOldSubtotal = utils.getPriceFloat(oItem.results[i].subtotal);
					var fNewSubtotal = utils.getPriceFloat(oItem.results[i].unit_price) * parseInt(iQty, 10);
					oItem.results[i].subtotal = fNewSubtotal;
					break;
				}
			}
			oItemModel.refresh();

			// refresh order model 
			let oOrderModel = this.getView().getModel("Order");
			let oOrder = oOrderModel.getData();
			oOrder.product_total = utils.getPriceFloat(oOrder.product_total) - fOldSubtotal + fNewSubtotal;
			oOrderModel.refresh();
		},

		/**
		 * Delete selected item from the table.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onDeleteItem: function (oEvent) {
			// refreh NewItem model
			let iDate = oEvent.getSource().getParent().getCustomData()[0].getValue().date;
			let oItemModel = this.getView().byId("editItemP").getModel("Item");
			let oItem = oItemModel.getData();
			oItem.count -= 1;
			for (var i in oItem.results) {
				if (oItem.results[i].date === iDate) {
					var fSubtotal = utils.getPriceFloat(oItem.results[i].subtotal);
					oItem.results.splice(i, 1);
					break;
				}
			}
			oItemModel.refresh();

			// refresh order model 
			let oOrderModel = this.getView().getModel("Order");
			let oOrder = oOrderModel.getData();
			oOrder.product_total = utils.getPriceFloat(oOrder.product_total) - fSubtotal;
			if (oOrder.product_total === 0) {
				oOrder.currency = "";
			}
			oOrderModel.refresh();
		},

		/************************************************ Edit Sales Item Table Footer ************************************************/

		/**
		 * Open the product fragment.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onAddItem: function (oEvent) {
			// get product from Django model
			let that = this;
			let sSoldTo = this.getView().getModel("Order").getData().sold_to;

			data.createPromise({
				type: "GET",
				url: "/api/read-product?sold_to=" + escape(sSoldTo),
				contentType: "application/json",
				async: false
			}).then(function (oResponse) {
				// crete oData
				let oData = {
					count: oResponse.length,
					results: oResponse
				}

				// open product fragment
				that.onOpenProductD(oData);
			}).catch(function (oError) {
				// show error message box
				MessageBox.confirm(JSON.stringify(oError), {
					title: i18n.getText("title.error"),
					actions: [
						MessageBox.Action.OK
					],
					emphasizedAction: MessageBox.Action.OK
				});
			});
		},

		/**
		 * Open the product fragment and bind it with data.
		 * 
		 * @param {object} oData data to be bind to the fragment.
		 */
		onOpenProductD: function (oData) {
			// open product dialog
			if (!this.productD) {
				Fragment.load({
					id: "productD",
					name: "sdCore.view.fragment.Product",
					controller: this
				}).then(function (oDialog) {
					this.productD = oDialog;
					this.getView().addDependent(this.productD);
					data.setModel(null, oData, this.productD, "Product");
					oDialog.open();
				}.bind(this));
			} else {
				data.setModel(null, oData, this.productD, "Product");
				this.productD.open();
			}
		},

		/**
		 * Parse product quantity with quantity input in product fragment.
		 *
		 * @param {object} oEvent event triggered.
		 */
		onChangeProdQty: function (oEvent) {
			oEvent.getSource().setValue(oEvent.getSource().getValue().trim().replace("-", "").split(".")[0]);
		},

		/**
		 * Show selected item data in items table.
		 */
		onAddProduct: function () {
			// update NewItem model
			let oProduct = this.productD.getContent()[1].getSelectedItem().getCustomData()[0].getValue();
			let fSubtotal = oProduct.unit_price * oProduct.quantity;
			let fTax = fSubtotal * 1.1;
			let oItemModel = this.getView().byId("editItemP").getModel("Item");
			oItemModel.getData().count = parseInt(oItemModel.getData().count, 10) + 1;
			oItemModel.getData().results.push({
				"sap_order_number": "TX00000009",
				"name": oProduct.name,
				"number": oProduct.number,
				"description": oProduct.description,
				"quantity": oProduct.quantity,
				"unit_price": oProduct.unit_price,
				"uom": oProduct.sales_uom,
				"subtotal": fSubtotal,
				"tax": fTax,
				"currency": oProduct.currency,
				"delivery_number": "",
				"status": "",
				"date": new Date().getTime(),
				"tracking": ""
			});
			oItemModel.refresh();

			// update Order model
			let oOrderModel = this.getView().getModel("Order");
			if (!oOrderModel.getData().currency) {
				oOrderModel.getData().currency = oProduct.currency;
			}
			oOrderModel.getData().product_total = utils.getPriceFloat(oOrderModel.getData().product_total) + fSubtotal;
			oOrderModel.refresh();

			// close the product fragment
			this.onCloseProductD();
		},

		/**
		 * Close the product fragment.
		 */
		onCloseProductD: function () {
			this.productD.close();
		},

		/**
		 * Destroy the product fragment.
		 */
		onAfterCloseProductD: function () {
			this.productD.destroy();
			this.productD = null;
		},

		/**
		 * Check inputs and update current order.
		 */
		onSave: function () {
			// validate order input
			let i18n = data.getResBundle(this, "i18n");
			let oInput = this.getView().getModel("Order").getData();

			if (!oInput.ship_to_valid || !oInput.bill_to_valid || !oInput.requested_delivery_date_valid || !oInput.purchase_order_valid) {
				// show error message box
				MessageBox.error(i18n.getText("message.invalidInput"), {
					title: i18n.getText("title.error"),
					actions: [
						MessageBox.Action.OK
					],
					emphasizedAction: MessageBox.Action.OK
				});
			} else {
				let that = this;
				let sToken = utils.getToken();
				let oOrder = this.getView().getModel("Order");
				let oData = data.createOrder(false, oInput);
				let oDetails = data.createOrderDetails(oData, this.getView().byId("editItemT").getItems());

				// update order to Django model
				data.createPromise({
					headers: { "X-CSRFToken": sToken },
					type: "PATCH",
					url: "/api/update-order",
					data: JSON.stringify(oData),
					contentType: "application/json",
					async: false
				}).then(function (oResponse) {
					return data.createPromise({
						headers: { "X-CSRFToken": sToken },
						type: "PATCH",
						url: "/api/update-order_detail",
						data: JSON.stringify(oDetails),
						contentType: "application/json",
						async: false
					});
				}).then(function (oResponse) {
					// reset model
					that.resetModel(oOrder.getData().sap_order_number);
				}).catch(function (oError) {
					// show error message box
					MessageBox.confirm(JSON.stringify(oError), {
						title: i18n.getText("title.error"),
						actions: [
							MessageBox.Action.OK
						],
						emphasizedAction: MessageBox.Action.OK
					});
				});
			}
		},

		/**
		 * Show order cancel alert.
		 */
		onCancel: function () {
			let i18n = data.getResBundle(this, "i18n");
			let that = this;

			// show warning message box
			MessageBox.warning(i18n.getText("message.cancelOrder"), {
				title: i18n.getText("title.cancelOrder"),
				actions: [
					MessageBox.Action.OK,
					MessageBox.Action.CLOSE
				],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						// reset model
						that.resetModel(that.getView().getModel("Order").getData().sap_order_number);
					}
				}
			});
		},

		/************************************************ Search / Sort / Filter ************************************************/

		/**
		 * Search ... by ....
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onSearch: function (oEvent) {
			let sInput = oEvent.getSource().getValue();
			let sTitle = oEvent.getSource().getParent().getParent().getTitle();

			if (sTitle === "Add Product") {
				// search product by name, number, description, sales_uom, unit_price, and currency
				let oBinding = Fragment.byId("productD", "productT").getBinding("items");

				oBinding.filter(new Filter({
					filters: [
						new Filter("name", "Contains", sInput),
						new Filter("number", "Contains", sInput),
						new Filter("description", "Contains", sInput),
						new Filter("sales_uom", "Contains", sInput),
						new Filter("unit_price", "Contains", sInput),
						new Filter("currency", "Contains", sInput)
					],
					and: false
				}), "Application");
			} else {
				// search product by name, address, city, state, zip, and country
				let oBinding = Fragment.byId("customerD", "customerT").getBinding("items");

				oBinding.filter(new Filter({
					filters: [
						new Filter("name", "Contains", sInput),
						new Filter("address", "Contains", sInput),
						new Filter("city", "Contains", sInput),
						new Filter("state", "Contains", sInput),
						new Filter("zip", "Contains", sInput),
						new Filter("country", "Contains", sInput)
					],
					and: false
				}), "Application");
			}
		},
	});
});
