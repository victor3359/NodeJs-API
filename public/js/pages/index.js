"use strict";
$(document).ready(function() {

    var powerdata = [];
    var voltagedata = [];
    var amperedata = [];
    var powerdata_c = [];
    var chartdata = [];

    function controlalert(name, cmd){
        iziToast.show({title:'Command',message:'Turn ' + cmd + ' the ' + name + '.' ,color:'#00cc99',position:'bottomRight'});
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
                hok_bdr_c1: data[i]['BDRC1'],
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
                hok_bdr_c1: data[i]['BDRC1'],
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

    socket.on('update_pie', function (data) {
        var chart1=c3.generate({bindto:'#rmkWh_chart',data:{
            columns:[['Room 401',data['Rm_401']],['Room 402',data['Rm_402']],['Room 403',data['Rm_403']]
                ,['Room 404',data['Rm_404']],['Room 405',data['Rm_405']],['Room 406',data['Rm_406']]],type:'donut'},
            donut:{title:"Fourth Floor"},
            color:{pattern:['#00c0ef','#0fb0c0','#668cff','#ffb300','#69B3BF']}
        });
        setTimeout(function(){
                chart1.load({
                    columns:[["Room 401",data['Rm_401h']],["Room 402",data['Rm_402h']],["Room 403",data['Rm_403h']],
                        ["Room 404",data['Rm_404h']],["Room 405",data['Rm_405h']],["Room 406",data['Rm_406h']]]
                });
            }
            ,8000);
    });
    /*
        function updatechart_status() {
            var chart4 = c3.generate({
                bindto: '#chart_status',
                data: {
                    columns: [['Kilowatt-Hour', 30, 200, 100, 400, 150, 250],
                        ['Power-Watt', 50, 20, 10, 40, 15, 25]],
                    axes: {data1: 'y', data2: 'y2'}
                },
                axis: {y2: {show: true}}
            });

            setTimeout(function(){
                    chart4.axis.max(500);
                }
                ,1000);
            setTimeout(function(){
                    chart4.axis.min(-500);
                }
                ,2000);
            setTimeout(function(){
                    chart4.axis.max({y:600,y2:100});
                }
                ,3000);
            setTimeout(function(){chart4.axis.min({y:-600,y2:-100});},4000);
            setTimeout(function(){chart4.axis.range({max:1000,min:-1000});},5000);
            setTimeout(function(){chart4.axis.range({max:{y:600,y2:100},min:{y:-100,y2:0}});},6000);
            setTimeout(function(){chart4.axis.max({x:10});},7000);
            setTimeout(function(){chart4.axis.min({x:-10});},8000);
            setTimeout(function(){chart4.axis.range({max:{x:5},min:{x:0}});},9000);
            $(".wrapper").on("resize",function(){
                setTimeout(function(){
                    chart4.resize();
                },500);
            });
        }
    */

    function updatechart_trend(){
        var chart=c3.generate({bindto:'#chart_trend',data:{columns:[
            ['data1',30,300,100,400,150,300],
            ['data2',300,130,350,130,300,80],
            ['data3',200,230,450,530,200,180],
            ['data4',400,530,750,230,300,480]
        ],
            type:'bar',
            colors:
                {data1:'#0fb0c0',data2:'#00c0ef',data3:'#0fb0c0'},
            color:function(color,d){
                return d.id&&d.id==='data3'?d3.rgb(color):color;
            }
        }
        });
        setTimeout(function(){chart.transform('area-spline','data1');},1000);
        setTimeout(function(){chart.transform('area-spline','data2');},2000);
        setTimeout(function(){chart.transform('bar');},3000);
        setTimeout(function(){chart.transform('area-spline');},4000);
    }

    socket.on('update_kWh', function (data) {
        var chart=c3.generate({bindto:'#chart_kWh',data:{
            columns:[
                ['Room 401',data['Rm_401']],
                ['Room 402',data['Rm_402']],
                ['Room 403',data['Rm_403']],
                ['Room 404',data['Rm_404']],
                ['Room 405',data['Rm_405']],
                ['Room 406',data['Rm_406']]
            ],
            type:'bar',
            colors:
                {data1:'#0fb0c0',data2:'#00c0ef',data3:'#0fb0c0'},
            color:function(color,d){
                return d.id&&d.id==='data3'?d3.rgb(color):color;
            }
        }
        });
    });

    updatechart_trend();

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
    socket.on('chart_status', function (data) {
        var date = [];
        var dataW = [], datakWh = [];
        console.log(data);
        for(var i = data.length - 1;i >= 0;i--){
            date.push(data[i]['DATE']);
            dataW.push(data[i]['W']);
            datakWh.push(data[i]['kWh']);
        }
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: [{
                categories: date,
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} W',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: 'Power',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Kilowatt-Hours',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} kWh',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [
                {
                    name: 'Power',
                    type: 'column',
                    data: dataW,
                    tooltip: {
                        valueSuffix: ' W'
                    }
                },
                {
                    name: 'Kilowatt-Hour',
                    type: 'spline',
                    yAxis: 1,
                    data: datakWh,
                    tooltip: {
                        valueSuffix: ' kWh'
                    }

                }]
        });
    });


    function updatechartrt() {
        AmCharts.makeChart("rt_chart",
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
});