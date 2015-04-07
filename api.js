var express = require('express'),
    app = express(),
    Git = require('nodegit'),
    engine = require('./engine');

var api = {};

api.branchesList = function(req,res)
{
    engine.getBranches(req.params.repo).then(function(branches) {
        res.json({repo:req.params.repo,branches:branches});
    });
};

api.indexRepo = function(req,res)
{
    engine.getIndex(req.params.repo,'master').then(function(tree){
        var obj = {};
        obj.childrenCount = tree.entryCount();
        obj.childrens = [];
        tree.entries().forEach(function(entry) {
            var child = {};
            child.name = entry.filename();
            child.directory = entry.isDirectory();
            obj.childrens.push(child);
        });
        res.json(obj);
    });
};

api.getFileOrTree = function(req,res) 
{
    var filepath = req.path.replace(/^.+\/tree\/master\//,'');
    engine.getFileOrTree(req.params.repo,req.params.branch,filepath).then(function(entry) {
        if(entry.isTree())
        {
            entry.getTree().then(function(tree) {
                var obj = treeToJson(tree);
                obj.name = entry.filename();
                res.json(obj);
            });
        }
        else if(entry.isFile())
        {
            entry.getBlob().then(function(blob) {
                var obj = fileToJson(blob);
                obj.name = entry.filename();
                res.json(obj);
            });
        }
    });
};

function treeToJson(tree)
{
    var obj = {};
    obj.childrenCount = tree.entryCount();
    obj.childrens = [];
    tree.entries().forEach(function(entry) {
        var child = {};
        child.name = entry.filename();
        child.directory = entry.isDirectory();
        obj.childrens.push(child);
    });
    return obj;
}

function fileToJson(file)
{
    var obj = {};
    // obj.name = file.filename();
    obj.binary = file.isBinary();
    if(obj.binary)
    {
        // TODO
    }
    else
    {
        obj.content = file.toString();
    }
    return obj;
}
module.exports = api;
