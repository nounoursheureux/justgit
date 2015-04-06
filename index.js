var express = require('express');
var app = express();
var path = require('path');
var bodyparser = require('body-parser');
var Git = require('nodegit');

app.use(bodyparser.urlencoded({extended:false}));
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));

app.get('/',function(req,res){
    Git.Repository.open("repos").then(function(repo){
        repo.getBranchCommit('master').then(function(commit){
            commit.getTree().then(function(tree){
                res.render('index',{root:'',files:tree.entries()});
            });
        });
    });
});
app.get('/*',function(req,res){
    Git.Repository.open("repos").then(function(repo){
        repo.getBranchCommit('master').then(function(commit){
            commit.getEntry(req.path.substr(1)).then(function(entry){
                if(entry.isTree())
                {
                    entry.getTree().then(function(tree){
                        res.render('index',{root:tree.path(),files:tree.entries()});
                    });
                }
                else if(entry.isFile())
                {
                    entry.getBlob().then(function(blob){
                        res.render('file',{file:blob});
                    });
                }
            });
        });
    });
});
app.listen(3000);
