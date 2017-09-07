var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
var date = require('date-and-time');

//var mongoose = require('mongoose');
var mongodb = require('mongodb').MongoClient;

var url = "mongodb://core.icp-si.com:10807/hok";
var error_count = 0;

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

function InitInterval(){
    console.log('Initialize Complete.');
    setInterval(updatechart, 60000);
    setInterval(updatedata, 3000);
}

InitInterval();

function Initerr() {
    mongodb.connect(url, function (err, db) {
        if(err)throw err;
        db.collection('ErrorEven_log').find().toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            error_count = objects.length;
            socket.emit('update_errcount', objects.length.toString());
            socket.emit('error_info_page', objects);
            db.close();
        });
    });
}


function Initchart() {
    var data = [];
    mongodb.connect(url, function (err, db) {
        db.collection('Device_info').find({Room_num:{$gt:400}}).sort({_id:-1}).limit(6).toArray(function (mongoError, objects) {
            if(mongoError) throw mongoError;
            objects.sort(function (a ,b) {
                return a.Room_num - b.Room_num;
            });
            var rmkWh = {
                Rm_401: objects[0]['kW_tot'],
                Rm_402: objects[1]['kW_tot'],
                Rm_403: objects[2]['kW_tot'],
                Rm_404: objects[3]['kW_tot'],
                Rm_405: objects[4]['kW_tot'],
                Rm_406: objects[5]['kW_tot'],
                Rm_401h: objects[0]['kWh_tot'],
                Rm_402h: objects[1]['kWh_tot'],
                Rm_403h: objects[2]['kWh_tot'],
                Rm_404h: objects[3]['kWh_tot'],
                Rm_405h: objects[4]['kWh_tot'],
                Rm_406h: objects[5]['kWh_tot']
            };
            socket.emit('update_pie', rmkWh);
        });
        db.collection('Device_info').find({Room_num:{$gt:400}}).sort({_id:-1}).limit(6).toArray(function (mongoError, objects) {
            if(mongoError) throw mongoError;
            objects.sort(function (a ,b) {
                return a.Room_num - b.Room_num;
            });
            var rmkWh = {
                Rm_401: objects[0]['kW_tot'] * 1000,
                Rm_402: objects[1]['kW_tot'] * 1000,
                Rm_403: objects[2]['kW_tot'] * 1000,
                Rm_404: objects[3]['kW_tot'] * 1000,
                Rm_405: objects[4]['kW_tot'] * 1000,
                Rm_406: objects[5]['kW_tot'] * 1000
            };
            socket.emit('update_kWh', rmkWh);
        });

        db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(2000).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            for (var i = 0; i < 2000; i++) {
                data.push({
                    kWh: objects[i]['kWh_tot'],
                    AvgV: objects[i]['V_avg'],
                    AvgI: objects[i]['I_avg'],
                    kW: objects[i]['kW_tot'],
                    WCL: objects[i]['wc_light_status'],
                    WDL: objects[i]['windows_light_status'],
                    RMC1: objects[i]['Room_lights_C1'],
                    RMC2: objects[i]['Room_lights_C2'],
                    RMC3: objects[i]['Room_lights_C3'],
                    BDLC1: objects[i]['BedLeft_lights_C1'],
                    BDRC1: objects[i]['BedRight_lights_C1'],
                    TIME: date.format(objects[i]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                });
            }
            socket.emit('rm402_chart_init', data);
        });

        db.collection('Device_info').find({Room_num:402}).sort({_id:-1}).limit(10001).toArray(function (mongoError, objects) {
            if(mongoError) throw mongoError;
            var data = [];
            for(var i = 0;i < objects.length;i++){
                if(i%1000 == 0) {
                    data.push({
                        kWh: objects[i]['kWh_tot'],
                        W: objects[i]['kW_tot'] * 1000,
                        DATE: date.format(objects[i]['sysdatetime'], 'HH:mm:ss')
                    });
                }
            }
            socket.emit('chart_status', data);
            db.close();
        });
    });
}

function Initdata(){
    mongodb.connect(url, function (err, db) {
        db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                kWh: objects[0]['kWh_tot'],
                AvgV: objects[0]['V_avg'],
                AvgI: objects[0]['I_avg'],
                kW: objects[0]['kW_tot'],
                WCL: objects[0]['wc_light_status'],
                WDL: objects[0]['windows_light_status'],
                RMC1: objects[0]['Room_lights_C1'],
                RMC2: objects[0]['Room_lights_C2'],
                RMC3: objects[0]['Room_lights_C3'],
                BDLC1: objects[0]['BedLeft_lights_C1'],
                BDRC1: objects[0]['BedRight_lights_C1']
            };
            socket.emit('rm402_init', data);
            db.close();
        });
    });
}

function updatechart() {
    mongodb.connect(url, function (err, db) {
        db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = [];
            for(var i=0;i<60;i++) {
                data.push({
                    kWh: objects[i]['kWh_tot'],
                    AvgV: objects[i]['V_avg'],
                    AvgI: objects[i]['I_avg'],
                    kW: objects[i]['kW_tot'],
                    WCL: objects[i]['wc_light_status'],
                    WDL: objects[i]['windows_light_status'],
                    RMC1: objects[i]['Room_lights_C1'],
                    RMC2: objects[i]['Room_lights_C2'],
                    RMC3: objects[i]['Room_lights_C3'],
                    BDLC1: objects[i]['BedLeft_lights_C1'],
                    BDRC1: objects[i]['BedRight_lights_C1'],
                    TIME: date.format(objects[i]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                });
            }
            socket.emit('rm402_chart_data', data);
            db.close();
        });
        db.collection('Device_info').find({Room_num:{$gt:400}}).sort({_id:-1}).limit(6).toArray(function (mongoError, objects) {
            if(mongoError) throw mongoError;
            objects.sort(function (a ,b) {
                return a.Room_num - b.Room_num;
            });
            var rmkWh = {
                Rm_401: objects[0]['kW_tot'] * 1000,
                Rm_402: objects[1]['kW_tot'] * 1000,
                Rm_403: objects[2]['kW_tot'] * 1000,
                Rm_404: objects[3]['kW_tot'] * 1000,
                Rm_405: objects[4]['kW_tot'] * 1000,
                Rm_406: objects[5]['kW_tot'] * 1000
            };
            socket.emit('update_kWh', rmkWh);
            db.close();
        });
    });
}

function updatedata() {
    mongodb.connect(url, function (err, db) {
        db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                kWh: objects[0]['kWh_tot'],
                AvgV: objects[0]['V_avg'],
                AvgI: objects[0]['I_avg'],
                kW: objects[0]['kW_tot'],
                WCL: objects[0]['wc_light_status'],
                WDL: objects[0]['windows_light_status'],
                RMC1: objects[0]['Room_lights_C1'],
                RMC2: objects[0]['Room_lights_C2'],
                RMC3: objects[0]['Room_lights_C3'],
                BDLC1: objects[0]['BedLeft_lights_C1'],
                BDRC1: objects[0]['BedRight_lights_C1']
            };
            db.close();
            socket.emit('rm402_data', data);
        });
        db.collection('ErrorEven_log').find().toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            if (error_count > objects.length) {
                var tmp = [];
                for(var i=0;i<error_count - objects.length;i++){
                    tmp[i] = objects[i];
                }
                socket.emit('error_info', tmp);
                socket.emit('update_errcount', objects.length.toString());
                error_count = objects.length;
            }
            db.close();
            //socket.emit('error_info' ,objects);
        });
    });
}

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
    socket.on('done', function () {
        Initerr();
        Initdata();
        Initchart();
    });
});