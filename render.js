var express = require('express'),
    app = express(),
    Git = require('nodegit'),
    engine = require('./engine');

exports.indexRepo = function(req,res)
{
    var branch;
    if(req.query.branch !== undefined) branch = req.query.branch;
    else branch = "master";
    var entries;
    var branchList;
    var promise1 = new Promise(function(resolve,reject) {
        engine.getIndex(req.params.repo,branch).then(function(tree) {
            entries = tree.entries();
            resolve(tree.entries());
        });
    });
    var promise2 = new Promise(function(resolve,reject) {
        engine.getBranches(req.params.repo).then(function(branches) {
            branchList = branches;
            resolve(branches);
        });
    });
    Promise.all([promise1,promise2]).then(function()
    {
        res.render('index',{root:'',files:entries,branch:branch,repo:req.params.repo,branchList:branchList});
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
    var re = new RegExp('^.+\/tree\/' + req.params.branch + '\/');
    var filepath = req.path.replace(re,'');
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

