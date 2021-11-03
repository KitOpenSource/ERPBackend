var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var PreorderRequest = mongoose.model('Preorder_Request');
const jwt = require('express-jwt');
var config = require('../config/env');

var checkPremission = function(user, role) {
	return !user.roles.find(r => r == role)
}

var auth = jwt({secret: config.secret, algorithms: ['HS256']});

router.param('requestId', function(req, res, next, uid) {
	var query = PreorderRequest.findById(uid);
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
	
	PreorderRequest.find(function (err, requests) {
		if (err) {return next(err);}

		res.json(requests);
	});
});

router.get('/:requestId', auth, function(req, res){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	res.json(req.info);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	if(!req.body.requests) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	PreorderRequest.insertMany(req.body.requests
					).then(function(requests) {
						res.json(requests);
					}).catch(function(error) {
						next(error); 
					});

});

router.put('/:requestId', auth, function(req, res, next){
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	PreorderRequest.findOneAndUpdate( {'_id': req.info._id} , {$set: req.body })
		.then(request => res.send(request))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
});

router.delete('/:requestId', auth, function (req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);

	PreorderRequest.findOneAndUpdate( {'_id': req.info._id} , {$set: {isActive: false} })
		.then(request => res.send(request))
		.catch(err => {
			if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
			else next(err); 
		});
	
});

module.exports = router;