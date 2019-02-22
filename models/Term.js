var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var TermSchema = new mongoose.Schema({
    value: {type: String, index: true, unique: true},
    count: {type: Number, default: 0}
}, {timestamps: true});

TermSchema.plugin(uniqueValidator, {message: 'is already taken'});

TermSchema.methods.toJSONFor = function(user){
    return {
        value: this.value,
        count: this.count,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

mongoose.model('Term', TermSchema);
