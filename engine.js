var express = require('express'),
    app = express(),
    Git = require('nodegit');

exports.getBranches = function(reponame)
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
