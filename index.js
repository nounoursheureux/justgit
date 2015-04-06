var express = require('express');
var app = express();
var path = require('path');
var bodyparser = require('body-parser');
var Git = require('nodegit');

app.use(bodyparser.urlencoded({extended:false}));
app.set('view engine','jade');
app.set('views',path.join(__dirname,'templates'));

app.get('/',function(req,res){
    var branch;
    if(req.query.branch !== undefined) branch = req.query.branch;
    else branch = "master";
    Git.Repository.open("repos").then(function(repo){
        repo.getBranchCommit(branch).then(function(commit){
            commit.getTree().then(function(tree){
                res.render('index',{root:'',files:tree.entries(),branch:branch});
            });
        });
    });
});
app.get('/branches',function(req,res){
    Git.Repository.open("repos").then(function(repo){
        repo.getReferenceNames(Git.Reference.TYPE.OID).then(function(branches){
            branches.forEach(function(branch){
                branch.replace(/^refs\/heads\//,'');
            });
            res.render('branches',{branches:branches});
        });
    }); 
});
app.get('/tree/:branch/*',function(req,res){
    Git.Repository.open("repos").then(function(repo){
        var filepath = req.path.replace(/^\/tree\/master\//,'');
        repo.getBranchCommit(req.params.branch).then(function(commit){
            commit.getTree().then(function(tree){
                tree.getEntry(filepath).then(function(entry){
                    if(entry.isTree())
                    {
                        entry.getTree().then(function(dir){
                            res.render('tree',{dir:filepath,files:dir.entries(),branch:req.params.branch});
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
});
app.get('/tree/:branch',function(req,res){
    Git.Repository.open("repos").then(function(repo){
        repo.getBranchCommit(req.params.branch).then(function(commit){
            commit.getTree().then(function(tree){
                res.render('tree',{root:'',files:tree.entries(),branch:req.params.branch});
            });
        }); 
    });
});
app.listen(3000);
