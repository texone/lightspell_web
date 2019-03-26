var router = require('express').Router();
var mongoose = require('mongoose');
var isodate = require("isodate");
var Entry = mongoose.model('Entry');
var Block = mongoose.model('Block');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }

        var entry = new Entry(req.body.entry);

        return entry.save().then(function(){
            console.log(entry.term);
            return res.json({entry: entry.toJSONFor()});
        });
    }).catch(next);
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
        Entry.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'})
            .exec(),
        Entry.count(query).exec()
    ]).then(function (results) {
        var entries = results[0];
        var entriesCount = results[1];

        return res.json({
            entries: entries.map(function (entry) {
                return entry.toJSONFor();
            }),
            entriesCount: entriesCount
        });
    }).catch(next);
});

router.get('/search', auth.optional, function (req, res, next) {

    var limit = 20;
    var offset = 0;
    var searchString = "";
    var startDate = new Date('0001-01-01');
    var endDate = new Date().toISOString();;
    console.log(startDate);
    console.log(endDate);
    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }

    if (typeof req.query.offset !== 'undefined') {
        offset = req.query.offset;
    }

    if (typeof req.query.searchString !== 'undefined') {
        searchString = req.query.searchString;
    }

    if (typeof req.query.startDate !== 'undefined') {
        startDate = req.query.startDate;
    }

    if (typeof req.query.endDate !== 'undefined') {
        endDate = req.query.endDate;
    }

    var query = {
        $text: {$search: searchString},
        createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }

    };

    console.log(searchString);
    return Promise.all([
        Entry.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'})
            .exec(),
        Entry.count(query).exec()
    ]).then(function (results) {
        var entries = results[0];
        var entriesCount = results[1];

        return res.json({
            entries: entries.map(function (entry) {
                return entry.toJSONFor();
            }),
            entriesCount: entriesCount
        });
    }).catch(next);
});

// Preload entry objects on routes with ':entry'
router.param('entry', function(req, res, next, id) {
    Entry.findById({ _id: id})
        .populate('author')
        .then(function (entry) {
            if (!entry) { return res.sendStatus(404); }

            req.entry = entry;

            return next();
        }).catch(next);
});

// mark an entry
router.post('/:entry/mark', auth.required, function(req, res, next) {
    var entryId = req.entry._id;

    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }

        return user.mark(entryId).then(function(){
            return req.entry.updateMarksCount().then(function(entry){
                return res.json({entry: entry.toJSONFor(user)});
            });
        });
    }).catch(next);
});

// Unfavorite an entry
router.delete('/:entry/mark', auth.required, function(req, res, next) {
    var entryId = req.entry._id;

    User.findById(req.payload.id).then(function (user){
        if (!user) { return res.sendStatus(401); }

        return user.unmark(entryId).then(function(){
            return req.entry.updateMarksCount().then(function(entry){
                return res.json({entry: entry.toJSONFor(user)});
            });
        });
    }).catch(next);
});

router.post('/:entry/block', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if(!user){ return res.sendStatus(401); }

        var block = new Block(req.body.block);
        block.entry = req.entry;
        block.author = user;

        return block.save().then(function(){
            req.entry.block = block;

            return req.entry.save().then(function(entry) {
                res.json({block: block.toJSON()});
            });
        });
    }).catch(next);
});


module.exports = router;
