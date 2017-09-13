var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
var date = require('date-and-time');

var updateroom = null;
var oldInterval = null;
var oldchartInterval = null;


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

function Init(room){
    switch(room){
        case '201':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 201 Data
                db.collection('Device_info').find({Room_num: 201}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        TBL: objects[0]['Table_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BTOLC1: objects[0]['BathroomOut_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        BDUC1: objects[0]['BedUp_lights_C1'],
                        BDDC1: objects[0]['BedDown_lights_C1'],
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('rm201_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 201 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 201}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            PWNF: objects[i]['data']['pw_onoff'],
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            TBL: objects[i]['data']['Table_light_status'],
                            RMC1: objects[i]['data']['Room_lights_C1'],
                            RMC2: objects[i]['data']['Room_lights_C2'],
                            BTOLC1: objects[i]['data']['BathroomOut_lights_C1'],
                            BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                            BDRC1: objects[i]['data']['BedRight_lights_C1'],
                            BDUC1: objects[i]['data']['BedUp_lights_C1'],
                            BDDC1: objects[i]['data']['BedDown_lights_C1'],
                            CO2: objects[i]['data']['CO2_CH0'],
                            PM25: objects[i]['data']['PM25_CH0'],
                            RH: objects[i]['data']['RH_CH0'],
                            TEMP: objects[i]['data']['TEMP_CH0'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm201_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 201 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 201}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm201_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 201 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 201}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm201_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '202':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 202 Data
                db.collection('Device_info').find({Room_num: 202}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm202_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 202 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 202}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            WDL: objects[i]['data']['windows_light_status'],
                            GSTC1: objects[i]['data']['Guest_lights_C1'],
                            GSTC2: objects[i]['data']['Guest_lights_C2'],
                            BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                            BDRC1: objects[i]['data']['BedRight_lights_C1'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm202_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 202 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 202}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm202_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 202 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 202}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm202_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '203':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 203 Data
                db.collection('Device_info').find({Room_num: 203}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm203_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 203 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 203}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm203_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 203 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 203}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm203_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 203 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 203}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm203_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '204':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 204 Data
                db.collection('Device_info').find({Room_num: 204}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm204_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 204 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 204}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            PWNF: objects[i]['data']['pw_onoff'],
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm204_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 204 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 204}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm204_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 204 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 204}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm204_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '205':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 205 Data
                db.collection('Device_info').find({Room_num: 205}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        LQL: objects[0]['liquor_lights_status']
                    };
                    socket.emit('rm205_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 205 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 205}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            LQL: objects[i]['data']['liquor_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm205_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 205 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 205}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm205_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 205 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 205}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm205_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '301':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 301 Data
                db.collection('Device_info').find({Room_num: 301}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        RMC3: objects[0]['Room_lights_C3'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm301_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 301 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 301}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RMC1: objects[i]['data']['Room_lights_C1'],
                            RMC2: objects[i]['data']['Room_lights_C2'],
                            RMC3: objects[i]['data']['Room_lights_C3'],
                            GSTC1: objects[i]['data']['Guest_lights_C1'],
                            BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                            BDRC1: objects[i]['data']['BedRight_lights_C1'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm301_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 301 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 301}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm301_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 301 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 301}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm301_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '302':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 302 Data
                db.collection('Device_info').find({Room_num: 302}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm302_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 302 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 302}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            WDL: objects[i]['data']['windows_light_status'],
                            GSTC1: objects[i]['data']['Guest_lights_C1'],
                            GSTC2: objects[i]['data']['Guest_lights_C2'],
                            BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                            BDRC1: objects[i]['data']['BedRight_lights_C1'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm302_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 302 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 302}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm302_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 302 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 302}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm302_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '303':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 303 Data
                db.collection('Device_info').find({Room_num: 303}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm303_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 303 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 303}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm303_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 303 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 303}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm303_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 303 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 303}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm303_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '304':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 304 Data
                db.collection('Device_info').find({Room_num: 304}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm304_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 304 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 304}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm304_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 305 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 304}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm304_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 304 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 304}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm304_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '305':
            mongodb.connect(url, function(err, db){
                //todo: Init Room 305 Data
                db.collection('Device_info').find({Room_num: 305}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm305_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 305 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 305}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm305_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 305 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 305}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm305_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 305 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 305}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm305_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '401':
            mongodb.connect(url, function (err, db) {
                //todo: Init Room 401 Data
                db.collection('Device_info').find({Room_num: 401}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('rm401_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 401 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 401}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            GSTC1: objects[i]['data']['Guest_lights_C1'],
                            GSTC2: objects[i]['data']['Guest_lights_C2'],
                            RMC1: objects[i]['data']['Room_lights_C1'],
                            RMC2: objects[i]['data']['Room_lights_C2'],
                            BDLC1: objects[i]['data']['BedLeft_lights_C1'],
                            BDRC1: objects[i]['data']['BedRight_lights_C1'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm401_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 401 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 401}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm401_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 401 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 401}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm401_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '402':
            mongodb.connect(url, function (err, db) {
                //todo: Init Room 402 Data
                db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
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
            mongodb.connect(url, function(err, db){
                //todo: Room 402 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 402}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
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
                    socket.emit('rm402_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 402 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 402}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm402_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 402 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 402}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm402_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '403':
            mongodb.connect(url, function (err, db) {
                db.collection('Device_info').find({Room_num: 403}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['Room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                    };
                    socket.emit('rm403_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function (err, db) {
                //todo: Room 403 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 403}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['Room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm403_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 403 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 403}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm403_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 403 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 403}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm403_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '404':
            mongodb.connect(url, function (err, db) {
                db.collection('Device_info').find({Room_num: 404}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['Room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm404_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 404 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 404}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDLL: objects[i]['data']['BedLeft_lights_status'],
                            BDRL: objects[i]['data']['BedRight_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm404_chart_rt', realtimedata);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 404 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 404}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm404_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 404 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 404}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm404_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '405':
            mongodb.connect(url, function (err, db) {
                db.collection('Device_info').find({Room_num: 405}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDUL: objects[0]['BedUp_lights_status'],
                        BDDL: objects[0]['BedDown_lights_status']
                    };
                    socket.emit('rm405_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 405 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 405}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            PWNF: objects[i]['data']['pw_onoff'],
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            RML: objects[i]['data']['room_light_status'],
                            BDUL: objects[i]['data']['BedUp_lights_status'],
                            BDDL: objects[i]['data']['BedDown_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm405_chart_rt', realtimedata);
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 405 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 405}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm405_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 405 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 405}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm405_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '406':
            mongodb.connect(url, function (err, db) {
                db.collection('Device_info').find({Room_num: 406}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        BDU1: objects[0]['Bed1Up_lights_status'],
                        BDU2: objects[0]['Bed2Up_lights_status'],
                        BDU3: objects[0]['Bed3Up_lights_status'],
                        BDD1: objects[0]['Bed1Down_lights_status'],
                        BDD2: objects[0]['Bed2Down_lights_status'],
                        BDD3: objects[0]['Bed3Down_lights_status']
                    };
                    socket.emit('rm406_init', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 406 - RealTime Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 406}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "hour": {"$hour": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$minute": "$sysdatetime"},
                                        {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 1000}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var realtimedata = [];
                    for (var i = 0; i < objects.length; i++) {
                        realtimedata.push({
                            kW: objects[i]['data']['kW_tot'],
                            WCL: objects[i]['data']['wc_light_status'],
                            BDU1: objects[i]['data']['Bed1Up_lights_status'],
                            BDU2: objects[i]['data']['Bed2Up_lights_status'],
                            BDU3: objects[i]['data']['Bed3Up_lights_status'],
                            BDD1: objects[i]['data']['Bed1Down_lights_status'],
                            BDD2: objects[i]['data']['Bed2Down_lights_status'],
                            BDD3: objects[i]['data']['Bed3Down_lights_status'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    socket.emit('rm406_chart_rt', realtimedata);
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 406 - Status Chart
                db.collection('Device_info').aggregate([{$match: {Room_num: 406}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$hour": "$sysdatetime"},
                                        {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = [];
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            W: objects[i]['data']['kW_tot'] * 1000,
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                        });
                    }
                    data.sort(function (a, b) {
                        return b.kWh - a.kWh;
                    });
                    socket.emit('rm406_chart_status', data);
                    db.close();
                });
            });
            mongodb.connect(url, function(err, db){
                //todo: Room 406 - Trend Chart
                var data = [];
                var tmp = [];
                db.collection('Device_info').aggregate([{$match: {Room_num: 406}},
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$sysdatetime"},
                                "interval": {
                                    "$subtract": [
                                        {"$dayOfYear": "$sysdatetime"},
                                        {"$mod": [{"$dayOfYear": "$sysdatetime"}, 1]}
                                    ]
                                }
                            },
                            datetime: {"$first": "$sysdatetime"},
                            data: {$first: "$$ROOT"}
                        }
                    },
                    {$sort: {datetime: -1}}, {$limit: 20}
                ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
                    for (var i = 0; i < objects.length; i++) {
                        data.push({
                            kWh: objects[i]['data']['kWh_tot'],
                            TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD')
                        });
                    }
                    data.sort(function (a, b) {
                        return a.kWh - b.kWh;
                    });
                    for (var i = 1; i < data.length; i++) {
                        tmp.push({
                            kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                            TIME: data[i - 1]['TIME']
                        });
                    }
                    socket.emit('rm406_chart_trend', tmp);
                    db.close();
                });
            });
            break;
        case '200':
            mongodb.connect(url, function (err, db) {
                //todo: Init Public Area Second Floor Data
                db.collection('Device_info').find({Room_num: '200'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa200_init', data);
                    db.close();
                });
            });
            break;
        case '300':
            mongodb.connect(url, function (err, db) {
                //todo: Init Public Area Third Floor Data
                db.collection('Device_info').find({Room_num: '300'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa300_init', data);
                    db.close();
                });
            });
            break;
        case '400':
            mongodb.connect(url, function (err, db) {
                //todo: Init Public Area Fourth Floor Data
                db.collection('Device_info').find({Room_num: '400'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa400_init', data);
                    db.close();
                });
            });
            break;
    }
    //General Code
    if(room < '300' && room > '200'){
        mongodb.connect(url, function (err, db) {
            //todo: Fourth Floor Circle Chart
            db.collection('Device_info').find({Room_num: {$gt: 200, $lt: 300}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_201: objects[0]['kW_tot'],
                    Rm_202: objects[1]['kW_tot'],
                    Rm_203: objects[2]['kW_tot'],
                    Rm_204: objects[3]['kW_tot'],
                    Rm_205: objects[4]['kW_tot'],
                    Rm_201h: objects[0]['kWh_tot'],
                    Rm_202h: objects[1]['kWh_tot'],
                    Rm_203h: objects[2]['kWh_tot'],
                    Rm_204h: objects[3]['kWh_tot'],
                    Rm_205h: objects[4]['kWh_tot']
                };
                socket.emit('update_pie2', rmkWh);
                db.close();
            });
        });
        mongodb.connect(url, function(err, db){
            //todo: Second Floor Bar Chart
            db.collection('Device_info').find({Room_num: {$lt: 300, $gt: 200}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_201: objects[0]['kW_tot'] * 1000,
                    Rm_202: objects[1]['kW_tot'] * 1000,
                    Rm_203: objects[2]['kW_tot'] * 1000,
                    Rm_204: objects[3]['kW_tot'] * 1000,
                    Rm_205: objects[4]['kW_tot'] * 1000
                };
                socket.emit('update_kWh2', rmkWh);
                db.close();
            });
        });
    }
    if(room > '300' && room < '400'){
        mongodb.connect(url, function (err, db) {
            //todo: Third Floor Circle Chart
            db.collection('Device_info').find({Room_num: {$gt: 300, $lt: 400}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_301: objects[0]['kW_tot'],
                    Rm_302: objects[1]['kW_tot'],
                    Rm_303: objects[2]['kW_tot'],
                    Rm_304: objects[3]['kW_tot'],
                    Rm_305: objects[4]['kW_tot'],
                    Rm_301h: objects[0]['kWh_tot'],
                    Rm_302h: objects[1]['kWh_tot'],
                    Rm_303h: objects[2]['kWh_tot'],
                    Rm_304h: objects[3]['kWh_tot'],
                    Rm_305h: objects[4]['kWh_tot']
                };
                socket.emit('update_pie3', rmkWh);
                db.close();
            });
        });
        mongodb.connect(url, function(err, db){
            //todo: Third Floor Bar Chart
            db.collection('Device_info').find({Room_num: {$gt: 300, $lt: 400}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_301: objects[0]['kW_tot'] * 1000,
                    Rm_302: objects[1]['kW_tot'] * 1000,
                    Rm_303: objects[2]['kW_tot'] * 1000,
                    Rm_304: objects[3]['kW_tot'] * 1000,
                    Rm_305: objects[4]['kW_tot'] * 1000
                };
                socket.emit('update_kWh3', rmkWh);
                db.close();
            });
        });
    }
    if(room > '400'){
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
                socket.emit('update_pie4', rmkWh);
                db.close();
            });
        });
        mongodb.connect(url, function(err, db){
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
                socket.emit('update_kWh4', rmkWh);
                db.close();
            });
        });
    }
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

function Update(room){
    switch(room){
        case '201':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 201 Data
                db.collection('Device_info').find({Room_num: 201}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        TBL: objects[0]['Table_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BTOLC1: objects[0]['BathroomOut_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        BDUC1: objects[0]['BedUp_lights_C1'],
                        BDDC1: objects[0]['BedDown_lights_C1'],
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('rm201_data', data);
                    db.close();
                });
            });
            break;
        case '202':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 202 Data
                db.collection('Device_info').find({Room_num: 202}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm202_data', data);
                    db.close();
                });
            });
            break;
        case '203':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 203 Data
                db.collection('Device_info').find({Room_num: 203}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm203_data', data);
                    db.close();
                });
            });
            break;
        case '204':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 204 Data
                db.collection('Device_info').find({Room_num: 204}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm204_data', data);
                    db.close();
                });
            });
            break;
        case '205':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 205 Data
                db.collection('Device_info').find({Room_num: 205}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        LQL: objects[0]['liquor_lights_status']
                    };
                    socket.emit('rm205_data', data);
                    db.close();
                });
            });
            break;
        case '301':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 301 Data
                db.collection('Device_info').find({Room_num: 301}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        RMC3: objects[0]['Room_lights_C3'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm301_data', data);
                    db.close();
                });
            });
            break;
        case '302':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 302 Data
                db.collection('Device_info').find({Room_num: 302}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1']
                    };
                    socket.emit('rm302_data', data);
                    db.close();
                });
            });
            break;
        case '303':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 303 Data
                db.collection('Device_info').find({Room_num: 303}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm303_data', data);
                    db.close();
                });
            });
            break;
        case '304':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 304 Data
                db.collection('Device_info').find({Room_num: 304}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm304_data', data);
                    db.close();
                });
            });
            break;
        case '305':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 305 Data
                db.collection('Device_info').find({Room_num: 305}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm305_data', data);
                    db.close();
                });
            });
            break;
        case '401':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 401 Data
                db.collection('Device_info').find({Room_num: 401}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('rm401_data', data);
                    db.close();
                });
            });
            break;
        case '402':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 402 Data
                db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
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
            });
            break;
        case '403':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 403 Data
                db.collection('Device_info').find({Room_num: 403}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kWh: objects[0]['kWh_tot'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm403_data', data);
                    db.close();
                });
            });
            break;
        case '404':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 404 Data
                db.collection('Device_info').find({Room_num: 404}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        RMC1: objects[0]['room_lights_status'],
                        BDLC1: objects[0]['BedLeft_lights_status'],
                        BDRC1: objects[0]['BedRight_lights_status']
                    };
                    socket.emit('rm404_data', data);
                    db.close();
                });
            });
            break;
        case '405':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 405 Data
                db.collection('Device_info').find({Room_num: 405}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RMC1: objects[0]['room_light_status'],
                        BDUL: objects[0]['BedUp_lights_status'],
                        BDDL: objects[0]['BedDown_lights_status']
                    };
                    socket.emit('rm405_data', data);
                    db.close();
                });
            });
            break;
        case '406':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 406 Data
                db.collection('Device_info').find({Room_num: 406}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        PWNF: objects[0]['pw_onoff'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        BDU1: objects[0]['Bed1Up_lights_status'],
                        BDU2: objects[0]['Bed2Up_lights_status'],
                        BDU3: objects[0]['Bed3Up_lights_status'],
                        BDD1: objects[0]['Bed1Down_lights_status'],
                        BDD2: objects[0]['Bed2Down_lights_status'],
                        BDD3: objects[0]['Bed3Down_lights_status']
                    };
                    socket.emit('rm406_data', data);
                    db.close();
                });
            });
            break;
        case '200':
            mongodb.connect(url, function(err, db){
                //todo: Update Public Area Second Floor Data
                db.collection('Device_info').find({Room_num: '200'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa200_data', data);
                    db.close();
                });
            });
            break;
        case '300':
            mongodb.connect(url, function(err, db){
                //todo: Update Public Area Third Floor Data
                db.collection('Device_info').find({Room_num: '300'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa300_data', data);
                    db.close();
                });
            });
            break;
        case '400':
            mongodb.connect(url, function(err, db){
                //todo: Update Public Area Fourth Floor Data
                db.collection('Device_info').find({Room_num: '400'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0']
                    };
                    socket.emit('pa400_data', data);
                    db.close();
                });
            });
            break;
    }
    if(room < '300' && room > '200'){
        mongodb.connect(url, function(err, db){
            //todo: Second Floor Bar Chart
            db.collection('Device_info').find({Room_num: {$gt: 200, $lt: 300}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_201: objects[0]['kW_tot'] * 1000,
                    Rm_202: objects[1]['kW_tot'] * 1000,
                    Rm_203: objects[2]['kW_tot'] * 1000,
                    Rm_204: objects[3]['kW_tot'] * 1000,
                    Rm_205: objects[4]['kW_tot'] * 1000
                };
                socket.emit('update_kWh2', rmkWh);
                db.close();
            });
        });
    }
    if(room > '300' && room < '400'){
        mongodb.connect(url, function(err, db){
            //todo: Third Floor Bar Chart
            db.collection('Device_info').find({Room_num: {$gt: 300, $lt: 400}}).sort({_id: -1}).limit(5).toArray(function (mongoError, objects) {
                if (mongoError) throw mongoError;
                objects.sort(function (a, b) {
                    return a.Room_num - b.Room_num;
                });
                var rmkWh = {
                    Rm_301: objects[0]['kW_tot'] * 1000,
                    Rm_302: objects[1]['kW_tot'] * 1000,
                    Rm_303: objects[2]['kW_tot'] * 1000,
                    Rm_304: objects[3]['kW_tot'] * 1000,
                    Rm_305: objects[4]['kW_tot'] * 1000
                };
                socket.emit('update_kWh3', rmkWh);
                db.close();
            });
        });
    }
    if(room > '400'){
        mongodb.connect(url, function(err, db){
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
                socket.emit('update_kWh4', rmkWh);
                db.close();
            });
        });
    }
    //General Code
    mongodb.connect(url, function (err, db) {
        if(err)console.log(err);
        //todo: Update ErrorEvent Data
        db.collection('ErrorEven_log').find().sort({_id:-1}).toArray(function (mongoError, objects) {
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
        });
    });
}

function UpdateChart(room){
    switch(room){
        case '201':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 201 - RealTime Chart
                db.collection('Device_info').find({Room_num: 201}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        TBL: objects[0]['Table_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BTOLC1: objects[0]['BathroomOut_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        BDUC1: objects[0]['BedUp_lights_C1'],
                        BDDC1: objects[0]['BedDown_lights_C1'],
                        CO2: objects[0]['CO2_CH0'],
                        PM25: objects[0]['PM25_CH0'],
                        RH: objects[0]['RH_CH0'],
                        TEMP: objects[0]['TEMP_CH0'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm201_chart_data', data);
                    db.close();
                });
            });
            break;
        case '202':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 202 - RealTime Chart
                db.collection('Device_info').find({Room_num: 202}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm202_chart_data', data);
                    db.close();
                });
            });
            break;
        case '203':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 203 - RealTime Chart
                db.collection('Device_info').find({Room_num: 203}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm203_chart_data', data);
                    db.close();
                });
            });
            break;
        case '204':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 204 - RealTime Chart
                db.collection('Device_info').find({Room_num: 204}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm204_chart_data', data);
                    db.close();
                });
            });
            break;
        case '205':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 205 - RealTime Chart
                db.collection('Device_info').find({Room_num: 205}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        LQL: objects[0]['liquor_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm205_chart_data', data);
                    db.close();
                });
            });
            break;
        case '301':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 301 - RealTime Chart
                db.collection('Device_info').find({Room_num: 301}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        RMC3: objects[0]['Room_lights_C3'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm301_chart_data', data);
                    db.close();
                });
            });
            break;
        case '302':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 302 - RealTime Chart
                db.collection('Device_info').find({Room_num: 302}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm302_chart_data', data);
                    db.close();
                });
            });
            break;
        case '303':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 303 - RealTime Chart
                db.collection('Device_info').find({Room_num: 303}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm303_chart_data', data);
                    db.close();
                });
            });
            break;
        case '304':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 304 - RealTime Chart
                db.collection('Device_info').find({Room_num: 304}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm304_chart_data', data);
                    db.close();
                });
            });
            break;
        case '305':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 305 - RealTime Chart
                db.collection('Device_info').find({Room_num: 305}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm305_chart_data', data);
                    db.close();
                });
            });
            break;
        case '401':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 401 - RealTime Chart
                db.collection('Device_info').find({Room_num: 401}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        GSTC1: objects[0]['Guest_lights_C1'],
                        GSTC2: objects[0]['Guest_lights_C2'],
                        RMC1: objects[0]['Room_lights_C1'],
                        RMC2: objects[0]['Room_lights_C2'],
                        BDLC1: objects[0]['BedLeft_lights_C1'],
                        BDRC1: objects[0]['BedRight_lights_C1'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm401_chart_data', data);
                    db.close();
                });
            });
            break;
        case '402':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 402 - RealTime Chart
                db.collection('Device_info').find({Room_num: 402}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
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
            });
            break;
        case '403':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 403 - RealTime Chart
                db.collection('Device_info').find({Room_num: 403}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kWh: objects[0]['kWh_tot'],
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDLL: objects[0]['BedLeft_lights_status'],
                        BDRL: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm403_chart_data', data);
                    db.close();
                });
            });
            break;
        case '404':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 404 - RealTime Chart
                db.collection('Device_info').find({Room_num: 404}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        WDL: objects[0]['windows_light_status'],
                        RMC1: objects[0]['room_lights_status'],
                        BDLC1: objects[0]['BedLeft_lights_status'],
                        BDRC1: objects[0]['BedRight_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm404_chart_data', data);
                    db.close();
                });
            });
            break;
        case '405':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 405 - RealTime Chart
                db.collection('Device_info').find({Room_num: 405}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        RML: objects[0]['room_light_status'],
                        BDUL: objects[0]['BedUp_lights_status'],
                        BDDL: objects[0]['BedDown_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm405_chart_data', data);
                    db.close();
                });
            });
            break;
        case '406':
            mongodb.connect(url, function(err, db){
                //todo: Update Room 406 - RealTime Chart
                db.collection('Device_info').find({Room_num: 406}).sort({_id: -1}).limit(60).toArray(function (mongoError, objects) {
                    if (mongoError) throw mongoError;
                    var data = {
                        kW: objects[0]['kW_tot'],
                        WCL: objects[0]['wc_light_status'],
                        BDU1: objects[0]['Bed1Up_lights_status'],
                        BDU2: objects[0]['Bed2Up_lights_status'],
                        BDU3: objects[0]['Bed3Up_lights_status'],
                        BDD1: objects[0]['Bed1Down_lights_status'],
                        BDD2: objects[0]['Bed2Down_lights_status'],
                        BDD3: objects[0]['Bed3Down_lights_status'],
                        TIME: date.format(objects[0]['sysdatetime'], 'YYYY/MM/DD HH:mm:ss')
                    };
                    socket.emit('rm406_chart_data', data);
                    db.close();
                });
            });
            break;
    }
    if(room > '400'){
        mongodb.connect(url, function (err, db) {
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
                socket.emit('update_kWh4', rmkWh);
                db.close();
            });
        });
    }
}


app.use('/', route);
//Start the server
app.listen(port);
console.log('Big5-API is listening on port ' + port);
var state = 'ON';
function ONOFF(){
    if(state == 'ON'){
        client.publish('hok/4f_public/light', 'ON');
        state = 'OFF';
    }else{
        client.publish('hok/4f_public/light', 'OFF');
        state = 'ON';
    }
}

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
    socket.on('201Light', function(data){
        if(data == 'ON'){
            client.publish('hok/201/light', 'ON');
        }else{
            client.publish('hok/201/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('202Light', function(data){
        if(data == 'ON'){
            client.publish('hok/202/light', 'ON');
        }else{
            client.publish('hok/202/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('203Light', function(data){
        if(data == 'ON'){
            client.publish('hok/203/light', 'ON');
        }else{
            client.publish('hok/203/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('204Light', function(data){
        if(data == 'ON'){
            client.publish('hok/204/light', 'ON');
        }else{
            client.publish('hok/204/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('205Light', function(data){
        if(data == 'ON'){
            client.publish('hok/205/light', 'ON');
        }else{
            client.publish('hok/205/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('301Light', function(data){
        if(data == 'ON'){
            client.publish('hok/301/light', 'ON');
        }else{
            client.publish('hok/301/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('302Light', function(data){
        if(data == 'ON'){
            client.publish('hok/302/light', 'ON');
        }else{
            client.publish('hok/302/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('303Light', function(data){
        if(data == 'ON'){
            client.publish('hok/303/light', 'ON');
        }else{
            client.publish('hok/303/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('304Light', function(data){
        if(data == 'ON'){
            client.publish('hok/304/light', 'ON');
        }else{
            client.publish('hok/304/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('305Light', function(data){
        if(data == 'ON'){
            client.publish('hok/305/light', 'ON');
        }else{
            client.publish('hok/305/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('401Light', function(data){
        if(data == 'ON'){
            client.publish('hok/401/light', 'ON');
        }else{
            client.publish('hok/401/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('402Light', function(data){
        if(data == 'ON'){
            client.publish('hok/402/light', 'ON');
        }else{
            client.publish('hok/402/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('403Light', function(data){
        if(data == 'ON'){
            client.publish('hok/403/light', 'ON');
        }else{
            client.publish('hok/403/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('404Light', function(data){
        if(data == 'ON'){
            client.publish('hok/404/light', 'ON');
        }else{
            client.publish('hok/404/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('405Light', function(data){
        if(data == 'ON'){
            client.publish('hok/405/light', 'ON');
        }else{
            client.publish('hok/405/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('Public2F', function(data){
        if(data == 'ON'){
            client.publish('hok/2f_public/light', 'ON');
        }else{
            client.publish('hok/2f_public/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('Public3F', function(data){
        if(data == 'ON'){
            client.publish('hok/3f_public/light', 'ON');
        }else{
            client.publish('hok/3f_public/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('Public4F', function(data){
        if(data == 'ON'){
            client.publish('hok/4f_public/light', 'ON');
        }else{
            client.publish('hok/4f_public/light', 'OFF');
        }
        console.log(data);
    });
    socket.on('done', function (room) {
        Init(room);
        if(!oldInterval){
            oldInterval = setInterval(function(){Update(room);}, 3000);
            oldchartInterval = setInterval(function(){UpdateChart(room);}, 60000);
            updateroom = room;
            console.log('First Done.');
        }else {
            if (room != updateroom) {
                clearInterval(oldInterval);
                oldInterval = setInterval(function(){Update(room);}, 3000);
                if(oldchartInterval) {
                    clearInterval(oldchartInterval);
                }
                if(room != '200' && room != '300' && room != '400') {
                    oldchartInterval = setInterval(function(){UpdateChart(room);}, 60000);
                }
                updateroom = room;
                console.log('Done Again.');
            }
        }
    });
});