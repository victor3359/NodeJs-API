"use strict";
$(document).ready(function() {

    var powerdata = [];
    var voltagedata = [];
    var amperedata = [];
    var powerdata_c = [];
    var chartdata = [];

    var room = '302';

    function controlalert(name, cmd){
        iziToast.show({title:'Command',message:'Turn ' + cmd + ' the ' + name + '.' ,color:'#00cc99',position:'bottomRight'});
    }

    socket.emit('done', room);
    //Controller Def Start
    $('#WC_Light_Switch').click(function () {
        if(getText('WC_Light_State') == 'Off'){
            socket.emit(room + 'WCLight', 'ON');
            controlalert('W.C. Light', 'On');
        }else{
            socket.emit(room + 'WCLight', 'OFF');
            controlalert('W.C. Light', 'Off');
        }
    });
    $('#BD1_Light_Switch').click(function () {
        if(getText('RM_Light_State') == 'Off'){
            socket.emit(room + 'RMLight', 'ON');
            controlalert('Room Light', 'On');
        }else{
            socket.emit(room + 'RMLight', 'OFF');
            controlalert('Room Light', 'Off');
        }
    });
    $('#BD2_Light_Switch').click(function () {
        if(getText('GST_Light_State') == 'Off'){
            socket.emit(room + 'GSTLight', 'ON');
            controlalert('GST Light', 'On');
        }else{
            socket.emit(room + 'GSTLight', 'OFF');
            controlalert('GST Light', 'Off');
        }
    });
    $('#BD3_Light_Switch').click(function () {
        if(getText('BD_Light_State') == 'Off'){
            socket.emit(room + 'BDLight', 'ON');
            controlalert('Bed Light', 'On');
        }else{
            socket.emit(room + 'BDLight', 'OFF');
            controlalert('Bed Light', 'Off');
        }
    });
    $('#All_On').click(function () {
        /*
        socket.emit(room + 'WCLight', 'ON');
        socket.emit(room + 'RMLight', 'ON');
        socket.emit(room + 'GSTLight', 'ON');
        socket.emit(room + 'BDLight', 'ON');
        */
        socket.emit(room + 'Light', 'ON');
        controlalert('Lights', 'On All');
    });
    $('#All_Off').click(function () {
        /*
        socket.emit(room + 'WCLight', 'OFF');
        socket.emit(room + 'RMLight', 'OFF');
        socket.emit(room + 'GSTLight', 'OFF');
        socket.emit(room + 'BDLight', 'OFF');
        */
        socket.emit(room + 'Light', 'OFF');
        controlalert('Lights', 'Off All');
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

    //Room 302 Socket
    socket.on('rm' + room + '_init', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);

        new CountUp("widget_countup1", 0,data['kWh'] , 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,data['kW'] * 1000 , 0, 5.0, options).start();

        if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }
        setText("widget_countup12", data['kWh']);
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
        if(data['GSTC1'] || data['GSTC2']){
            state('GST_Light_State', 1);
        }else{
            state('GST_Light_State', 0);
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

    socket.on('rm'+ room + '_chart_rt', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                data2: data[i]['WCL'] * 3000,
                data3: data[i]['WDL'] * 3000,
                data4: data[i]['GSTC1'],
                data5: data[i]['GSTC2'],
                data6: data[i]['BDLC1'],
                data7: data[i]['BDRC1'],
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('rm'+ room +'_chart_data', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                data2: data[i]['WCL'] * 3000,
                data3: data[i]['WDL'] * 3000,
                data4: data[i]['GSTC1'],
                data5: data[i]['GSTC2'],
                data6: data[i]['BDLC1'],
                data7: data[i]['BDRC1'],
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });


    socket.on('rm' + room + '_data', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);
        if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }

        setText("widget_countup1", parseInt(data['kWh']));
        setText("widget_countup4", data['kW'] * 1000);
        setText("widget_countup12", data['kWh']);
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
        if(data['GSTC1'] || data['GSTC2']){
            state('GST_Light_State', 1);
        }else{
            state('GST_Light_State', 0);
        }
        if(data['BDLC1'] || data['BDRC1']){
            state('BD_Light_State', 1);
        }else{
            state('BD_Light_State', 0);
        }

        if (powerdata.length > 10) powerdata.shift();
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
        $("#rating").sparkline(powerdata_c, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' W'
        });
    });

    socket.on('update_kWh3', function (data) {
        var chart=c3.generate({bindto:'#chart_kWh',data:{
            columns:[
                ['Room 301',data['Rm_301']],
                ['Room 302',data['Rm_302']],
                ['Room 303',data['Rm_303']],
                ['Room 304',data['Rm_304']],
                ['Room 305',data['Rm_305']]
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

    socket.on('update_pie3', function (data) {
        var chart1=c3.generate({bindto:'#rmkWh_chart',data:{
            columns:[['Room 301',data['Rm_301']],['Room 302',data['Rm_302']],['Room 303',data['Rm_303']]
                ,['Room 304',data['Rm_304']],['Room 305',data['Rm_305']]],type:'donut'},
            donut:{title:"Fourth Floor"},
            color:{pattern:['#00c0ef','#0fb0c0','#668cff','#ffb300','#69B3BF']}
        });
        setTimeout(function(){
                chart1.load({
                    columns:[["Room 301",data['Rm_301h']],["Room 302",data['Rm_302h']],["Room 303",data['Rm_303h']],
                        ["Room 304",data['Rm_304h']],["Room 305",data['Rm_305h']]]
                });
            }
            ,4000);
    });

    socket.on('rm'+ room + '_chart_trend', function (data) {
        var chart = AmCharts.makeChart( "chart_trend2", {
            "type": "serial",
            "addClassNames": true,
            "theme": "light",
            "autoMargins": false,
            "marginLeft": 30,
            "marginRight": 8,
            "marginTop": 10,
            "marginBottom": 26,
            "balloon": {
                "adjustBorderColor": false,
                "horizontalPadding": 10,
                "verticalPadding": 8,
                "color": "#ffffff"
            },

            "dataProvider": data
            ,
            "valueAxes": [ {
                "axisAlpha": 0,
                "position": "left"
            } ],
            "startDuration": 1,
            "graphs": [ {
                "alphaField": "alpha",
                "balloonText": "<span style='font-size:12px;'>[[title]] 在 [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                "fillAlphas": 1,
                "title": "耗電量",
                "type": "column",
                "valueField": "kWh",
                "dashLengthField": "dashLengthColumn"
            }],
            "categoryField": "TIME",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "tickLength": 0
            },
            "export": {
                "enabled": true
            }
        } );
    });




//   flip js

    $("#top_widget1, #top_widget4").flip({
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

    socket.on('rm' + room + '_chart_status', function (data) {
        var date = [];
        var dataW = [], datakWh = [];
        for(var i = data.length - 1;i >= 0;i--){
            date.push(data[i]['TIME']);
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
                x: 70,
                verticalAlign: 'top',
                y: 0,
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
                        "bullet": "none",
                        "id": "AmGraph-1",
                        "title": "Power",
                        "valueField": "data1",
                        "lineThickness" : 4,
                        "lineColor": "#000088"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-2",
                        "title": "W.C. Light",
                        "valueField": "data2",
                        "lineThickness" : 4,
                        "lineColor": "#00BBFF"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-3",
                        "title": "Window Light",
                        "valueField": "data3",
                        "lineThickness" : 4,
                        "lineColor": "#77DDFF"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-4",
                        "title": "Guest Light C1",
                        "valueField": "data4",
                        "lineThickness" : 4,
                        "lineColor": "#00DD00"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-5",
                        "title": "Guest Light C2",
                        "valueField": "data5",
                        "lineThickness" : 4,
                        "lineColor": "#CCFF33"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-6",
                        "title": "BedLeft Light C1",
                        "valueField": "data6",
                        "lineThickness" : 4,
                        "lineColor": "#FFCC22"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-7",
                        "title": "BedRight Light C1",
                        "valueField": "data7",
                        "lineThickness" : 4,
                        "lineColor": "#CC0000"
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
                    "useGraphSettings": false
                },
                "titles": [
                    {
                        "id": "Hok_302",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }
});