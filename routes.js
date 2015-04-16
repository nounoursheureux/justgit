var render = require('./render'),
    git = require('./git'),
    express = require('express'),
    api = require('./api');

module.exports = function(app)
{
    app.get('/',render.index);
    app.route('/login')
        .get(function(req,res,next) {
            res.render('login');
        })
        .post(render.login);
    app.route('/register')
        .get(function(req,res,next) {
            res.render('register');
        })
        .post(render.register);
    app.get('/404',function(req,res) {
        res.render('404');
    });
    app.route('/new')
        .get(function(req,res,next){
            if(req.session.username !== undefined) res.render('new');
            else res.redirect('/login');
        })
        .post(render.newRepo);
    app.route('/clone')
        .get(function(req,res,next) {
            if(req.session.username !== undefined) res.render('clone');
            else res.redirect('/login');
        })
        .post(render.cloneRepo);
    app.get('/:user',render.userHome);
    app.get('/:user/:repo',render.indexRepo);
    app.get('/:user/:repo/branches',render.branchesList);
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

