var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Term = mongoose.model('Term');
var auth = require('../auth');

module.exports = router;
