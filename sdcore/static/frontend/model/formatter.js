sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Get order status icon.
		 * 
		 * @param {string} sStatus Status.
		 * 
		 * @returns {string} Icon src.
		 */
		setStatusIcon: function (sStatus) {
			if (sStatus === "Sales") {
				return "sap-icon://cart";
			} else if (sStatus === "Billing") {
				return "sap-icon://payment-approval";
			} else {
				return "sap-icon://shipping-status";
			}
		},

		/**
		 * Get order status icon color.
		 * 
		 * @param {string} sStatusCond StatusCond.
		 * 
		 * @returns {string} Icon color.
		 */
		setStatusIconColor: function (sStatusCond) {
			if (sStatusCond === "Alert") {
				return "Negative";
			} else if (sStatusCond === "In Progress") {
				return "Critical";
			} else if (sStatusCond === "Complete") {
				return "Positive";
			} else {
				return "Neutral";
			}
		},

		/**
		 * Parse float number into price format.
		 * 
		 * @param {float} fPrice Price in floating number.
		 * 
		 * @returns {string} 2 decimal string number with comma.
		 */
		setPrice: function (fPrice) {
			try {
				if (!fPrice) {
					return "0.00";
				} else {
					return parseFloat(fPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			} catch (error) {
				return "0.00";
			}
		},

		/**
		 * Set sales icon count.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setSalesIconCount: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Sales") {
				return "!";
			} else {
				return "";
			}
		},

		/**
		 * Set shipping icon count.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setShippingIconCount: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Shipping") {
				return "!";
			} else {
				return "";
			}
		},

		/**
		 * Set billing icon count.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setBillingIconCount: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Billing") {
				return "!";
			} else {
				return "";
			}
		},

		/**
		 * Parse integer number into date format.
		 * 
		 * @param {int} iTime unix epoch time in integer.
		 */
		setDate: function (iTime) {
			if (!iTime) {
				return "";
			} else if (typeof(iTime) === "string") {
				return iTime;
			} else {
				let oDate = new Date(iTime);
				let sDay = ("0" + oDate.getDate().toString()).slice(-2);
				let sMonth = (oDate.getMonth() + 1).toString();
				let sYear = oDate.getFullYear().toString();
				return sMonth + "-" + sDay + "-" + sYear;
			}
		},

		/**
		 * Set sales title.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setSalesTitle: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Sales") {
				return sOrderNumber + " - " + sAlertMsg;
			} else {
				return sOrderNumber;
			}
		},

		/**
		 * Set shipping title.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setShippingTitle: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Shipping") {
				return sOrderNumber + " - " + sAlertMsg;
			} else {
				return sOrderNumber;
			}
		},

		/**
		 * Set billing title.
		 * 
		 * @param {boolean} bAlert alert.
		 * @param {string} sStage stage.
		 * @param {string} sOrderNumber sap_order_number.
		 * @param {string} sAlertMsg alert_message.
		 */
		setBillingTitle: function (bAlert, sStage, sOrderNumber, sAlertMsg) {
			if (bAlert && sStage === "Billing") {
				return sOrderNumber + " - " + sAlertMsg;
			} else {
				return sOrderNumber;
			}
		},

		/**
		 * Set sales footer.
		 * 
		 * @param {string} sStage stage
		 * @param {string} sStatus status
		 */
		setSalesFooter: function (sStage, sStatus) {
			if (sStage === "Sales") {
				return sStage + " > " + sStatus;
			} else {
				return "Sales > Complete";
			}
		},

		/**
		 * Set shipping footer.
		 * 
		 * @param {string} sStage stage
		 * @param {string} sStatus status
		 */
		setShippingFooter: function (sStage, sStatus) {
			if (sStage === "Shipping") {
				return sStage + " > " + sStatus;
			} else {
				return "Shipping > Complete";
			}
		},

		/**
		 * Set visibility of edit button.
		 * 
		 * @param {string} sStage stage
		 * @param {string} sStatus status
		 */
		showEdit: function (sStage, sStatus) {
			return sStage === "Sales" && sStatus === "In Progress";
		},

		/**
		 * Set visibility of buy again button.
		 * 
		 * @param {string} sStage stage
		 * @param {string} sStatus status
		 */
		showBuyAgain: function (sStage, sStatus) {
			if (sStatus === "Alert" || sStatus === "Archive") {
				return false;
			} else {
				if (sStatus === "In Progress") {
					return sStage !== "Sales";
				} else {
					return true;
				}
			}
		},

		/**
		 * Calculate parsed subtotal pice from quantity and unit price.
		 * 
		 * @param {float} fPrice unit price.
		 * @param {int}	iQty quantity
		 * 
		 * @returns {string} parsed subtotal.
		 */
		setSubtotal: function (fPrice, iQty) {
			try {
				if (!fPrice || !iQty) {
					return "0.00";
				} else {
					return parseFloat(fPrice * iQty).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			} catch (error) {
				return "0.00";
			}
		},

		/**
		 * Show original value.
		 * 
		 * @param {string} sValue original value.
		 */
		showOrig: function (sValue) {
			return sValue;
		}
	};
});