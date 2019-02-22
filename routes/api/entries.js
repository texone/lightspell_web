var router = require('express').Router();
var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');
var User = mongoose.model('User');
var Term = mongoose.model('Term');
var auth = require('../auth');

router.post('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }

        Term.findOne({value: req.body.term.value})
            .then(function (term) {
                if (!term) {
                    term = new Term(req.body.term);
                    term.save().then(function () {
                    });
                }
                console.log(term);

                var entryData = {};
                term.updateEntryCount();
                entryData.term = term;
                var entry = new Entry(entryData);
                entry.save().then(function () {
                    console.log(entry);
                    return res.json({entry: entry.toJSONFor()});
                });
            }).catch(next);


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
            .populate('term')
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

module.exports = router;