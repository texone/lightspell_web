var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');

var MonitoredTermSchema = new mongoose.Schema({
    description: String,
    status: {
        type: String,
        enum : ['ALLOWED','BLOCKED', 'PENDING'],
        default: 'PENDING'
    },
    terms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Term'  }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

MonitoredTermSchema.plugin(uniqueValidator, {message: 'is already taken'});

MonitoredTermSchema.methods.toJSONFor = function(user){
    return {
        description: this.description,
        status: this.status,
        terms: this.terms,
        author: this.author,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

MonitoredTermSchema.methods.addTerm = function(id){
    if(this.terms.indexOf(id) === -1){
        this.terms.push(id);
    }

    return this.save();
};

MonitoredTermSchema.methods.removeTerm = function(id){
    this.terms.remove( id );
    return this.save();
};

mongoose.model('MonitoredTerm', MonitoredTermSchema);
