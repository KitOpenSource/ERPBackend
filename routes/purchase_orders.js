var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var PurchaseOrder = mongoose.model('Purchase_Order');
const jwt = require('express-jwt');
var config = require('../config/env');

var checkPremission = function(user, role) {
	return !user.roles.find(r => r == role)
}

var auth = jwt({secret: config.secret, algorithms: ['HS256']});

router.param('orderId', function(req, res, next, id) {
	var query = PurchaseOrder.findById(id);
	//query.select('_id firstname phone role');
	query.exec(function(err, info){
		if (err) {return next(err);}
		if (!info) {return next(new Error('cannot find info'));}
		
		req.info = info;
		return next();
	});
});

router.get('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	PurchaseOrder.find(function (err, requests) {
		if (err) {return next(err);}

		res.json(requests);
	});
});

router.get('/:orderId', auth, function(req, res){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	res.json(req.info);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	if(!req.body.orders) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	PurchaseOrder.insertMany(req.body.orders
					).then(function(orders) {
						res.json(orders);
					}).catch(function(error) {
						next(error); 
					});

});

router.put('/:orderId', auth, function(req, res, next){
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	PurchaseOrder.findOneAndUpdate( {'_id': req.info._id} , {$set: req.body })
		.then(order => res.send(order))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
});

router.delete('/:orderId', auth, function (req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);

	PurchaseOrder.findOneAndUpdate( {'_id': req.info._id} , {$set: {isActive: false} })
		.then(order => res.send(order))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
	
});

module.exports = router;