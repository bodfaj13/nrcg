var mongoose = require("../config/mongoose");
var bcrypt = require('bcrypt');

var adminModel = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    globalAdmin: {
        type: Boolean,
        required: true
    },
    time: {
        type: String,
        required: true
    }
});

var Admin = module.exports = mongoose.model('admins', adminModel);

module.exports.createAdmin =  function(newAdmin, callback){
    bcrypt.hash(newAdmin.password, 10, function(err, hash){
        if(err)throw err;
        newAdmin.password = hash;
        newAdmin.save(callback);
    });
}

module.exports.checkAdminEmail = function(emailAddress, callback){
    var query = {email: emailAddress};
    Admin.findOne(query, callback);
}

module.exports.checkAdminUsername = function(username, callback){
    var query = {username: username};
    Admin.findOne(query, callback);
}

module.exports.comparePassword = function(password, hash, callback){
    bcrypt.compare(password, hash, function(err, isMatch){
        if(err)return callback(err);
        callback(null, isMatch);
    });
}

module.exports.getAdminById = function(id, callback){
    Admin.findById(id, callback);
}

module.exports.findAllAdmins = function(callback){
    Admin.find(callback);
}

module.exports.updateUsername =  function(getAdmin, callback){
    var cond = {username: getAdmin.olddie};
    var update =  {$set: {username: getAdmin.newwie}};
    var options = {upsert : true};

    Admin.update(cond, update, options, callback);
}

module.exports.updateEmail =  function(getAdmin, callback){
    var cond = {email: getAdmin.emailolddie};
    var update =  {$set: {email: getAdmin.emailnewwie}};
    var options = {upsert : true};
    
    Admin.update(cond, update, options, callback);
}

module.exports.createUserPassword =  function(user, password,callback){
    bcrypt.hash(password, 10, function(err, hash){
        if(err)throw err;
        user.password = hash;
        user.save(callback);
    });
}