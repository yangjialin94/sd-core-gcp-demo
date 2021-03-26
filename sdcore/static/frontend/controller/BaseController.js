sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("sdCore.controller.BaseController", {
		/**
		 * Function to get router
		 * 
		 * @return {object}: router
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Function to navigate back to previous page exist in the history if not then navigate to Home Page
		 */
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1); // nav to previous page in history log
			} else {
				this.getRouter().navTo("Home", {}, false); // nav back to Home
			}
		},
		

		/**
		 * Get the resource bundle.
		 * 
		 * @returns {object}: resource Model of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * User logout.
		 */
		onLogout: function () {
			window.location.href = window.location.origin + "/logout";
		},
	});
});
