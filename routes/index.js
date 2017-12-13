var express = require('express');
var router = express.Router();
var appdetails = require('../config/appdetails.json');
var Member = require('../model/memberModel');
var config = require('../config/config');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description,
    regmemberErr: req.flash('regmemberErr'),
    emailErr: req.flash('emailErr'),
    regmemberSuc: req.flash('regmemberSuc')
  });
});


router.post('/regmember', function(req, res, next){
  var firstName, middleName, lastName, dob, phoneNumber, sex, emailAddress, homeAddress, city, state, prayerRequest, time;

  firstName = req.body.firstName;
  middleName = req.body.middleName;
  lastName = req.body.lastName;
  dob = req.body.dob;
  phoneNumber = req.body.phoneNumber;
  sex = req.body.sex;
  emailAddress = req.body.emailAddress;
  homeAddress = req.body.homeAddress;
  city = req.body.city;
  state = req.body.state;
  time = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

  req.checkBody('firstName', 'First Name is required').notEmpty();
  req.checkBody('lastName', 'Last Name is required').notEmpty();
  req.checkBody('dob', 'Date Of Birth is required').notEmpty();
  req.checkBody('phoneNumber', 'Phone Number is required').notEmpty();
  req.checkBody('sex', 'Sex is required').notEmpty();
  req.checkBody('emailAddress', 'Email Address is required').notEmpty();
  req.checkBody('emailAddress', 'Email Address is not valid').isEmail();
  req.checkBody('homeAddress', 'Home Address is required').notEmpty();
  req.checkBody('city', 'City is required').notEmpty();
  req.checkBody('state', 'State is required').notEmpty();


  var result = req.getValidationResult();
  req.getValidationResult().then(function(result){
    if(!result.isEmpty()){
      var errors = result.array();
      req.flash('regmemberErr', errors);
      res.redirect('/');
    }else{

      Member.checkMemberEmail(emailAddress, function(err, user){
        if(err)throw err;
        if(!user){
          var newMember  = new Member ({
            firstName : firstName,
            middleName : middleName,
            lastName : lastName,
            dob : dob,
            phoneNumber : phoneNumber,
            sex : sex,
            emailAddress : emailAddress,
            homeAddress : homeAddress,
            city : city,
            state : state,
            prayerRequest : prayerRequest,
            time : time
          });

          Member.createMember(newMember, function(err, user){
            if(err) throw err;
            console.log(user);
            req.flash('regmemberSuc', 'Thanks for details!');
            res.redirect('/');
          });
          
          }else{
            req.flash('emailErr', 'Email already exists!');
            res.redirect('/');
          }
        });
        
    }
  });


});

module.exports = router;
