var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('data/db.sql'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    Git = require('nodegit');

var engine = {};

engine.initDatabase = function()
{
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users(username VARCHAR(20) UNIQUE,password CHAR(128))");
        db.run("CREATE TABLE IF NOT EXISTS repos(name VARCHAR(40),owner VARCHAR(20))");
    });
};

engine.getBranches = function(user,reponame)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + user + "/" + reponame + '.git').then(function(repo){
            repo.getReferenceNames(Git.Reference.TYPE.OID).then(function(branches){
                var array = [];
                branches.forEach(function(branch){
                    if(branch.match(/^refs\/heads\//))
                    {
                        array.push(branch.replace(/^refs\/heads\//,''));
                    }
                });
                resolve(array);
            });
        }); 
    });
};

engine.getIndex = function(user,reponame,branch)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + user + '/' + reponame + '.git').then(function(repo){
            repo.getBranchCommit(branch).then(function(commit){
                commit.getTree().then(function(tree){
                    resolve(tree);
                });
            });
        });
    });
};

engine.getFileOrTree = function(user,reponame,branch,filepath)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + user + '/'+ reponame + '.git').then(function(repo){
            repo.getBranchCommit(branch).then(function(commit){
                commit.getTree().then(function(tree){
                    tree.getEntry(filepath).then(function(entry){
                        resolve(entry);
                    });
                });
            });
        });

    });
};

engine.login = function(username,password)
{
    return new Promise(function(resolve,reject) {
        var mix = username + ':' + password + ':h4cK3rW4r';
        var hash = crypto.createHash('sha512');
        hash.update(mix);
        var hashedPass = hash.digest('hex');
        db.serialize(function() {
            db.get("SELECT username FROM users WHERE username='" + username +"';",function(err,data) {
                if(err) throw err;
                if(data === undefined) reject('This user doesn\'t exist');
                else db.get("SELECT username FROM users WHERE username='" + username + "' AND password='" + hashedPass + "';",function(err,data) {
                    if(err) throw err;
                    if(data === undefined) reject('Bad password');
                    else resolve(username);
                });
            });
        });
    });
};

engine.register = function(username,password)
{
    return new Promise(function(resolve,reject) {
        var mix = username + ':' + password + ':h4cK3rW4r';
        var hash = crypto.createHash('sha512');
        hash.update(mix);
        var hashedPass = hash.digest('hex');
        db.serialize(function() {
            db.get("SELECT username FROM users WHERE username='" + username + "';",function(err,data){
                if(err) throw err;
                if(data === undefined) // The user doesn't exists yet
                {
                    db.run("INSERT INTO users VALUES ('" + username + "','" + hashedPass + "');");
                    fs.mkdir('repos/' + username,function(err) {
                        if(err) throw err;
                        resolve(username);
                    });
                }
                else
                {
                    reject('The user already exists');
                }
            });
        });
    });
};

engine.createEmptyRepo = function(username,reponame)
{
    return new Promise(function(resolve,reject){
        db.serialize(function() {
            db.run("INSERT INTO repos VALUES ('" + reponame + "','" + username + "');");
            var pathToRepo = 'repos/' + username + '/' + reponame + '.git';
            fs.mkdir(pathToRepo,function(err) {
                if(err) throw err; 
                Git.Repository.init(pathToRepo,1).then(function(repo){
                    resolve(reponame);
                });
            });
        });
    });
};

engine.cloneRepo = function(username,repourl)
{
    return new Promise(function(resolve,reject) {
        var slicedPath = url.parse(repourl).pathname.split('/');
        var reponame = slicedPath[slicedPath.length-1];
        var localPath = 'repos/' + username + '/' + reponame;
        if(path.extname(localPath) != '.git') localPath += '.git';
        Git.Clone(repourl,localPath,{bare:1}).then(function(repo) {
            db.run("INSERT INTO repos VALUES('" + reponame + "','" + username + "');"); 
            resolve(reponame);
        },function(error) {
            throw error;
        });
    });
};

engine.listReposForUser = function(username)
{
    return new Promise(function(resolve,reject) {
        db.serialize(function() {
            db.get("SELECT * FROM users WHERE username='" + username + "';",function(err,data){
                if(data === undefined) reject(data); 
                else
                {
                    db.all("SELECT name FROM repos WHERE owner='" + username + "';",function(err,data) {
                        if(err) throw err; 
                        var array = [];
                        data.forEach(function(item) {
                            array.push(item.name);
                        });
                        resolve(array); 
                    });
                }
            });
        });
    });
};

module.exports = engine;
