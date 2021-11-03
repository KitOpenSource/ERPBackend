var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
const jwt = require('express-jwt');
var config = require('../config/env');

var checkPremission = function(user, role) {
	return !user.roles.find(r => r == role)
}

var auth = jwt({secret: config.secret, algorithms: ['HS256']});
/* GET users listing. */
router.param('userId', function(req, res, next, uid) {
	var query = User.findById(uid);
	query.select('_id username roles profileImageURL');
	query.exec(function(err, usersinfo){
		if (err) {return next(err);}
		if (!usersinfo) {return next(new Error('cannot find usersinfo'));}
		
		req.usersinfo = usersinfo;
		return next();
	});
});

router.get('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	
	User.find(function (err, users) {
		if (err) {return next(err);}

		res.json(users);
	});
});

router.get('/:userId', auth, function(req, res){
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	res.json(req.usersinfo);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	if(!req.body.username || !req.body.password) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	var user = new User();

	user.username = req.body.username;
	user.roles = ['staff'];
	user.registType = 'local';
	user.setPassword(req.body.password)

	user.save(function (err){
	if(err){ 
		if (err.name === 'MongoServerError' && err.code === 11000) return next(new Error('There was a duplicate key error'));
		else return next(err); 
	}

	return res.json(user);
	});
})

router.put('/:userId', auth, function(req, res, next){
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	User.findOneAndUpdate( {'_id': req.usersinfo._id} , {$set: req.body })
		.then(user => res.send(user))
		.catch((error) => next(error));

	
});

router.delete('/:userId', auth, function (req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);

	User.findByIdAndDelete( { '_id': req.usersinfo._id } )
		.then(user => res.send(user))
		.catch((error) => next(error));
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
	return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
		  return res.json({token: user.generateJWT()});
		} else {
		  return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;