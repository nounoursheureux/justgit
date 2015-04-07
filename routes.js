var express = require('express'),
    app = express(),
    render = require('./render');

module.exports = function(app)
{
    app.get('/:repo',render.indexRepo);
    app.get('/:repo/:branches',render.branchesList);
    app.get('/:repo/tree/:branch/*',render.repoTree);
    app.get('/:repo/tree/:branch',function(req,res){
        res.redirect('/' + req.params.repo);
    });
};
