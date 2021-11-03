var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../../config/env');

var ClientSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  hash: String,
  salt: String,
  code: {
    type: String,
    default: '+853',
    required: true
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: /.+\@.+\..+/
    // validate: [
    //   validator({
    //     validator: 'isEmail',
    //     message: 'Oops..please enter valid email'
    //   })
    // ]
  },
  gender: {
    type: Number,
    trim: true,
    default: 0
  },
  role: {
    type: String,
    trim: true,
    default: 'client',
    required: true
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  }
});

ClientSchema.path('phone').validate({
    
  validator: function(v) {
    return v.length >= 8 && v.length <= 11;
  },
  message: "phone length 8 to 11"
    
});

ClientSchema.index({
  code: 1,
  phone: 1,
}, {
  unique: true,
});

ClientSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

ClientSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');

  return this.hash === hash;
};

ClientSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 30);

  return jwt.sign({
    _id: this._id,
    role: this.role,
    firstname: this.firstname,
    code: this.code,
    phone: this.phone,
    gender: this.gender,
    exp: parseInt(exp.getTime() / 1000),
  }, config.secret);
};

mongoose.model('Client', ClientSchema);