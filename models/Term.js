var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Entry = mongoose.model('Entry');

var TermSchema = new mongoose.Schema({
    value: {type: String, index: true, unique: true},
    entryCount: {type: Number, default: 0},
}, {timestamps: true});

TermSchema.plugin(uniqueValidator, {message: 'is already taken'});

TermSchema.methods.toJSONFor = function(){
    return {
        value: this.value,
        entryCount : this.entryCount,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

TermSchema.methods.updateEntryCount = function() {
    var term = this;
    console.log("texone");
    return Entry.count({term: term._id}).then(function(count){
        term.entryCount = count;

        return term.save();
    });
};

mongoose.model('Term', TermSchema);
