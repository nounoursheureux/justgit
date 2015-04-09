var render = require('./render'),
    path = require('path'),
    spawn = require('child_process').spawn,
    auth = require('basic-auth'),
    pushover = require('pushover'),
    repos = pushover('repos'),
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
            res.render('new');
        })
        .post(render.newRepo);
    app.route('/clone')
        .get(function(req,res,next) {
            res.render('clone');
        })
        .post(render.cloneRepo);
    app.get('/:user',render.userHome);
    app.get('/:user/:repo',render.indexRepo);
    app.get('/:user/:repo/branches',render.branchesList);
    app.get('/:user/:repo/tree/:branch/*',render.repoTree);
    app.get('/:user/:repo/tree/:branch',function(req,res){
        res.redirect('/' + req.params.repo);
    });
    app.get('/:user/:repo/info/refs*',function(req,res){
        console.log('git info req');
        repos.handle(req,res);
    });
    app.post('/:user/:repo/git-receive-pack',function(req,res) {
        repos.handle(req,res);
    });
    app.post('/:user/:repo/git-upload-pack',function(req,res) {
        repos.handle(req,res);
    });
    app.get('/api/:repo',api.indexRepo);
    app.get('/api/:repo/branches',api.branchesList);
    app.get('/api/:repo/tree/:branch/*',api.getFileOrTree);
};

repos.on('push',function(push) {
    push.accept();
});
