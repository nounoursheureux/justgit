var express = require('express'),
    app = express(),
    render = require('./render'),
    api = require('./api');


module.exports = function(app)
{
    app.get('/api/:repo',api.indexRepo);
    app.get('/api/:repo/branches',api.branchesList);
    app.get('/api/:repo/tree/:branch/*',api.getFileOrTree);

    app.get('/:repo',render.indexRepo);
    app.get('/:repo/branches',render.branchesList);
    app.get('/:repo/tree/:branch/*',render.repoTree);
    app.get('/:repo/tree/:branch',function(req,res){
        res.redirect('/' + req.params.repo);
    });
};
