var express = require('express'),
    app = express(),
    Git = require('nodegit');

var engine = {};

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

module.exports = engine;
