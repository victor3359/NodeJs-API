"use strict";
$(document).ready(function() {

    var powerdata = [];
    var voltagedata = [];
    var amperedata = [];
    var powerdata_c = [];
    var chartdata = [];

    var room = '405';

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
    $('#RM_Light_Switch').click(function () {
        if(getText('RM_Light_State') == 'Off'){
            socket.emit(room + 'RMLight', 'ON');
            controlalert('Room Lights', 'On');
        }else{
            socket.emit(room + 'RMLight', 'OFF');
            controlalert('Room Lights', 'Off');
        }
    });
    $('#BDL_Light_Switch').click(function () {
        if(getText('BDU_Light_State') == 'Off'){
            socket.emit(room + 'BDUpLight', 'ON');
            controlalert('BedUp Light', 'On');
        }else{
            socket.emit(room + 'BDUpLight', 'OFF');
            controlalert('BedUp Light', 'Off');
        }
    });
    $('#BDR_Light_Switch').click(function () {
        if(getText('BDD_Light_State') == 'Off'){
            socket.emit(room + 'BDDownLight', 'ON');
            controlalert('BedDown Lights', 'On');
        }else{
            socket.emit(room + 'BDDownLight', 'OFF');
            controlalert('BedDown Lights', 'Off');
        }
    });
    $('#All_On').click(function () {
        socket.emit(room + 'WCLight', 'ON');
        socket.emit(room + 'RMLight', 'ON');
        socket.emit(room + 'BDUpLight', 'ON');
        socket.emit(room + 'BDDownLight', 'ON');
        controlalert('Lights', 'On All');
    });
    $('#All_Off').click(function () {
        socket.emit(room + 'WCLight', 'OFF');
        socket.emit(room + 'RMLight', 'OFF');
        socket.emit(room + 'BDUpLight', 'OFF');
        socket.emit(room + 'BDDownLight', 'OFF');
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

    //Room 405 Socket
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
        if(data['RML']){
            state('RM_Light_State', 1);
        }else{
            state('RM_Light_State', 0);
        }
        if(data['BDUL']){
            state('BDU_Light_State', 1);
        }else{
            state('BDU_Light_State', 0);
        }
        if(data['BDDL']){
            state('BDD_Light_State', 1);
        }else{
            state('BDD_Light_State', 0);
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
                data3: data[i]['RML'] * 3000,
                data4: data[i]['BDUL'] * 3000,
                data5: data[i]['BDDL'] * 3000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('rm404_chart_data', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                data2: data[i]['WCL'] * 3000,
                data3: data[i]['RML'] * 3000,
                data4: data[i]['BDLL'] * 3000,
                data5: data[i]['BDRL'] * 3000,
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
        if(data['RML']){
            state('RM_Light_State', 1);
        }else{
            state('RM_Light_State', 0);
        }
        if(data['BDUL']){
            state('BDU_Light_State', 1);
        }else{
            state('BDU_Light_State', 0);
        }
        if(data['BDDL']){
            state('BDD_Light_State', 1);
        }else{
            state('BDD_Light_State', 0);
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

    socket.on('update_kWh4', function (data) {
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

    socket.on('update_pie4', function (data) {
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
                        "title": "Room Light",
                        "valueField": "data3",
                        "lineThickness" : 4,
                        "lineColor": "#77DDFF"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-4",
                        "title": "BedLeft Light",
                        "valueField": "data4",
                        "lineThickness" : 4,
                        "lineColor": "#00DD00"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-5",
                        "title": "BedRight Light",
                        "valueField": "data5",
                        "lineThickness" : 4,
                        "lineColor": "#CCFF33"
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
                        "id": "Hok_404",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }
});