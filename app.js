var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var expressVue = require('express-vue');

var app = express();
const vueOptions = {
    vueOptions: "2.4.2",
    rootPath: path.join(__dirname, '/views'),
    vue: {head: {
      meta: [
        {script: "https://unpkg.com/vue@2.4.2/dist/vue.js"},
        {script: "https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.0/axios.min.js"},
        {script: "https://code.jquery.com/jquery-3.6.0.js"},
        {script: "https://code.jquery.com/ui/1.13.2/jquery-ui.js"},
        {style: "//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css"},
        {script: "https://cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js"}
      ]
    }}
};
const expressVueMiddleware = expressVue.init(vueOptions);
app.use(expressVueMiddleware);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/submit', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.renderVue('error.vue', {error: err}, vueOptions);
});

module.exports = app;
