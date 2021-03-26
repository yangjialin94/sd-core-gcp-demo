sap.ui.define([
	"./BaseController",
	"../libs/data",
	"../model/formatter",
	"../libs/utils",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (BaseController, data, formatter, utils, Filter, MessageBox, Fragment) {
	"use strict";

	return BaseController.extend("sdCore.controller.New", {
		formatter: formatter,

		/**
		 * Initialize the router.
		 */
		onInit: function () {
			this.getRouter().getRoute("New").attachMatched(this.onRouteMatched, this);
		},

		/**
		 * Destroy all global models.
		 */
		onExit: function () {
			data.destroyGlobalModels();
		},

		/**
		 * Set models.
		 */
		onRouteMatched: function () {
			// check for user model
			if (!sap.ui.getCore().getModel("user") || !data.getGlobalModelData("user")) {
				// nav to login page
				utils.navTo({}, this, "Login");
			}

			// set visibility
			this.getView().byId("shipToFE").setVisible(false);
			this.getView().byId("billToFE").setVisible(false);
			this.getView().byId("addB").setEnabled(false);

			// set Order model
			let sOrderNumber = sessionStorage.getItem("sap_order_number");
			let oView = this.getView();

			if (!sOrderNumber) {
				let oOrder = {
					"sold_to": "",
					"sold_to_valid": false,
					"ship_to": "",
					"ship_to_valid": false,
					"bill_to": "",
					"bill_to_valid": false,
					"created_on": new Date().getTime(),
					"requested_delivery_date": null,
					"requested_delivery_date_valid": true,
					"purchase_order": "",
					"purchase_order_valid": false,
					"product_total": 0,
					"currency": ""
				};
				data.setModel(null, oOrder, oView, "Order");

				// set NewItem model
				let oNewItemP = this.getView().byId("newItemP");
				let oNewItem = {
					"count": 0,
					"results": []
				};
				data.setModel(null, oNewItem, oNewItemP, "NewItem");
			} else {
				// get order from Django model
				data.createPromise({
					type: "GET",
					url: "/api/read-order?sap_order_number=" + sOrderNumber,
					contentType: "application/json",
					async: false
				}).then(function (oResponse) {
					// set Order model
					data.setModel(null, oResponse, oView, "Order");

					// get order items from Django model
					return data.createPromise({
						type: "GET",
						url: "/api/read-order_detail?sap_order_number=" + sOrderNumber,
						contentType: "application/json",
						async: false
					});
				}).then(function (oResponse) {
					// set NewItem model
					let oData = {
						count: oResponse.length,
						results: oResponse
					}
					data.setModel(null, oData, oView, "NewItem");

					// remove data from sessionStorage
					sessionStorage.removeItem("sap_order_number");
				}).catch(function (oError) {
					// set NewItem model
					let oData = {
						count: 0,
						results: []
					}
					data.setModel(null, oData, oView, "NewItem");

					// remove data from sessionStorage
					sessionStorage.removeItem("sap_order_number");
				});
			}
		},

		/**
		 * Navigate to sales overview page.
		 */
		onNavBack: function () {
			utils.navTo({}, this, "Home");
		},

		/************************************************ Sales Form ************************************************/

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
				// crete oData
				let oData = {
					count: 0,
					results: {}
				}

				// open customer fragment
				that.onOpenCustomerD(oData);
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
			if (sType === "sold_to") {
				oData.sold_to = sName;
				oData.ship_to = "";
				oData.bill_to = "";
				oData.sold_to_valid = true;
				oData.ship_to_valid = false;
				oData.bill_to_valid = false;

				// set visibility
				this.getView().byId("shipToFE").setVisible(true);
				this.getView().byId("billToFE").setVisible(false);
				this.getView().byId("addB").setEnabled(true);
			} else if (sType === "ship_to") {
				oData.ship_to = sName;
				oData.bill_to = "";
				oData.ship_to_valid = true;
				oData.bill_to_valid = false;

				// set visibility
				this.getView().byId("billToFE").setVisible(true);
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

		/************************************************ Sales Item Table ************************************************/

		/**
		 * Refresh product total with updated quantity in item table.
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
			let oNewItemModel = this.getView().byId("newItemP").getModel("NewItem");
			let oNewItem = oNewItemModel.getData();
			for (var i in oNewItem.results) {
				if (oNewItem.results[i].date === iDate) {
					var fOldSubtotal = utils.getPriceFloat(oNewItem.results[i].subtotal);
					var fNewSubtotal = utils.getPriceFloat(oNewItem.results[i].unit_price) * parseInt(iQty, 10);
					oNewItem.results[i].subtotal = fNewSubtotal;
					break;
				}
			}
			oNewItemModel.refresh();

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
			let oNewItemModel = this.getView().byId("newItemP").getModel("NewItem");
			let oNewItem = oNewItemModel.getData();
			oNewItem.count -= 1;
			for (var i in oNewItem.results) {
				if (oNewItem.results[i].date === iDate) {
					var fSubtotal = oNewItem.results[i].subtotal;
					oNewItem.results.splice(i, 1);
					break;
				}
			}
			oNewItemModel.refresh();

			// refresh order model 
			let oOrderModel = this.getView().getModel("Order");
			let oOrder = oOrderModel.getData();
			oOrder.product_total -= fSubtotal;
			if (oOrder.product_total === 0) {
				oOrder.currency = "";
			}
			oOrderModel.refresh();
		},

		/************************************************ Sales Item Table Footer ************************************************/

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
				// crete oData
				let oData = {
					count: 0,
					results: {}
				}

				// open product fragment
				that.onOpenProductD(oData);
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
			let fSubtotal = utils.getPriceFloat(oProduct.unit_price) * utils.getPriceFloat(oProduct.quantity);
			let fTax = fSubtotal * 1.1;
			let oNewItemModel = this.getView().byId("newItemP").getModel("NewItem");
			oNewItemModel.getData().count = parseInt(oNewItemModel.getData().count, 10) + 1;
			oNewItemModel.getData().results.push({
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
			oNewItemModel.refresh();

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
		 * Check inputs and create new order.
		 */
		onSave: function () {
			// validate order input
			let i18n = data.getResBundle(this, "i18n");
			let oInput = this.getView().getModel("Order").getData();

			if (!oInput.sold_to_valid || !oInput.ship_to_valid || !oInput.bill_to_valid || !oInput.requested_delivery_date_valid || !oInput.purchase_order_valid) {
				// show error message box
				MessageBox.error(i18n.getText("message.invalidInput"), {
					title: i18n.getText("title.error"),
					actions: [
						MessageBox.Action.OK
					],
					emphasizedAction: MessageBox.Action.OK
				});
			} else {
				// save new order to Django model
				let that = this;
				let sToken = utils.getToken();
				let oData = data.createOrder(true, oInput);
				let oDetails = data.createOrderDetails(oData, this.getView().byId("newItemT").getItems());

				data.createPromise({
					headers: { "X-CSRFToken": sToken },
					type: "POST",
					url: "/api/create-order",
					data: JSON.stringify(oData),
					contentType: "application/json",
					async: false
				}).then(function (oResponse) {
					return data.createPromise({
						headers: { "X-CSRFToken": sToken },
						type: "POST",
						url: "/api/create-order_details",
						data: JSON.stringify(oDetails),
						contentType: "application/json",
						async: false
					});
				}).then(function (oResponse) {
					// nav to home
					that.onNavBack();
				}).catch(function (oError) {
					// show error message box
					MessageBox.error(JSON.stringify(oError), {
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
						// remove all items and nav to home
						that.getView().byId("newItemT").removeAllItems();
						that.onNavBack();
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
		}
	});
});
