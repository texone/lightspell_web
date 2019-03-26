var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');

var BlockSchema = new mongoose.Schema({
    description: String,
    terms: { type: [String] },
    entry: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Change' }],
}, {timestamps: true});

BlockSchema.plugin(uniqueValidator, {message: 'is already taken'});

BlockSchema.methods.toJSON = function(){
    return {
        key: this._id,
        description: this.description,
        terms: this.terms,
        author: this.author.toJSON(),
        changes:this.changes,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

BlockSchema.methods.addTerm = function(id){
    if(this.terms.indexOf(id) === -1){
        this.terms.push(id);
    }

    return this.save();
};

BlockSchema.methods.removeTerm = function(id){
    this.terms.remove( id );
    return this.save();
};

mongoose.model('Block', BlockSchema);
