var express = require('express'),
    app = express(),
    Git = require('nodegit'),
    engine = require('./engine');

exports.branchesList = function(req,res)
{
    engine.getBranches(req.params.repo).then(function(branches) {
        res.json({repo:req.params.repo,branches:branches});
    });
};

exports.indexRepo = function(req,res)
{
    res.json({msg:'Coucou'});
};

