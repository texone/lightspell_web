var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Term = mongoose.model('Term');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }

        var term = new Term(req.body.term);

        return term.save().then(function(){
            console.log(term.value);
            return res.json({term: term.toJSONFor()});
        });
    }).catch(next);
});

router.param('term', function(req, res, next, value) {
    Term.findOne({ value: value})
        .then(function (term) {
            if (!term) { return res.sendStatus(404); }

            req.term = term;

            return next();
        }).catch(next);
});

router.get('/:term', auth.optional, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        return res.json({term: req.term.toJSONFor()});
    });
});

router.put('/:term', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if(typeof req.body.term.value !== 'undefined'){
            req.term.value = req.body.term.value;
        }

        if(typeof req.body.term.count !== 'undefined'){
            req.term.count = req.body.term.count;
        }

        req.term.save().then(function(term){
            return res.json({term: term.toJSONFor()});
        }).catch(next);
    });
});

router.delete('/:term', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(){
        return req.term.remove().then(function(){
            return res.sendStatus(204);
            });

    });
});

router.get('/', auth.optional, function (req, res, next) {
    var query = {};
    var limit = 20;
    var offset = 0;

    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }

    if (typeof req.query.offset !== 'undefined') {
        offset = req.query.offset;
    }

    return Promise.all([
        Term.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'})
            .exec(),
        Term.count(query).exec()
    ]).then(function (results) {
        var terms = results[0];
        var termsCount = results[1];

        return res.json({
            terms: terms.map(function (term) {
                return term.toJSONFor();
            }),
            termsCount: termsCount
        });
    }).catch(next);
});

module.exports = router;
