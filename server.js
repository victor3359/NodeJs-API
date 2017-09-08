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
        //todo: Init ErrorEvent Data
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
    mongodb.connect(url, function (err, db) {
        //todo: Fourth Floor Circle Chart
        db.collection('Device_info').find({Room_num: {$gt: 400}}).sort({_id: -1}).limit(6).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            objects.sort(function (a, b) {
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
        //todo: Fourth Floor Bar Chart
        db.collection('Device_info').find({Room_num: {$gt: 400}}).sort({_id: -1}).limit(6).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            objects.sort(function (a, b) {
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


        //todo: Room 402 - RealTime Chart
        db.collection('Device_info').aggregate([{$match: {Room_num:402}},
            { "$group": {
                "_id": {
                    "year": { "$year": "$sysdatetime" },
                    "dayOfYear": { "$dayOfYear": "$sysdatetime" },
                    "hour": { "$hour": "$sysdatetime" },
                    "interval": {
                        "$subtract": [
                            { "$minute": "$sysdatetime" },
                            { "$mod": [{ "$minute": "$sysdatetime"}, 1] }
                        ]
                    }
                },
                datetime: { "$first": "$sysdatetime" },
                data: { $first : "$$ROOT" }
            }
            },
            { $sort : { datetime : -1}}, {$limit : 1000}
        ],{allowDiskUse:true}).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var realtimedata = [];
            for(var i=0;i<objects.length;i++) {
                realtimedata.push({
                    kW: objects[i]['data']['kW_tot'],
                    WCL: objects[i]['data']['wc_light_status'],
                    WDL: objects[i]['data']['windows_light_status'],
                    RMC1: objects[i]['data']['Room_lights_C1'],
                    RMC2: objects[i]['data']['Room_lights_C2'],
                    RMC3: objects[i]['data']['Room_lights_C3'],
                    BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                    BDRC1: objects[i]['data']['BedRight_lights_C1'],
                    TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                });
            }
            socket.emit('rm402_chart_init', realtimedata);
        });

        //todo: Room 402 - Status Chart
        db.collection('Device_info').aggregate([{$match: {Room_num:402}},
            { "$group": {
                "_id": {
                    "year": { "$year": "$sysdatetime" },
                    "dayOfYear": { "$dayOfYear": "$sysdatetime" },
                    "interval": {
                        "$subtract": [
                            { "$hour": "$sysdatetime" },
                            { "$mod": [{ "$hour": "$sysdatetime"}, 1] }
                        ]
                    }
                },
                datetime: { "$first": "$sysdatetime" },
                data: { $first : "$$ROOT" }
            }
            },
            { $sort : { datetime : -1 } }
        ],{allowDiskUse:true}).toArray(function (mongoError, objects) {
            if(mongoError) throw mongoError;
            var data = [];
            for(var i=0;i<objects.length;i++){
                data.push({
                    kWh: objects[i]['data']['kWh_tot'],
                    W: objects[i]['data']['kW_tot'] * 1000,
                    TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                });
            }
            data.sort(function (a, b) {
                return b.kWh - a.kWh;
            });
            socket.emit('chart_status', data);
        });
        //todo: Room 402 - Trend Chart
        var data = [];
        var tmp = [];
        db.collection('Device_info').aggregate([{$match: {Room_num:402}},
            { "$group": {
                "_id": {
                    "year": { "$year": "$sysdatetime" },
                    "interval": {
                        "$subtract": [
                            { "$dayOfYear": "$sysdatetime" },
                            { "$mod": [{ "$dayOfYear": "$sysdatetime"}, 1] }
                        ]
                    }
                },
                datetime: { "$first": "$sysdatetime" },
                data: { $first : "$$ROOT" }
            }
            },
            { $sort : { datetime : -1 } }
        ],{allowDiskUse:true}).toArray(function (mongoError,objects) {
            for(var i=0;i<objects.length;i++){
                data.push({
                    kWh: objects[i]['data']['kWh_tot'],
                    TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                });
            }
            data.sort(function (a, b) {
                return a.kWh - b.kWh;
            });
            for(var i=1;i<data.length;i++){
                tmp.push({
                    kWh: data[i]['kWh'] - data[i-1]['kWh'],
                    TIME: data[i-1]['TIME']
                });
            }
            socket.emit('chart_trend', tmp);
        });
    });
}

function Initdata(){
    mongodb.connect(url, function (err, db) {
        //todo: Init Room 402 Data
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
        //todo: Update Room 402 - RealTime Chart
        db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
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
                BDRC1: objects[0]['BedRight_lights_C1'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
            };
            socket.emit('rm402_chart_data', data);
            db.close();
        });
        //todo: Update Fourth Floor Bar Chart
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
        //todo: Update Room 402 Data
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
            socket.emit('rm402_data', data);
            db.close();
        });
        //todo: Update ErrorEvent Data
        db.collection('ErrorEven_log').find().toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            if (objects.length > error_count) {
                var tmp = [];
                for(var i=0;i< objects.length - error_count ;i++){
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