sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Return csrf token from cookie
         */
        getToken: function () {
            if (!document.cookie) {
                return null;
            }
            const token = document.cookie.split(';')
                .map(c => c.trim())
                .filter(c => c.startsWith('csrftoken='));

            if (token.length === 0) {
                return null;
            }
            return decodeURIComponent(token[0].split('=')[1]);
        },

        /**
        * Navigate to another page in the same application
        *
        * @param {object} oParams: parameters to be passed in an object {key : value}
        * @param {object} oScope: external scope
        * @param {string} sTarget: target page
        */
        navTo: function (oParams, oScope, sTarget) {
            oScope.getRouter().navTo(sTarget, oParams);
        },

        /**
         * Set error state and message for the referenced element
         * 
         * @param {object} oRef: reference of the UI element
         * @param {string} sMessage: error message to show
         */
        setError: function (oRef, sMessage) {
            oRef.setValueState("Error");
            oRef.setValueStateText(sMessage);
        },

        /**
         * Clear error state and message for the referenced element
         * 
         * @param {object} oRef: reference of the UI element
         */
        clearErrorState: function (oRef) {
            oRef.setValueState("None");
            oRef.setValueStateText("");
        },

        /**
         * Parse price string into float.
         * 
         * @param {*} sPrice XX,XXX.XX USD in string or float.
         */
        getPriceFloat: function (sPrice) {
            if (typeof (sPrice) === "string") {
                return parseFloat(sPrice.split(" ")[0].replaceAll(",", ""), 10);
            } else {
                return sPrice;
            }
        }

        // /**
        //  * Create filters for orders table.
        //  *
        //  * @param {object} oOrders: orders list.
        //  */
        // createFilters: function (oOrders) {
        //     // set variables
        //     var oStatus = [];
        //     var oCustomers = [];
        //     var oCreatedBys = [];
        //     var oAlerts = [];
        //     var oTempStatus = [];
        //     var oTempCustomers = [];
        //     var oTempCreatedBys = [];
        //     var oTempAlerts = [];

        //     // create filters
        //     oOrders.forEach(function (order) {
        //         if (!oTempStatus.includes(order.Status)) {
        //             oStatus.push({
        //                 key: "Status-" + order.Status,
        //                 text: order.Status
        //             });
        //             oTempStatus.push(order.Status);
        //         }

        //         if (!oTempCustomers.includes(order.Customer)) {
        //             oCustomers.push({
        //                 key: "Customer-" + order.Customer,
        //                 text: order.Customer
        //             });
        //             oTempCustomers.push(order.Customer);
        //         }

        //         if (!oTempCreatedBys.includes(order.CreatedBy)) {
        //             oCreatedBys.push({
        //                 key: "CreatedBy-" + order.CreatedBy,
        //                 text: order.CreatedBy
        //             });
        //             oTempCreatedBys.push(order.CreatedBy);
        //         }

        //         if (!oTempAlerts.includes(order.StatusCond)) {
        //             oAlerts.push({
        //                 key: "StatusCond-" + order.StatusCond,
        //                 text: order.StatusCond
        //             });
        //             oTempAlerts.push(order.StatusCond);
        //         }
        //     });

        //     // set Filters model
        //     uiHelper.setGlobalModel({
        //         Status: oStatus,
        //         Customers: oCustomers,
        //         CreatedBys: oCreatedBys,
        //         Alerts: oAlerts
        //     }, "Filters");
        // },

        // /**
        //  * Return current date in format like "Thursday, October 15, 2020".
        //  *
        //  * @param {date} dCurDate: current date.
        //  *
        //  * @return {string}: current date.
        //  */
        // getCurrentDate: function (dCurDate) {
        //     var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        //     var sDay = days[dCurDate.getDay()];
        //     var sMonth = dCurDate.toLocaleString("en-us", {
        //         month: "long"
        //     });
        //     var iDate = dCurDate.getDate();
        //     var iYear = dCurDate.getFullYear();

        //     return sDay + ", " + sMonth + " " + iDate + ", " + iYear;
        // },

        // /**
        //  * Return selected order sales info.
        //  *
        //  * @return {object}: selected order sales info.
        //  */
        // getSales: function () {
        //     return {
        //         Status: "Sales",
        //         StatusCond: "In Progress",
        //         Customer: "Globex Corporation",
        //         CreatedBy: "Denise Smith",
        //         OrderNumber: "TX00000004",
        //         ProductTotal: 244132.88,
        //         Currency: "USD",
        //         PurchaseOrder: "SCP Implementation",
        //         Alert: 0,
        //         SoldTo: "Globex Corporation 123 Main St, Chicago, IL",
        //         ShipTo: "Globex Corporation",
        //         BillTo: "Globex Corporation",
        //         CreatedOn: 1612977795820,
        //         RequestedDeliveryDate: 1999999999999,
        //         Tax: 22182.43,
        //         Total: 266315.31,
        //         Items: {
        //             count: 3,
        //             results: [{
        //                 Name: "SD Core App",
        //                 Number: "50010",
        //                 Description: "Sales, Shipping, and Billing Application",
        //                 Quantity: 1,
        //                 Uom: "Unit",
        //                 UnitPrice: 49000.00,
        //                 Currency: "USD",
        //                 Subtotal: 49000.00,
        //                 DeliveryNumber: "80000121",
        //                 Status: "Processing > Estimated to Ship On:",
        //                 Date: "Sep 29,2020",
        //                 Tracking: "Processing"
        //             }, {
        //                 Name: "SAP Cloud Platform",
        //                 Number: "50131",
        //                 Description: "Cloud Services",
        //                 Quantity: 12,
        //                 Uom: "Unit",
        //                 UnitPrice: 8240.24,
        //                 Currency: "USD",
        //                 Subtotal: 98882.82,
        //                 DeliveryNumber: "80000124",
        //                 Status: "Complete > Shipped On:",
        //                 Date: "Sep 29,2020",
        //                 Tracking: "1Z1328577891"
        //             }, {
        //                 Name: "Application Customization",
        //                 Number: "500201",
        //                 Description: "Supplier Name",
        //                 Quantity: 550,
        //                 Uom: "Unit",
        //                 UnitPrice: 175.00,
        //                 Currency: "USD",
        //                 Subtotal: 96250.00,
        //                 DeliveryNumber: "80000125",
        //                 Status: "Complete > Shipped On:",
        //                 Date: "Sep 29,2020",
        //                 Tracking: "1Z1328577894"
        //             }]
        //         }
        //     };
        // },

        // /**
        //  * Return current user info.
        //  *
        //  * @return {object}: current user info.
        //  */
        // getUser: function () {
        //     return "Denise Smith";
        // }
    };
});