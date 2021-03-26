sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {
		/**
		 * Get resource bundle from the target model
		 * 
		 * @param {object} oScope external scope
		 * @param {string} sModel target model name
		 *
		 * @return {object} resource bundle from the target model
		 */
		getResBundle: function (oScope, sModel) {
			return oScope.getView().getModel(sModel).getResourceBundle();
		},

		/**
		 * Create local oModel and bind it to an UI element
		 * 
		 * @param {integer} iSize size of data for the model
		 * @param {object} oData data to bind on ui element
		 * @param {object} oRef reference of the ui element
		 * @param {string} sName name of the model
		 */
		setModel: function (iSize, oData, oRef, sName) {
			var oModel = new JSONModel();

			if (iSize) {
				oModel.setSizeLimit(iSize);
			}

			oModel.setData(oData);
			oRef.setModel(oModel, sName);
		},

		/**
		 * Create global oModel
		 * 
		 * @param {object} oData data to bind with ui element
		 * @param {string} sName name of the model
		 */
		setGlobalModel: function (oData, sName) {
			var oModel = new JSONModel();
			oModel.setData(oData);
			sap.ui.getCore().setModel(oModel, sName);

			this.createGlobalModels();
			this.getGlobalModelData("GlobalModels").results.push(sName);
		},

		/**
		 * Get global oModel data
		 * 
		 * @param {string} sName name of the model
		 * 
		 * @return {object} data object from the model
		 */
		getGlobalModelData: function (sName) {
			return sap.ui.getCore().getModel(sName).getData();
		},

		/**
		 * Create global oModel "GlobalModels" to save all the global models' name
		 * Used for clean all the global modes when app get destroyed
		 * 
		 * @param {string} sName name of the model to save
		 */
		createGlobalModels: function () {
			if (!sap.ui.getCore().getModel("GlobalModels")) {
				var oModel = new JSONModel();
				oModel.setData({
					results: []
				});
				sap.ui.getCore().setModel(oModel, "GlobalModels");
			}
		},

		/**
		 * Destroy oModel "GlobalModels"
		 * 
		 * @param {string} sName name of the model
		 */
		destroyGlobalModels: function () {
			if (sap.ui.getCore().getModel("GlobalModels")) {
				var oModels = this.getGlobalModelData("GlobalModels").results;

				for (var m = 0; m < oModels.length; m++) {
					if (sap.ui.getCore().getModel(oModels[m])) {
						sap.ui.getCore().setModel(null, oModels[m]);
					}
				}
			}
		},

		/**
		 * Create Ajax promise.
		 * 
		 * @param {object} oParams ajax call parameters.
		 * 
		 * @return {object} promise to be passed back; either resolved or rejected.
		 */
		createPromise: function (oParams) {
			return new Promise(function (resolve, reject) {
				var oCall = {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				};

				for (var key in oParams) {
					oCall[key] = oParams[key];
				}

				$.ajax(oCall);
			});
		},

		/**
		 * Create order in json format.
		 * 
		 * @param {object} bNew is new order.
		 * @param {object} oOrder order odata.
		 */
		createOrder: function (bNew, oOrder) {
			let fProductTotal = parseFloat(parseFloat(oOrder.product_total, 10).toFixed(2));
			let fTax = parseFloat(parseFloat(fProductTotal * 0.10, 10).toFixed(2));
			let fTotalAmount = parseFloat((fProductTotal + fTax).toFixed(2));
			let iReqDelDate = !oOrder.requested_delivery_date ? 0 : new Date(oOrder.requested_delivery_date).getTime() + 86400000;

			return {
				"stage": "Sales",
				"status": "In Progress",
				"created_by": "",
				"sap_order_number": bNew ? "TX" + this.randomGenerator(8) : oOrder.sap_order_number,
				"product_total": fProductTotal,
				"tax": fTax,
				"total_amount": fTotalAmount,
				"currency": oOrder.currency,
				"purchase_order": oOrder.purchase_order,
				"alert": 0,
				"alert_message": "",
				"sold_to": oOrder.sold_to,
				"ship_to": oOrder.ship_to,
				"bill_to": oOrder.bill_to,
				"created_on": oOrder.created_on,
				"requested_delivery_date": iReqDelDate
			};
		},

		/**
		 * Random generate string.
		 * 
		 * @param {int} iLen length of random generated string.
		 */
		randomGenerator: function (iLen) {
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;

			for (var i = 0; i < iLen; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}

			return result;
		},

		/**
		 * Create order details in json format.
		 * 
		 * @param {object} oData parsed order data.
		 * @param {object} oItems items in the order.
		 */
		createOrderDetails: function (oData, oItems) {
			var oDetails = {
				"sap_order_number": oData.sap_order_number,
				"order_details": []
			};

			for (var i in oItems) {
				let oItem = oItems[i].getCustomData()[0].getValue();
				oDetails.order_details.push({
					"sap_order_number": oData.sap_order_number,
					"name": oItem.name,
					"number": oItem.number,
					"description": oItem.description,
					"quantity": parseInt(oItem.quantity, 10),
					"unit_price": parseFloat(oItem.unit_price, 10),
					"uom": oItem.uom,
					"subtotal": oItem.subtotal,
					"tax": parseFloat(parseFloat(oItem.subtotal * 1.10, 10).toFixed(2)),
					"currency": oItem.currency,
					"delivery_number": "",
					"status": "",
					"date": oItem.date,
					"tracking": ""
				});
			}

			return oDetails;
		},

		/**
		 * Check if date is in format dd-MM-yyyy
		 * 
		 * @param {string} sDate input date
		 * 
		 * @returns boolean
		 */
		isDateValid: function (sDate) {
			var aMatch = sDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
			return aMatch || sDate === "" ? true : false;
		}
	};
});
