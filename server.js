var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
//var mongoose = require('mongoose');
var mongodb = require('mongodb').MongoClient;

var url = "mongodb://core.icp-si.com:10807/hok";

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
        db.collection('Device_info').find({Room_num: '402'}).sort({_id:-1}).limit(5000).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});

route.get('/r401a', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('Device_info').find({Room_num: '401'}).sort({_id:-1}).limit(5000).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});
route.get('/r401', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('Device_info').find({Room_num: '401'}).sort({_id:-1}).limit(1).toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});

route.get('/err', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('ErrorEven_log').find().toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects);
            db.close();
        });
    });
});

route.get('/err_count', function(req, res){
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('ErrorEven_log').find().toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            res.send(objects.length.toString());
            db.close();
        });
    });
});

app.use('/', route);
//Start the server
app.listen(port);
console.log('Big5-API is listening on port ' + port);


var io = require('socket.io');
var mqtt = require('mqtt');
var opt = {
    port: 1883,
    clientId: 'nodejs',
    username: 'icpsi',
    password: '12345678'
};
var client = mqtt.connect('tcp://core.icp-si.com', opt);

client.on('connect', function () {
    console.log('Connected to MQTT Server.');
});
var socket = io.listen(10000);
socket.sockets.on('connection', function (socket) {
    console.log('Socket Client Connected.');
    socket.on('WCLight', function (data) {
        if(data == 'ON'){
            client.publish('hok/402/light/wc', 'ON');
        }else{
            client.publish('hok/402/light/wc', 'OFF');
        }
        console.log(data);
    });
    socket.on('WDLight', function (data) {
        if(data == 'ON'){
            client.publish('hok/402/light/window', 'ON');
        }else{
            client.publish('hok/402/light/window', 'OFF');
        }
        console.log(data);
    });
    socket.on('RMLight', function (data) {
        if(data == 'ON'){
            client.publish('hok/402/light/guest', 'ON');
        }else{
            client.publish('hok/402/light/guest', 'OFF');
        }
        console.log(data);
    });
    socket.on('BDLeftLight', function (data) {
        if(data == 'ON'){
            client.publish('hok/402/light/bed_left', 'ON');
        }else{
            client.publish('hok/402/light/bed_left', 'OFF');
        }
        console.log(data);
    });
    socket.on('BDRightLight', function (data) {
        if(data == 'ON'){
            client.publish('hok/402/light/bed_right', 'ON');
        }else{
            client.publish('hok/402/light/bed_right', 'OFF');
        }
        console.log(data);
    });
});