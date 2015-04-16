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
app.use(express.static('public'));
var routes = require('./routes')(app);
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));
engine.initDatabase();
app.listen(process.argv[2]);
