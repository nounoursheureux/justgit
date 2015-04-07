var express = require('express'),
    app = express(),
    path = require('path'),
    bodyparser = require('body-parser'),
    render = require('./render'),
    routes = require('./routes')(app);

app.use(bodyparser.urlencoded({extended:false}));
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));

app.get('/:repo/tree/:branch/*',function(req,res){
});
app.get('/:repo/tree/:branch',function(req,res){
    res.redirect('/' + req.params.repo);
});
app.listen(3000);

