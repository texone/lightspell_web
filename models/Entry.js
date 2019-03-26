var mongoose = require('mongoose');
var User = mongoose.model('User');

var EntrySchema = new mongoose.Schema({
    term: String,
    block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
}, {timestamps: true});
EntrySchema.index({term: 'text'});
EntrySchema.methods.toJSONFor = function(user){
    return {
        key: this._id,
        term: this.term,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        marked: user ? user.isMark(this._id) : false,
        marksCount: this.marksCount ? this.marksCount : 0,
        blocked: this.block ? true: false
    };
};

EntrySchema.methods.updateMarksCount = function() {
    var entry = this;

    return User.count({marks: {$in: [entry._id]}}).then(function(count){
        entry.marksCount = count;

        return entry.save();
    });
};

mongoose.model('Entry', EntrySchema);
