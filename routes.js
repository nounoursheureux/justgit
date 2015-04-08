var express = require('express'),
    app = express(),
    render = require('./render'),
    path = require('path'),
    backend = require('git-http-backend'),
    spawn = require('child_process').spawn,
    auth = require('basic-auth');
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
    app.get('/:repo/info/refs*',function(req,res) {
        handleGitRequest(req,res);
    });
    app.post('/:repo/git-upload-pack',function(req,res){
        handleGitRequest(req,res);
    });
    app.post('/:repo/git-receive-pack',function(req,res){
        var credentials = auth(req);
        if(!credentials) 
        {
            res.writeHead(401, {
                'WWW-Authenticate': 'Basic realm="yolo"'
            });
            res.end();
        }
        else if(credentials.name !== 'nounours' || credentials.pass !== 'pass')
        {
            res.writeHead(401);
            res.end();
        }
        else handleGitRequest(req,res);
    });
};

function handleGitRequest(req,res)
{
    var repo = req.params.repo;
    var dir = path.join(__dirname, 'repos', repo);

    req.pipe(backend(req.url, function (err, service) {
        if (err) return res.end(err + '\n');
        res.setHeader('content-type', service.type);
        var ps = spawn(service.cmd, service.args.concat(dir));
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
    })).pipe(res);
}
