var express = require('express'),
    app = express(),
    Git = require('nodegit'),
    request = require('request'),
    engine = require('./engine');

exports.indexRepo = function(req,res)
{
    var branch;
    if(req.query.branch !== undefined) branch = req.query.branch;
    else branch = "master";
    engine.getIndex(req.params.repo,branch).then(function(tree) {
        res.render('index',{root:'',files:tree.entries(),branch:branch,repo:req.params.repo});
    });
};

exports.branchesList = function(req,res)
{
    engine.getBranches(req.params.repo).then(function(branches) {
        res.render('branches',{branches:branches});
    });
};

exports.repoTree = function(req,res)
{
    var filepath = req.path.replace(/^.+\/tree\/master\//,'');
    if(filepath === '')
    {
        res.redirect('/' + req.params.repo);
        return;
    }
    engine.getFileOrTree(req.params.repo,req.params.branch,filepath).then(function(entry) {
        if(entry.isTree())
        {
            entry.getTree().then(function(dir){
                res.render('tree',{dir:filepath,files:dir.entries(),branch:req.params.branch,repo:req.params.repo});
            });
        }
        else if(entry.isFile())
        {
            entry.getBlob().then(function(blob){
                res.render('file',{file:blob});
            });
        }
    });
};

