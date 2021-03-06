var Git = require('nodegit'),
    path = require('path'),
    fs = require('fs'),
    engine = require('./engine');

var render = {};

render.index = function(req,res)
{
    render.makeRequest(req,res,'index');
};

render.login = function(req,res)
{
    var username = req.body.username,
        password = req.body.password;
    if(username === '' || password === '') render.makeRequest(req,res,'login',{error:'No empty fields'});
    engine.login(username,password).then(function(username) {
        req.session.username = username;
        res.redirect('/');
    },function(error) {
        res.render('login',{error:error});
    });
};

render.register = function(req,res)
{
    var username = req.body.username.trim(),
        password = req.body.password,
        passwordbis = req.body.password2,
        email = req.body.email.trim();
    if(username === '' || password === '' || passwordbis === '' || email === '') res.render('register',{error:'No empty fields'});
    if(password != passwordbis) res.render('register',{error:'The passwords don\'t match'});
    else engine.register(username,password,email).then(function(username) {
        res.redirect('/');
    },function(error) {
        render.makeRequest(req,res,'register',{error:error});
    });
};

render.userHome = function(req,res)
{
    engine.listReposForUser(req.params.user).then(function(files){
        render.makeRequest(req,res,'user',{repos:files,owner:req.params.user});
    },function(error) {
        res.status(404).render('404');
    });
};

render.indexRepo = function(req,res)
{
    var branch;
    if(req.query.branch !== undefined) branch = req.query.branch;
    else branch = "master";
    var entries;
    var branchList;
    var repoList;
    var userObj;
    var promise1 = new Promise(function(resolve,reject) {
        engine.getIndex(req.params.user,req.params.repo,branch).then(function(tree) {
            entries = tree.entries();
            resolve(tree.entries());
        },function(error){
            if(error.name == 'EmptyRepositoryError') 
            {
                render.makeRequest(req,res,'empty');
                return;
            }
        });
    });
    var promise2 = new Promise(function(resolve,reject) {
        engine.getBranches(req.params.user,req.params.repo).then(function(branches) {
            branchList = branches;
            resolve(branches);
        });
    });
    Promise.all([promise1,promise2]).then(function()
    {
        render.makeRequest(req,res,'repo',{root:'',files:entries,branch:branch,repo:req.params.repo,branchList:branchList,owner:req.params.user});
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
    engine.getFileOrTree(req.params.user,req.params.repo,req.params.branch,filepath).then(function(entry) {
        if(entry.isTree())
        {
            entry.getTree().then(function(dir){
                render.makeRequest(req,res,'tree',{dir:filepath,files:dir.entries(),branch:req.params.branch,repo:req.params.repo,owner:req.params.user});
            });
        }
        else if(entry.isFile())
        {
            fileToLang(path.parse(entry.path()).base).then(function(language) {
                entry.getBlob().then(function(blob){
                    render.makeRequest(req,res,'file',{file:blob,language:language});
                });
            });
        }
    });
};

render.newRepo = function(req,res)
{
    if(req.session.username)
    {
        engine.createEmptyRepo(req.session.username,req.body.reponame).then(function(repo){
            res.redirect('/'); 
        });      
    }
    else
    {
        res.redirect('/login');
    }
};

render.makeRequest = function(req,res,view,obj)
{
    if(!obj) obj = {};
    if(req.session.username !== undefined)
    {
        engine.makeUser(req.session.username).then(function(user){
            console.log('finished');
            obj.user = user;
            res.render(view,obj);
        });
    }
    else 
    {
        res.render(view,obj);
    }
};

function fileToLang(file)
{
    return new Promise(function(resolve,reject) {
        fs.readFile('languages.json',{encoding:'utf8'},function(err,data) {
            if(err) throw err; 
            var map = JSON.parse(data);
            var lang;
            for(var regex in map)
            {
                if(file.match(regex)) lang = map[regex];
            }
            resolve(lang);
        });
    });
}

module.exports = render;
