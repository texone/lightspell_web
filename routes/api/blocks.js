var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Block = mongoose.model('Block');
var Change = mongoose.model('Change');
var User = mongoose.model('User');
var auth = require('../auth');

module.exports = router;

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
        Block.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'})
            .populate('author')
            .exec(),
        Block.count(query).exec()
    ]).then(function (results) {
        var blocks = results[0];
        var blocksCount = results[1];

        return res.json({
            blocks: blocks.map(function (block) {
                return block.toJSON();
            }),
            blocksCount: blocksCount
        });
    }).catch(next);
});

router.get('/status', auth.optional, function (req, res, next) {

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
        createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }

    };

    console.log(searchString);
    return Promise.all([
        Block.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'})
            .exec(),
        Block.count(query).exec()
    ]).then(function (results) {
        var blocks = results[0];
        var blocksCount = results[1];

        return res.json({
            blocks: blocks.map(function (block) {
                return block.toJSON();
            }),
            blocksCount: blocksCount
        });
    }).catch(next);
});

// Preload block objects on routes with ':block'
router.param('block', function(req, res, next, id) {
    Block.findById(id)
        .populate('author')
        .then(function (block) {
            if (!block) { return res.sendStatus(404); }

            req.block = block;

            return next();
        }).catch(next);
});

router.get('/:block', auth.optional, function(req, res, next){
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
        return req.block.populate({
            path: 'changes',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function(block) {
            return res.json({block: block.toJSON()});
        });
    }).catch(next);
});

router.param('change', function (req, res, next, id) {
    Change.findById(id).then(function (change) {
        if (!change) {
            return res.sendStatus(404);
        }

        req.change = change;

        return next();
    }).catch(next);
});

router.post('/:block/changes', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if(!user){ return res.sendStatus(401); }

        var change = new Change(req.body.change);
        change.block = req.block;
        change.author = user;

        return change.save().then(function(){
            req.block.changes.push(change);

            return req.block.save().then(function(block) {
                res.json({change: change.toJSONFor(user)});
            });
        });
    }).catch(next);
});

router.get('/:block/changes', auth.optional, function(req, res, next){
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
        return req.block.populate({
            path: 'changes',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function(block) {
            return res.json({changes: req.block.changes.map(function(change){
                    return change.toJSONFor(user);
                })});
        });
    }).catch(next);
});

module.exports = router;
