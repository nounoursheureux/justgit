var render = require('./render'),
    git = require('./git'),
    express = require('express'),
    api = require('./api');

module.exports = function(app)
{
    app.get('/',render.index);
    app.route('/login')
        .get(function(req,res,next) {
            render.makeRequest(req,res,'login');
        })
        .post(render.login);
    app.route('/register')
        .get(function(req,res,next) {
            render.makeRequest(req,res,'register');
        })
        .post(render.register);
    app.get('/404',function(req,res) {
        render.makeRequest(req,res,'404');
    });
    app.route('/new')
        .get(function(req,res,next){
            if(req.session.username !== undefined) render.makeRequest(req,res,'new');
            else res.redirect('/login');
        })
        .post(render.newRepo);
    app.get('/:user',render.userHome);
    app.get('/:user/:repo',render.indexRepo);
    app.get('/:user/:repo/tree/:branch/*',render.repoTree);
    app.get('/:user/:repo/tree/:branch',function(req,res){
        res.redirect('/' + req.params.repo);
    });
    app.get('/:user/:repo/info/refs*',git.handleRequest);
    app.post('/:user/:repo/git-receive-pack',git.handleRequest);
    app.post('/:user/:repo/git-upload-pack',git.handleRequest);
    app.get('/api/:repo',api.indexRepo);
    app.get('/api/:repo/branches',api.branchesList);
    app.get('/api/:repo/tree/:branch/*',api.getFileOrTree);
};

