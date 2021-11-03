var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
const jwt = require('express-jwt');
var config = require('../config/env');

var checkPremission = function(user, role) {
	return !user.roles.find(r => r == role)
}

var auth = jwt({secret: config.secret, algorithms: ['HS256']});
/* GET users listing. */
router.param('productId', function(req, res, next, uid) {
	var query = Product.findById(uid);
	//query.select('_id firstname phone role');
	query.exec(function(err, info){
		if (err) {return next(err);}
		if (!info) {return next(new Error('cannot find clientinfo'));}
		
		req.info = info;
		return next();
	});
});

router.get('/', auth
, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	Product.find(function (err, products) {
		if (err) {return next(err);}
		console.log(products);
		res.json(products);
	});
});

router.get('/:productId', auth, function(req, res){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	res.json(req.info);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	if(!req.body.name || !req.body.category || !req.body.premium_mode) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	var product = new Product();

	product.pid = req.body.pid;
	product.name = req.body.name;
	product.cnname = req.body.cnname;
	product.country = req.body.country;
	product.category = req.body.category;
	product.metal = req.body.metal;
	product.weight_au = req.body.weight_au;
	product.weight_ag = req.body.weight_ag;
	product.weight_pt = req.body.weight_pt;
	product.weight_pd = req.body.weight_pd;
	product.gross_weight = req.body.gross_weight;
	product.premium_mode = req.body.premium_mode;


	product.save(function (err){
	if(err){ 
		if (err.name === 'MongoServerError' && err.code === 11000) return next(new Error('There was a duplicate key error'));
		else return next(err); 
	}

	return res.json(product);
	});
});

router.put('/:productId', auth, function(req, res, next){
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	Product.findOneAndUpdate( {'_id': req.info._id} , {$set: req.body })
		.then(product => res.send(product))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
});

router.delete('/:productId', auth, function (req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);

	Product.findOneAndUpdate( {'_id': req.info._id} , {$set: {isActive: false} })
		.then(product => res.send(product))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
	
});

module.exports = router;