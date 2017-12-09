

var memberSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    },
    homeAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    prayerRequest: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
});

var Member = module.exports = mongoose.model('members', memberSchema);

module.exports.createMember =  function(newMember, callback){
    newMember.save(callback);
}

module.exports.checkMemberEmail = function(emailAddress, callback){
    var query = {emailAddress: emailAddress};
    Member.findOne(query, callback);
}

module.exports.findAllMembers = function(callback){
    Member.find(callback);
}

