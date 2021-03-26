sap.ui.define([
	"./BaseController",
	"../libs/data",
	"../libs/utils",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageBox"
], function (BaseController, data, utils, formatter, Filter, MessageBox) {
	"use strict";

	return BaseController.extend("sdCore.controller.Home", {
		formatter: formatter,

		/**
		 * Initialize the router.
		 */
		onInit: function () {
			this.getRouter().getRoute("Home").attachMatched(this.onRouteMatched, this);
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
			let that = this;
			let i18n = data.getResBundle(this, "i18n");
			let oView = this.getView();
			let oOrdersOPS = oView.byId("orderOPS");

			// get orders from Django model
			$.ajax({
				type: "GET",
				url: "/api/read-orders",
				contentType: "application/json",
				async: false,
				success: function (oResponse) {
					// set Orders model
					let oData = {
						count: oResponse.length,
						results: oResponse
					}
					data.setModel(null, oData, oOrdersOPS, "Order");

					// check for filter
					if (sessionStorage.getItem("onFilterCreatedBy")) {
						let sInput = sessionStorage.getItem("onFilterCreatedBy");
						let oBinding = that.getView().byId("orderT").getBinding("items");

						oBinding.filter([new Filter("created_by", "Contains", sInput)]);
						that.getView().byId("resetFilterB").setVisible(true);
						that.getView().byId("orderOPSS").setTitle(i18n.getText("title.all", [oBinding.getLength()]));
						sessionStorage.removeItem("onFilterCreatedBy");
					} else {
						that.getView().byId("resetFilterB").setVisible(false);
					}

					// check for user model
					if (!sap.ui.getCore().getModel("User") || !data.getGlobalModelData("User")) {
						that.setUser();
					} else {
						// set User model
						data.setModel(null, data.getGlobalModelData("User"), oView, "User");
					}
				},
				error: function (oError) {
					// show error message box
					MessageBox.confirm(JSON.stringify(oError), {
						title: i18n.getText("title.error"),
						actions: [
							MessageBox.Action.OK
						],
						emphasizedAction: MessageBox.Action.OK
					});
				}
			});
		},

		/**
		 * Set user.
		 */
		setUser: function() {
			let i18n = data.getResBundle(this, "i18n");
			let oView = this.getView();

			// get user from Django mode
			$.ajax({
				type: "GET",
				url: "/api/read-user",
				contentType: "application/json",
				async: false,
				success: function (oResponse) {
					// set User models
					data.setGlobalModel(oResponse, "User");
					data.setModel(null, oResponse, oView, "User");
				},
				error: function (oError) {
					// show error message box
					MessageBox.confirm(JSON.stringify(oError), {
						title: i18n.getText("title.error"),
						actions: [
							MessageBox.Action.OK
						],
						emphasizedAction: MessageBox.Action.OK
					});
				}
			});
		},

		/**
		 * Navigate to New view.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onNavToNewOrder: function () {
			utils.navTo({}, this, "New");
		},

		/**
		 * Navigate to Order view.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onNavToOrderDetail: function (oEvent) {
			let oOrder = oEvent.getSource().getCustomData()[0].getValue();

			utils.navTo({
				"sap_order_number": oOrder.sap_order_number
			}, this, "Order");
		},

		/************************************************ Search / Sort / Filter ************************************************/

		/**
		 * Search order by customer, created by, order number, usd, total, and purchase order.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onSearch: function (oEvent) {
			let i18n = data.getResBundle(this, "i18n");
			let sInput = oEvent.getSource().getValue();
			let oBinding = this.getView().byId("orderT").getBinding("items");

			oBinding.filter(new Filter({
				filters: [
					new Filter("stage", "Contains", sInput),
					new Filter("sold_to", "Contains", sInput),
					new Filter("created_by", "Contains", sInput),
					new Filter("sap_order_number", "Contains", sInput),
					new Filter("total_amount", "Contains", sInput),
					new Filter("currency", "Contains", sInput),
					new Filter("purchase_order", "Contains", sInput)
				],
				and: false
			}), "Application");
			this.getView().byId("orderOPSS").setTitle(i18n.getText("title.all", [oBinding.getLength()]));
		},

		/**
		 * Open the sorter fragment.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onOpenSorter: function (oEvent) {
			// show alert message box
			MessageBox.alert("\"onOpenSorter\" function is currently under development");
		},

		/**
		 * Open the filter fragment.
		 */
		onOpenFilter: function () {
			// show alert message box
			MessageBox.alert("\"onOpenFilter\" function is currently under development");
		},

		/**
		 * Filter order by sold_to and show reset filter button.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onFilterSoldTo: function (oEvent) {
			let sInput = oEvent.getSource().getCustomData()[0].getValue();
			let oBinding = this.getView().byId("orderT").getBinding("items");

			oBinding.filter([new Filter("sold_to", "EQ", sInput)]);
			this.getView().byId("resetFilterB").setVisible(true);

			// update count
			let i18n = data.getResBundle(this, "i18n");
			this.getView().byId("orderOPSS").setTitle(i18n.getText("title.all", [oBinding.getLength()]));
		},

		/**
		 * Filter order by created_by and show reset filter button.
		 * 
		 * @param {object} oEvent event triggered.
		 */
		onFilterCreatedBy: function (oEvent) {
			let sInput = oEvent.getSource().getCustomData()[0].getValue();
			let oBinding = this.getView().byId("orderT").getBinding("items");

			oBinding.filter([new Filter("created_by", "EQ", sInput)]);
			this.getView().byId("resetFilterB").setVisible(true);

			// update count
			let i18n = data.getResBundle(this, "i18n");
			this.getView().byId("orderOPSS").setTitle(i18n.getText("title.all", [oBinding.getLength()]));
		},

		/**
		 * Clear filter and hide reset filter button.
		 */
		onClearFilter: function () {
			let i18n = data.getResBundle(this, "i18n");
			let oBinding = this.getView().byId("orderT").getBinding("items");

			oBinding.filter([]);
			this.getView().byId("resetFilterB").setVisible(false);
			this.getView().byId("orderOPSS").setTitle(i18n.getText("title.all", [oBinding.getLength()]));
		}
	});
});
