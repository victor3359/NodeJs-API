var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
//var mongoose = require('mongoose');
var mongodb = require('mongodb').MongoClient;

var url = "mongodb://192.168.100.181:27017/hok";

app.use(cors());
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

route.get('/r402', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('Device_info').find({Room_num: '402'}).sort({_id:-1}).limit(1).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});

route.get('/r402a', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('Device_info').find({Room_num: '402'}).sort({_id:-1}).limit(3600).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});



app.use('/', route);
//Start the server
app.listen(port);
console.log('Big5-API is listening on port ' + port)