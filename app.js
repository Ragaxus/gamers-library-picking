var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var SQLiteStore = require('connect-sqlite3')(session);

var mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var expressVue = require('express-vue');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'well you know what they say',
  resave: false,
  saveUninitialize: false,
  store: new SQLiteStore({db: 'sessions.db', dir: './var/db'})
}))
app.use(passport.authenticate('session'));

app.use('/api', indexRouter);

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send();
});

module.exports = app;
