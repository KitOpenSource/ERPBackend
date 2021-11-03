var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
const jwt = require('express-jwt');
var config = require('../config/env');

var checkPremission = function(user, role) {
	return !user.roles.find(r => r == role)
}

var auth = jwt({secret: config.secret, algorithms: ['HS256']});
/* GET users listing. */
router.param('clientId', function(req, res, next, uid) {
	var query = Client.findById(uid);
	query.select('_id firstname phone role');
	query.exec(function(err, clientinfo){
		if (err) {return next(err);}
		if (!clientinfo) {return next(new Error('cannot find clientinfo'));}
		
		req.clientinfo = clientinfo;
		return next();
	});
});

router.get('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	Client.find(function (err, clients) {
		if (err) {return next(err);}

		res.json(clients);
	});
});

router.get('/:clientId', auth, function(req, res){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	res.json(req.clientinfo);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	if(!req.body.firstname || !req.body.code || !req.body.phone) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	var client = new Client();

	client.firstname = req.body.firstname;
	client.phone = req.body.phone;
	client.code = req.body.code;
	client.role = 'client';
	client.setPassword(req.body.phone)

	client.save(function (err){
	if(err){ 
		if (err.name === 'MongoServerError' && err.code === 11000) return next(new Error('There was a duplicate key error'));
		else return next(err); 
	}

	return res.json(client);
	});
});

router.put('/:clientId', auth, function(req, res, next){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	Client.findOneAndUpdate( {'_id': req.clientinfo._id} , {$set: req.body })
		.then(client => res.send(client))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
});

router.delete('/:clientId', auth, function (req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);

	Client.findOneAndUpdate( {'_id': req.clientinfo._id} , {$set: {isActive: false} })
		.then(client => res.send(client))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
	
});

module.exports = router;