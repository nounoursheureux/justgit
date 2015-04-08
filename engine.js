var express = require('express'),
    app = express(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('data/db.sql'),
    crypto = require('crypto'),
    Git = require('nodegit');

var engine = {};

engine.initDatabase = function()
{
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users(username VARCHAR(20) UNIQUE,password CHAR(128))");
        db.run("CREATE TABLE IF NOT EXISTS repos(name VARCHAR(40),owner VARCHAR(20))");
    });
};

engine.getBranches = function(reponame)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + reponame).then(function(repo){
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

engine.getIndex = function(reponame,branch)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + reponame).then(function(repo){
            repo.getBranchCommit(branch).then(function(commit){
                commit.getTree().then(function(tree){
                    resolve(tree);
                });
            });
        });
    });
};

engine.getFileOrTree = function(reponame,branch,filepath)
{
    return new Promise(function(resolve,reject) {
        Git.Repository.open("repos/" + reponame).then(function(repo){
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
                if(data === undefined)
                {
                    db.run("INSERT INTO users VALUES ('" + username + "','" + hashedPass + "');");
                    resolve(username);
                }
                else
                {
                    reject('The user already exists');
                }
            });
        });
    });
};

module.exports = engine;
