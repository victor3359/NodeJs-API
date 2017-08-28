var express = require('express');
var app = express();
var port = 8080;

app.get('/sample', function(req, res){
    res.send('this is a sample!');
});

var route = express.Router();

route.get('/', function(req, res){
    res.send('this is a homepage!');
});

route.get('/solar', function(req, res){
    res.send('this is a solar page!');
});

route.get('/office', function(req, res){
    res.send('this is a office page!');
});

route.get('/room', function(req, res){
    res.send('this is a room page!');
});

app.use('/', route);
//Start the server
app.listen(port);