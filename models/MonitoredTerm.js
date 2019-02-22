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
MonitoredTermSchema.plugin(autoIncrement.plugin, 'MonitoredTerm');

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

mongoose.model('MonitoredTerm', MonitoredTermSchema);
