var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var helmet = require('helmet');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var appdetails = require('./config/appdetails.json');
var flash = require('connect-flash');
var passport = require('passport');
var bcrypt = require('bcrypt');
var connectMongo = require('connect-mongo')(session);
var config = require('./config/config');
var moment = require('moment');

var index = require('./routes/index');
var admin = require('./routes/admin');

var app = express();

app.use(helmet());  
app.disable('x-powered-by');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(process.env.PORT){
    app.use(session({
        secret: appdetails.sessionSecret,
        saveUninitialized: true,
        resave: true,
        store: new connectMongo({
            url: config.dbURL,
            stringify: true
        })
      }));
}else{
    app.use(session({
        secret: appdetails.sessionSecret,
        saveUninitialized: true,
        resave: true
      }));
}

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(expressValidator({
    errorFormatter: function(param, msg, vaue){
        var namespace = param.split('.')
        , root = namespace.shift() 
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            vaue: vaue
        }
    }
}));

app.use('*',function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

app.use('/', index);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.render('404', {
    title: appdetails.Title,
    author: appdetails.Author,
    desc: appdetails.Description
  }); 
  // err.status = 404;
  // next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
