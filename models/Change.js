var mongoose = require('mongoose');

var ChangeSchema = new mongoose.Schema({
    body: {
        type: String
    },
    status: {
        type: String,
        enum : ['ALLOWED','BLOCKED', 'PENDING'],
        default: 'PENDING'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    block: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Block'
    },
}, {timestamps: true});

// Requires population of author
ChangeSchema.methods.toJSONFor = function(){
    return {
        id: this._id,
        status : this.status,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toJSON()
    };
};

mongoose.model('Change', ChangeSchema);
