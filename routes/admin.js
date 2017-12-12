var express = require('express');
var router = express.Router();
var appdetails = require('../config/appdetails.json');
var passport = require('passport');
var bcrypt = require('bcrypt');
var Admin = require('../model/adminModel');
var Member = require('../model/memberModel');


router.get('/', function(req, res, next) {
  res.render('login',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    loginErrU: req.flash('loginErrU'),
    ensurelogin: req.flash('ensurelogin')
  });
});

router.get('/dashboard', ensureAuthenticated, getAllMembers,function(req, res, next){
  res.render('dashboard',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    membersPool: membersPool,
    adminsPool: ""
  });
});

router.get('/addadmin', ensureAuthenticated,function(req, res, next){
  res.render('addadmin',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    addadminErr: req.flash('addadminErr'),
    emailErr: req.flash('emailErr'),
    addadminSuc: req.flash('addadminSuc')

  });
});

router.get('/viewadmin', ensureAuthenticated, getAllAdmins, function(req, res, next){
  res.render('viewadmin',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    adminsPool: ""
  });
});

router.get('/settings', ensureAuthenticated,function(req, res, next){
  res.render('settings',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    settingErr: req.flash('settingErr'),
    updateErr: req.flash('updateErr'),
    settingSuc: req.flash('settingSuc')
  });
});

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Admin.getAdminById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login', function(req, res, next){
  var username, password, details;
  username = req.body.username;
  password = req.body.password;
  
  Admin.checkAdminUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      req.flash('loginErrU', 'Unknown Username!');
      res.redirect('/admin');
    }else{
      Admin.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          req.login(user, function(err){
            if(err)throw err;
            res.redirect('/admin/dashboard');
          });
        }else{
          req.flash('loginErrU', 'Oops, password is invalid!');
          res.redirect('/admin');
        }
      });
    }
  });

});

router.post('/addadmin', function(req, res, next){
  var name, email, username, password, conpassword, globalAdmin, time;
  name = req.body.name;
  email =  req.body.email;
  username =  req.body.username;
  password =  req.body.password;
  globalAdmin = req.body.globalAdmin;
  time = new Date();

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email Address is required').notEmpty();
  req.checkBody('email', 'Email Address is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password', 'Password lenght must be within 8 and 12 characters').len(8, 12);
  req.checkBody('globalAdmin', 'Global Admin is required').notEmpty();
  
  
  var result = req.getValidationResult();
  req.getValidationResult().then(function(result){
    if(!result.isEmpty()){
      var errors = result.array();
      req.flash('addadminErr', errors);
      res.redirect('/admin/addadmin');
    }else{

      if(globalAdmin == 'Choose...'){
        globalAdmin = false;
      }

      if(globalAdmin == 'No'){
        globalAdmin = false;
      }

      if(globalAdmin == 'Yes'){
        globalAdmin = true;
      }

      Admin.checkAdminEmail(email, function(err, user){
        if(err)throw err;
        if(!user){
          Admin.checkAdminUsername(username, function(err, user){
            if(!user){
              var newAdmin  = new Admin ({
                name: name,
                username: username,
                email: email,
                password: password,
                globalAdmin: globalAdmin,
                time : time
              });
    
              Admin.createAdmin(newAdmin, function(err, user){
                if(err) throw err;
                console.log(user);
                req.flash('addadminSuc', 'Admin added successfully!');
                res.redirect('/admin/addadmin');
              });
            }else{
              req.flash('emailErr', 'Username is taken');
              res.redirect('/admin/addadmin');
            }
          });
          }else{
            req.flash('emailErr', 'Email already exists!');
            res.redirect('/admin/addadmin');
          }
        });
    }
  });
});

router.post('/updateusername', function(req, res, next){
  var olddie, newwie;
  olddie = req.body.olddie;
  newwie = req.body.newwie;

    req.checkBody('olddie', 'Former Username is required').notEmpty();
    req.checkBody('newwie', 'New Username is required').notEmpty();
    
    req.getValidationResult().then(function(result){
      if(!result.isEmpty()){
        var errors = result.array();
        req.flash('settingErr', errors);
        res.redirect('/admin/settings');
      }else{
        if(req.user.username != olddie){
          req.flash('updateErr', 'Former Username do not tally');
          res.redirect('/admin/settings');
        }else{
         if(olddie == newwie){
            req.flash('updateErr', 'New Username must not be the same as the Old Useranme');
            res.redirect('/admin/settings');
          }else{
            Admin.checkAdminUsername(newwie, function(err, user){
              if(err) throw err;
              if(!user){
                var getAdmin = {
                  olddie: olddie,
                  newwie: newwie
                }
                Admin.updateUsername(getAdmin, function(err, numAffected){
                  if(err) throw err;
                  req.flash('settingSuc', 'Username updated successfully');
                  res.redirect('/admin/settings');
                });
              }else{
                req.flash('updateErr', 'Username already exists!');
                res.redirect('/admin/settings');
              }
            });
          }
        }
      }
    });
  
});

router.post('/updateemail', function(req, res, next){
  var emailolddie, emailnewwie;
  emailolddie = req.body.emailolddie;
  emailnewwie = req.body.emailnewwie;

    req.checkBody('emailolddie', 'Former Email Address is required').notEmpty();
    req.checkBody('emailnewwie', 'New Email Address is required').notEmpty();
    req.checkBody('emailolddie', 'Former Email Address is not valid').isEmail();
    req.checkBody('emailnewwie', 'New Email Address is not valid').isEmail();

    req.getValidationResult().then(function(result){
      if(!result.isEmpty()){
        var errors = result.array();
        req.flash('esettingErr', errors);
        res.redirect('/admin/settings');
      }else{
        if(req.user.email != emailolddie){
          req.flash('eupdateErr', 'Former Email Address do not tally');
          res.redirect('/admin/settings');
        }else{
         if(emailolddie == emailnewwie){
            req.flash('eupdateErr', 'New Email Address must not be the same as the Old Email Address');
            res.redirect('/admin/settings');
          }else{
            Admin.checkAdminEmail(emailnewwie, function(err, user){
              if(err) throw err;
              if(!user){
                var getAdmin = {
                  emailolddie: emailolddie,
                  emailnewwie: emailnewwie
                }
                Admin.updateEmail(getAdmin, function(err, numAffected){
                  if(err) throw err;
                  req.flash('esettingSuc', 'Email Address updated successfully');
                  res.redirect('/admin/settings');
                });
              }else{
                req.flash('eupdateErr', 'Email Addres already exists!');
                res.redirect('/admin/settings');
              }
            });
          }
        }
      }
    });
  
});

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/admin');
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }else{
      req.flash('ensurelogin','Access is restricted!');
      res.redirect('/admin');
  }
} 

function getAllMembers(req, res, next){
  Member.findAllMembers(function(err, data){
    if(err)throw err;
    return data;
  });
  next();
}

function getAllAdmins(req, res, next){
  Admin.findAllAdmins(function(err, data){
    if(err)throw err;
    return data;
  });
  next();
}


module.exports = router;
