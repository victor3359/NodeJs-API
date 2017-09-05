"use strict";
$(document).ready(function() {

    var powerdata = [];
    var voltagedata = [];
    var amperedata = [];
    var powerdata_c = [];
    var chartdata = [];

    function controlalert(name, cmd){
        iziToast.show({title:'Success',message:'Turn ' + cmd + ' the ' + name + '.' ,color:'#00cc99',position:'bottomRight'});
    }

    var socket = io.connect('http://192.168.100.34:10000');

    socket.emit('done', 0);
    //Controller Def Start
    $('#WC_Light_Switch').click(function () {
        if(getText('WC_Light_State') == 'Off'){
            socket.emit('WCLight', 'ON');
            controlalert('W.C. Light', 'ON');
        }else{
            socket.emit('WCLight', 'OFF');
            controlalert('W.C. Light', 'OFF');
        }
    });
    $('#WD_Light_Switch').click(function () {
        if(getText('WD_Light_State') == 'Off'){
            socket.emit('WDLight', 'ON');
            controlalert('Window Light', 'ON');
        }else{
            socket.emit('WDLight', 'OFF');
            controlalert('Window Light', 'OFF');
        }
    });
    $('#RM_Light_Switch').click(function () {
        if(getText('RM_Light_State') == 'Off'){
            socket.emit('RMLight', 'ON');
            controlalert('Room Lights', 'ON');
        }else{
            socket.emit('RMLight', 'OFF');
            controlalert('Room Lights', 'OFF');
        }
    });
    $('#BD_Light_Switch').click(function () {
        if(getText('BD_Light_State') == 'Off'){
            socket.emit('BDLeftLight', 'ON');
            socket.emit('BDRightLight', 'ON');
            controlalert('Bed Lights', 'ON');
        }else{
            socket.emit('BDLeftLight', 'OFF');
            socket.emit('BDRightLight', 'OFF');
            controlalert('Bed Lights', 'OFF');
        }
    });
    $('#All_On').click(function () {
        socket.emit('WCLight', 'ON');
        socket.emit('WDLight', 'ON');
        socket.emit('RMLight', 'ON');
        socket.emit('BDLeftLight', 'ON');
        socket.emit('BDRightLight', 'ON');
        controlalert('Lights', 'ON All');
    });
    $('#All_Off').click(function () {
        socket.emit('WCLight', 'OFF');
        socket.emit('WDLight', 'OFF');
        socket.emit('RMLight', 'OFF');
        socket.emit('BDLeftLight', 'OFF');
        socket.emit('BDRightLight', 'OFF');
        controlalert('Lights', 'OFF All');
    });

    //Controller Def End
    function state(name, flag){
        if(flag) {
            document.getElementById(name).innerHTML = 'On';
        }else{
            document.getElementById(name).innerHTML = 'Off';
        }
    }


    function setText(name, value) {
        document.getElementById(name).innerHTML = value;
    }

    function getText(name) {
        return document.getElementById(name).innerHTML;
    }

    function ShowNotify(title, message, datetime){
        new PNotify({
            title: title,
            text: message + '<br>' + datetime,
            type:'error',
            after_init:
                function(notice){
                    notice.attention('rubberBand');
                }
        });
    }

    socket.on('error_info', function (data) {
        for(var i=0;i<data.length;i++){
            ShowNotify(data[i]['error_type'], data[i]['error_info'], data[i]['datetime']);
        }
    });

    socket.on('update_errcount', function (data) {
        setText('warning_count', data);
    });

    //Room 402 Socket
    socket.on('rm402_init', function (data) {
        powerdata.push(data['kWh']);
        voltagedata.push(data['AvgV']);
        amperedata.push(data['AvgI'] * 1000);
        powerdata_c.push(data['kW'] * 1000);

        new CountUp("widget_countup1", 0,data['kWh'] , 0, 5.0, options).start();
        new CountUp("widget_countup2", 0,data['AvgV'] , 0, 5.0, options).start();
        new CountUp("widget_countup3", 0,data['AvgI']  * 1000, 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,data['kW'] * 1000 , 0, 5.0, options).start();

        setText("widget_countup12", data['kWh']);
        setText("widget_countup22", data['AvgV']);
        setText("widget_countup32", data['AvgI'] * 1000);
        setText("widget_countup42", data['kW'] * 1000);

        if(data['WCL']){
            state('WC_Light_State', 1);
        }else{
            state('WC_Light_State', 0);
        }
        if(data['WDL']){
            state('WD_Light_State', 1);
        }else{
            state('WD_Light_State', 0);
        }
        if(data['RMC1'] || data['RMC2'] || data['RMC3']){
            state('RM_Light_State', 1);
        }else{
            state('RM_Light_State', 0);
        }
        if(data['BDLC1'] || data['BDRC1']){
            state('BD_Light_State', 1);
        }else{
            state('BD_Light_State', 0);
        }
        $("#visitsspark-chart").sparkline(powerdata, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' kWh'
        });
        $('#salesspark-chart').sparkline(voltagedata,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' V'
        });
        $('#mousespeed').sparkline(amperedata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' mA'
        });
        $("#rating").sparkline(powerdata_c, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' W'
        });
    });
    socket.on('rm402_chart_init', function (data) {
        for(var i=1999;i >= 0;i--) {
            chartdata.push({
                hok_w: parseFloat(data[i]['kW']) * 1000,
                hok_wc_l: data[i]['WCL'] * 3000,
                hok_wd_l: data[i]['WDL'] * 3000,
                hok_rm_c1: data[i]['RMC1'],
                hok_rm_c2: data[i]['RMC2'],
                hok_rm_c3: data[i]['RMC3'],
                hok_bdl_c1: data[i]['BDLC1'],
                hok_bdr_c2: data[i]['BDRC1'],
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('rm402_chart_data', function (data) {
        for(var i=59;i >= 0;i--) {
            chartdata.push({
                hok_w: parseFloat(data[i]['kW']) * 1000,
                hok_wc_l: data[i]['WCL'] * 3000,
                hok_wd_l: data[i]['WDL'] * 3000,
                hok_rm_c1: data[i]['RMC1'],
                hok_rm_c2: data[i]['RMC2'],
                hok_rm_c3: data[i]['RMC3'],
                hok_bdl_c1: data[i]['BDLC1'],
                hok_bdr_c2: data[i]['BDRC1'],
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });

    socket.on('rm402_data', function (data) {
        powerdata.push(data['kWh']);
        voltagedata.push(data['AvgV']);
        amperedata.push(data['AvgI'] * 1000);
        powerdata_c.push(data['kW'] * 1000);

        setText("widget_countup1", parseInt(data['kWh']));
        setText("widget_countup2", parseInt(data['AvgV']));
        setText("widget_countup3", data['AvgI'] * 1000);
        setText("widget_countup4", data['kW'] * 1000);
        setText("widget_countup12", data['kWh']);
        setText("widget_countup22", data['AvgV']);
        setText("widget_countup32", data['AvgI'] * 1000);
        setText("widget_countup42", data['kW'] * 1000);

        if(data['WCL']){
            state('WC_Light_State', 1);
        }else{
            state('WC_Light_State', 0);
        }
        if(data['WDL']){
            state('WD_Light_State', 1);
        }else{
            state('WD_Light_State', 0);
        }
        if(data['RMC1'] || data['RMC2'] || data['RMC3']){
            state('RM_Light_State', 1);
        }else{
            state('RM_Light_State', 0);
        }
        if(data['BDLC1'] || data['BDRC1']){
            state('BD_Light_State', 1);
        }else{
            state('BD_Light_State', 0);
        }


        if (powerdata.length > 10) powerdata.shift();
        if (voltagedata.length > 10) voltagedata.shift();
        if (amperedata.length > 10) amperedata.shift();
        if (powerdata_c.length > 10) powerdata_c.shift();
        if (chartdata.length > 4000) chartdata.shift();

        $("#visitsspark-chart").sparkline(powerdata, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' kWh'
        });
        $('#salesspark-chart').sparkline(voltagedata,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' V'
        });
        $('#mousespeed').sparkline(amperedata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' mA'
        });
        $("#rating").sparkline(powerdata_c, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' W'
        });
    });

    function updatechartrt() {
        AmCharts.makeChart("chartdiv",
            {
                "type": "serial",
                "categoryField": "date",
                "dataDateFormat": "YYYY-MM-DD HH:NN:SS",
                "categoryAxis": {
                    "minPeriod": "ss",
                    "parseDates": true
                },
                "chartCursor": {
                    "enabled": true,
                    "categoryBalloonDateFormat": "JJ:NN:SS"
                },
                "chartScrollbar": {
                    "enabled": true
                },
                "trendLines": [],
                "graphs": [
                    {
                        "bullet": "round",
                        "id": "AmGraph-1",
                        "title": "Power",
                        "valueField": "hok_w"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-2",
                        "title": "W.C. Light",
                        "valueField": "hok_wc_l"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-3",
                        "title": "Window Light",
                        "valueField": "hok_wd_l"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-4",
                        "title": "Room_C1 Light",
                        "valueField": "hok_rm_c1"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-5",
                        "title": "Room_C2 Light",
                        "valueField": "hok_rm_c2"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-6",
                        "title": "Room_C3 Light",
                        "valueField": "hok_rm_c3"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-7",
                        "title": "BedLeft_C1 Light",
                        "valueField": "hok_bdl_c1"
                    },
                    {
                        "bullet": "round",
                        "id": "AmGraph-8",
                        "title": "BedRight_C1 Light",
                        "valueField": "hok_bdr_c1"
                    }
                ],
                "guides": [],
                "valueAxes": [
                    {
                        "id": "ValueAxis-1",
                        "title": ""
                    }
                ],
                "allLabels": [],
                "balloon": {},
                "legend": {
                    "enabled": true,
                    "useGraphSettings": true
                },
                "titles": [
                    {
                        "id": "Hok_402",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }


    function Update() {
        var url = "http://192.168.100.34:8080/r402";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(xhttp.responseText);


                powerdata.push(data['kWh_tot']);
                voltagedata.push(data['V_avg']);
                amperedata.push(data['I_avg'] * 1000);
                powerdata_c.push(data['kW_tot'] * 1000);


                chartdata.push({
                    hok_w: parseFloat(data['kW_tot'])*1000,
                    hok_wc_l: data['wc_light_status'] * 3000,
                    hok_wd_l: data['windows_light_status'] * 3000,
                    hok_rm_c1: data['Room_lights_C1'],
                    hok_rm_c2: data['Room_lights_C2'],
                    hok_rm_c3: data['Room_lights_C3'],
                    hok_bdl_c1: data['BedLeft_lights_C1'],
                    hok_bdr_c2: data['BedRight_lights_C1'],
                    date: data['datetime']
                });

                setText("widget_countup1", parseInt(data['kWh_tot']));
                setText("widget_countup12", data['kWh_tot']);
                setText("widget_countup2", parseInt(data['V_avg']));
                setText("widget_countup22", data['V_avg']);
                setText("widget_countup3", data['I_avg'] * 1000);
                setText("widget_countup32", data['I_avg'] * 1000);
                setText("widget_countup4", data['kW_tot'] * 1000);
                setText("widget_countup42", data['kW_tot'] * 1000);

                if(data['wc_light_status']){
                    state('WC_Light_State', 1);
                }else{
                    state('WC_Light_State', 0);
                }
                if(data['windows_light_status']){
                    state('WD_Light_State', 1);
                }else{
                    state('WD_Light_State', 0);
                }
                if(data['Room_lights_C1'] || data['Room_lights_C2'] || data['Room_light_C3']){
                    state('RM_Light_State', 1);
                }else{
                    state('RM_Light_State', 0);
                }
                if(data['BedLeft_lights_C1'] || data['BedRight_lights_C2']){
                    state('BD_Light_State', 1);
                }else{
                    state('BD_Light_State', 0);
                }

                if (powerdata.length > 10) powerdata.shift();
                if (voltagedata.length > 10) voltagedata.shift();
                if (amperedata.length > 10) amperedata.shift();
                if (powerdata_c.length > 10) powerdata_c.shift();
                chartdata.shift();

                $("#visitsspark-chart").sparkline(powerdata, {
                    type: 'line',
                    width: '100%',
                    height: '48',
                    lineColor: '#4fb7fe',
                    fillColor: '#e7f5ff',
                    tooltipSuffix: ' kWh'
                });
                $('#salesspark-chart').sparkline(voltagedata,{
                    type: 'line',
                    width: "100%",
                    height: '48',
                    spotColor: '#f0ad4e',
                    lineColor: '#EF6F6C',
                    tooltipSuffix: ' V'
                });
                $('#mousespeed').sparkline(amperedata, {
                    type: 'line',
                    height: "48",
                    width: "100%",
                    lineColor: '#4fb7fe',
                    fillColor: '#e7f5ff',
                    tooltipSuffix: ' mA'
                });
                $("#rating").sparkline(powerdata_c, {
                    type: 'line',
                    width: "100%",
                    height: '48',
                    spotColor: '#FF00FF',
                    lineColor: '#DF0F7C',
                    tooltipSuffix: ' W'
                });
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send(null);
    }
    updatechartpie();

    function updatechartpie() {
        var chart1=c3.generate({bindto:'#chart1',data:{
            columns:[['data1',12],['data2',108]],type:'donut'},
            donut:{title:"Iris Petal Width"},
            color:{pattern:['#00c0ef','#0fb0c0','#668cff','#ffb300','#69B3BF']}
        });
        setTimeout(function(){chart1.load({
            columns:[["setosa",0.2,0.2,0.2,0.2,0.2,0.4,0.3,0.2,0.2,0.1,0.2,0.2,0.1,0.1,0.2,0.4,0.4,0.3,0.3
                ,0.3,0.2,0.4,0.2,0.5,0.2,0.2,0.4,0.2,0.2,0.2,0.2,0.4,0.1,0.2,0.2,0.2,0.2,0.1,0.2,0.2,0.3,0.3,0.2,
                0.6,0.4,0.3,0.2,0.2,0.2,0.2],["versicolor",1.4,1.5,1.5,1.3,1.5,1.3,1.6,1.0,1.3,1.4,1.0,1.5,1.0,1.4,1.3,1.4,1.5,
                1.0,1.5,1.1,1.8,1.3,1.5,1.2,1.3,1.4,1.4,1.7,1.5,1.0,1.1,1.0,1.2,1.6,1.5,1.6,1.5,1.3,1.3,1.3,1.2,1.4,1.2,1.0,1.3,
                1.2,1.3,1.3,1.1,1.3],["virginica",2.5,1.9,2.1,1.8,2.2,2.1,1.7,1.8,1.8,2.5,2.0,1.9,2.1,2.0,2.4,2.3,1.8,2.2,2.3,1.5,
                2.3,2.0,2.0,1.8,2.1,1.8,1.8,1.8,2.1,1.6,1.9,2.0,2.2,1.5,1.4,2.3,2.4,1.8,1.8,2.1,2.4,2.3,1.9,2.3,2.5,2.3,1.9,2.0,2.3,
                1.8]]});},1500);
        setTimeout(function(){chart1.unload({ids:'data1'});chart1.unload({ids:'data2'});},5000);
    }

//   flip js

    $("#top_widget1, #top_widget2, #top_widget3, #top_widget4").flip({
        axis: 'x',
        trigger: 'hover'
    });


    var options = {
        useEasing: true,
        useGrouping: true,
        decimal: '.',
        prefix: '',
        suffix: ''
    };

});