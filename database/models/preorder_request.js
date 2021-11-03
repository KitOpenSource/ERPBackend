var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../../config/env');

var PreorderRequestSchema = new mongoose.Schema({
	transaction: {
		type: String,
		required: true,
	},
	pid: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	branch: {
		type: String,
		required: true
	},
	operator: {
		type: String
	},
	client: {
		type: String
	},
	phone: {
		type: String
	},
	isActive: {
		type: Boolean,
		default: true,
		required: true
	  }
});

PreorderRequestSchema.path('phone').validate({
    
  validator: function(v) {
    return v.length >= 8 && v.length <= 11;
  },
  message: "phone length 8 to 11"
    
});

PreorderRequestSchema.index({
  transaction: 1,
  pid: 1,
}, {
  unique: true,
});

mongoose.model('Preorder_Request', PreorderRequestSchema);