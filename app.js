const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('express-async-errors');
const {auth} = require('./auth');

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');

process.on('unhandledRejection', error => {
    console.error('unhandledRejection', error);
});

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', authRouter);

app.use('/api/user', auth, userRouter);

const spaIndex = path.join(__dirname, 'public/index.html');

app.get('*', (req, res) => {
    res.sendFile(spaIndex);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.json({
        status: 500,
        message: String(err),
    });
});

module.exports = app;
