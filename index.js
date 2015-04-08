var express = require('express'),
    app = express(),
    path = require('path'),
    bodyparser = require('body-parser'),
    session = require('express-session'),
    render = require('./render'),
    engine = require('./engine');

app.use(bodyparser.urlencoded({extended:true}));
app.use(session({
    secret: 'just-git',
    resave: false,
    saveUninitialized: false
}));
var routes = require('./routes')(app);
app.use(express.static('public'));
app.use(express.static('repos'));
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));
engine.initDatabase();
app.listen(3000);
