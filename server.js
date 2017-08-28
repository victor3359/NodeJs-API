var express = require('express');
var app = express();
var port = 8080;
//var mongoose = require('mongoose');
var mongodb = require('mongodb').MongoClient;

var url = "mongodb://192.168.100.181:27017/hok";


/*MongoClient.connect("mongodb://192.168.100.181:27017/hok", function (err, db) {
    db.connection("Device_info",function (err, collection) {
        collection.find().toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            console.log(objects);
            console.log('we find ' + objects.length + 'results!');
        });
    });
    db.close();
});*/
//mongoose.connect('mongodb://192.168.100.181:27017/hok')

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

route.get('/room/:id', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('Device_info').find().limit(parseInt(req.params.id)).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.json(objects);
            console.log(objects);
            console.log('Found '+objects.length+' Results.');
            db.close();
        });
    });
});

app.use('/', route);
//Start the server
app.listen(port);
console.log('Big5-API is listening on port ' + port)