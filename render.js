var express = require('express'),
    app = express(),
    Git = require('nodegit'),
    bodyparser = require('body-parser'),
    engine = require('./engine');

app.use(bodyparser.urlencoded({extended:true}));

var render = {};

render.index = function(req,res)
{
    res.end('SWAG');
};

render.login = function(req,res)
{
    var username = req.body.username,
        password = req.body.password;
    if(username === '' || password === '') res.render('login',{error:'No empty fields'});
};

render.register = function(req,res)
{
    var username = req.body.username,
        password = req.body.password,
        passwordbis = req.body.password2;
    if(username === '' || password === '' || passwordbis === '') res.render('register',{error:'No empty fields'});
    if(password != passwordbis) res.render('register',{error:'The passwords don\'t match'});
    else engine.register(username,password).then(function(username) {
        res.redirect('/');
    },function(error) {
        res.render('register',{error:error});
    });
};

render.indexRepo = function(req,res)
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
        res.render('repo',{root:'',files:entries,branch:branch,repo:req.params.repo,branchList:branchList});
    });
};

render.branchesList = function(req,res)
{
    engine.getBranches(req.params.repo).then(function(branches) {
        res.render('branches',{branches:branches});
    });
};

render.repoTree = function(req,res)
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

module.exports = render;
