var pushover = require('pushover'),
    repos = pushover('repos'),
    auth = require('basic-auth'),
    engine = require('./engine');

var git = {};

git.handleRequest = function(req,res) {
    repos.handle(req,res);
};

repos.on('push',function(push) {
    var credentials = auth(push);
    if(!credentials) 
    {
        push.writeHead(401, {
            'WWW-Authenticate': 'Basic realm="just-git"'
        });
        push.end();
    }
    else
    {
        engine.login(credentials.name,credentials.pass).then(function(user){
            var owner = push.repo.split('/')[0],
                reponame = push.repo.split('/')[1];
            if(owner == user) push.accept();
            else
            {
                push.writeHead(401);
                push.end();
            }
        },function(error){
            push.writeHead(401);
            push.end();
        });
    }
});

module.exports = git;
