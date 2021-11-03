var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../../config/env');

var PurchaseOrderSchema = new mongoose.Schema({
    order_no: {
        type: String
    },
	pid: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	supplier: {
		type: String,
		required: true
	},
	operator: {
		type: String
	},
	isActive: {
		type: Boolean,
		default: true,
		required: true
	  }
});

mongoose.model('Purchase_Order', PurchaseOrderSchema);