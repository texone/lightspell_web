var mongoose = require('mongoose');

var EntrySchema = new mongoose.Schema({
    term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term'  },
}, {timestamps: true});

EntrySchema.methods.toJSONFor = function(){
    return {
        term: this.term.toJSONFor(),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

mongoose.model('Entry', EntrySchema);