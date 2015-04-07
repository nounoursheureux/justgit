var express = require('express'),
    app = express(),
    path = require('path'),
    bodyparser = require('body-parser'),
    render = require('./render'),
    routes = require('./routes')(app);

app.use(bodyparser.urlencoded({extended:false}));
app.use(express.static('public'));
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));
app.listen(3000);
