var express = require('express');
var router = express.Router();
const multer = require('multer');
var cors = require('cors');
var fileExtension = require('file-extension');

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

router.get('/newpid', auth, function(req, res, next){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	Product.findOne().sort({ pid: -1}).exec(function(err, product) {
		if (err) {return next(err);}
		var newPid = Number(product.pid)+1;

		return res.json(newPid.toString());
	});

});

router.get('/', auth
, function(req, res, next) {
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	Product.find().sort({ pid: 1}).exec(function (err, products) {
		if (err) {return next(err);}
		res.json(products);
	});
});

router.get('/:productId', auth, function(req, res){
	if (checkPremission(req.user, "admin") && checkPremission(req.user, "staff")) return res.sendStatus(401);
	
	res.json(req.info);
	
});

router.post('/', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	if(!req.body.name || !req.body.category || !req.body.pid || !req.body.subcategory) {
	    return res.status(400).json({message: 'Please fill out all fields'});
	}

	var product = new Product();
	product.pid = req.body.pid;
	product.name = req.body.name;
	product.cname = req.body.cname;
	product.country = req.body.country;
	product.manufacturer = req.body.manufacturer;
	product.category = req.body.category;
	product.subcategory = req.body.subcategory;
	product.denomination = req.body.denomination;
	product.mintage = req.body.mintage;
	product.diameter = req.body.diameter;
	product.thickness = req.body.thickness;
	product.purity = req.body.purity;
	product.finish = req.body.finish;
	product.metal = req.body.metal;
	product.weight_au = req.body.weight_au;
	product.weight_ag = req.body.weight_ag;
	product.weight_pt = req.body.weight_pt;
	product.weight_pd = req.body.weight_pd;
	product.gross_weight = req.body.gross_weight;
	product.year = req.body.year;
	product.tag = req.body.tag;

	product.save(function (err){
	if(err){ 
		if (err.name === 'MongoServerError' && err.code === 11000) {
			var error = new Error('There was a duplicate key error');
			return res.status(403).json({ error: 'Pid duplicate!' });
		}
		else return next(err); 
	}

	return res.json(product);
	});
});

router.post('/multi', auth, function(req, res, next) {
	if (checkPremission(req.user, "admin")) return res.sendStatus(401);
	Product.insertMany(req.body)
	.then(products => {
		return res.json(products);
	}).catch(err => {
		if (err.name === 'MongoServerError' && err.code === 11000) next(new Error('There was a duplicate key error'));
		else next(err); 
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
			next(err); 
		});
	
});

// Configure Storage
var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, 'my_uploaded_files')
    },

    // Setting name of file saved
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + fileExtension(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    limits: {
        // Setting Image Size Limit to 2MBs
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            //Error 
            cb(new Error('Please upload JPG and PNG images only!'))
        }
        //Success 
        cb(undefined, true)
    }
});

router.post('/:productId/uploadfile', upload.single('uploadedImage'), (req, res, next) => {
    const file = req.file
    console.log(file);
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
	Product.findOneAndUpdate({'_id': req.info._id}, 
		{$set: {imgUrl: 'http://localhost:3000/image/'+file.filename}}
		, {new: true})
		.then(product => res.status(200).send(product))
		.catch(err => {
			res.status(400).send({
				error: err.message
			})
		})
   

});

module.exports = router;