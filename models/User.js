var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  name: String,
  firstName: String,
  blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }],
  marks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
  hash: String,
  salt: String
}, {timestamps: true});

UserSchema.methods.toJSON = function(){
  return {
    username: this.username,
    name: this.name,
    firstName: this.firstName,
    markedEntry:  false  // we'll implement following functionality in a few chapters :)
  };
};

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

UserSchema.methods.mark = function(id){
  if(this.marks.indexOf(id) === -1){
    this.marks.push(id);
  }

  return this.save();
};

UserSchema.methods.isMark = function(id){
  return this.marks.some(function(markID){
    return markID.toString() === id.toString();
  });
};

UserSchema.methods.unmark = function(id){
  this.marks.remove( id );
  return this.save();
};

mongoose.model('User', UserSchema);
