var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var MonitoredTerm = mongoose.model('MonitoredTerm');
var Term = mongoose.model('Term');
var User = mongoose.model('User');
var auth = require('../auth');

module.exports = router;
