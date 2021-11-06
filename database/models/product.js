var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../../config/env');

var ProductSchema = new mongoose.Schema({
	pid: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true,
	},
	cname: {
		type: String,
	},
	country: {
		type: String,
		default: 'other'
	},
	denomination: {
		type: String
	},
	year: {
		type: Number
	},
	manufacturer: {
		type: String,
		default: 'other'
	},
	mintage: {
		type: Number
	},
	diameter: {
		type: String
	},
	thickness: {
		type: Number
	},
	purity: {
		type: String
	},
	finish: {
		type: String
	},
	category: {
		type: String,
		required: true,
		enum: ['bullion', 'collectable', 'toy', 'accessory', 'other'],
		default: 'other',
	},
	subcategory: {
		type: String,
		required: true,
		enum: ['coin', 'bar', 'medal', 'note', 'other'],
		default: 'other',
	},
	metal: {
		type: [{
			type: String,
			enum: ['gold', 'silver', 'platinum', 'palladinum', 'other']
		}],
		default: ['other']
	},
	tag: {
		type:[{
			type: String
		}]
	},
	weight_au: { type: Number, default: 0 },
	weight_ag: { type: Number, default: 0 },
	weight_pt: { type: Number, default: 0 },
	weight_pd: { type: Number, default: 0 },
	gross_weight: { type: Number, default: 0 },
	avg_cost: { type: Number, default: 0 },
	premium_mode: {
		type: Boolean,
		default: false
	},
	quote: {
		type: [{
			quantity: {
	        	type: Number,
				default: 0,
	        },
	        price: {
	        	type: Number,
				default: 0,
	        }
		}],
        default: [{
        	quantity: 1,
        	price: 0
        }]
	},
	premium: {
		type: [{
			quantity: {
	        	type: Number,
				default: 0
	        },
	        price: {
	        	type: Number,
				default: 0
	        }
		}],
        default: [{
        	quantity: 1,
        	price: 0
        }]
	},
	isActive: {
		type: Boolean,
		default: true
	}
});

mongoose.model('Product', ProductSchema);