var Git = require('nodegit'),
    engine = require('./engine');

var render = {};

render.index = function(req,res)
{
    res.render('index',{user:req.session.username});
};

render.login = function(req,res)
{
    var username = req.body.username,
        password = req.body.password;
    if(username === '' || password === '') res.render('login',{error:'No empty fields'});
    engine.login(username,password).then(function(username) {
        req.session.username = username;
        res.redirect('/');
    },function(error) {
        res.render('login',{error:error});
    });
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

render.userHome = function(req,res)
{
    engine.listReposForUser(req.params.user).then(function(files){
        res.render('user',{repos:files,user:req.params.user});
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
                res.render('empty');
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
    engine.getFileOrTree(req.params.user,req.params.repo,req.params.branch,filepath).then(function(entry) {
        if(entry.isTree())
        {
            entry.getTree().then(function(dir){
                res.render('tree',{dir:filepath,files:dir.entries(),branch:req.params.branch,repo:req.params.repo,owner:req.params.user});
            });
        }
        else if(entry.isFile())
        {
            entry.getBlob().then(function(blob){
                render.makeRequest(req,res,'file',{file:blob});
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
    if(req.session.username !== undefined)
    {
        engine.makeUser(req.session.username).then(function(user){
            obj.user = user;
            res.render(view,obj);
        });
    }
    else 
    {
        res.render(view,obj);
    }
};

module.exports = render;
