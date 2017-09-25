"use strict";
$(document).ready(function() {

    var powerdata = [];
    var powerdata_c = [];
    var chartdata = [];
    var CO2data = [];
    var PM25data = [];
    var RHdata = [];
    var TEMPdata = [];

    var room = '300';

    function controlalert(name, cmd){
        iziToast.show({
            title:'Command',
            message:'Turn ' + cmd + ' the ' + name + '.' ,
            color:'#00cc99',
            position:'bottomRight',
            timeout: 500
        });
    }

    socket.emit('done', room);
    //Controller Def Start
    $('#All_On').click(function () {
        socket.emit('Public3F', 'ON');
        controlalert('Lights', 'On All');
    });
    $('#All_Off').click(function () {
        socket.emit('Public3F', 'OFF');
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

    //Public Area Second Floor Socket
    socket.on('pa'+ room +'_init', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);
        CO2data.push(data['CO2']);
        PM25data.push(data['PM25']);
        RHdata.push(data['RH'] / 100);
        TEMPdata.push(data['TEMP'] / 100);

        new CountUp("widget_countup1", 0,data['kWh'] , 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,data['kW'] * 1000 , 0, 5.0, options).start();
        new CountUp("widget_countup5", 0,data['CO2'] , 0, 5.0, options).start();
        new CountUp("widget_countup6", 0,data['PM25'] , 0, 5.0, options).start();
        new CountUp("widget_countup7", 0,parseInt(data['RH'] / 100) , 0, 5.0, options).start();
        new CountUp("widget_countup8", 0,parseInt(data['TEMP'] / 100) , 0, 5.0, options).start();
        /*
        if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }
        */

        setText("widget_countup12", data['kWh']);
        setText("widget_countup42", data['kW'] * 1000);
        setText("widget_countup52", data['CO2']);
        setText("widget_countup62", data['PM25']);
        setText("widget_countup72", data['RH'] / 100);
        setText("widget_countup82", data['TEMP'] / 100);

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
        $("#CO2_chart").sparkline(CO2data, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' ppm'
        });
        $('#PM25_chart').sparkline(PM25data,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' μg/m3'
        });
        $('#RH_chart').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#TEMP_chart").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });

    socket.on('pa' + room + '_chart_rt', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('pa'+ room +'_chart_data', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });


    socket.on('pa' + room +'_data', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);
        CO2data.push(data['CO2']);
        PM25data.push(data['PM25']);
        RHdata.push(data['RH'] / 100);
        TEMPdata.push(data['TEMP'] / 100);
        /*
        if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }
        */
        setText("widget_countup1", parseInt(data['kWh']));
        setText("widget_countup4", data['kW'] * 1000);
        setText("widget_countup5", data['CO2']);
        setText("widget_countup6", data['PM25']);
        setText("widget_countup7", parseInt(data['RH'] / 100));
        setText("widget_countup8", parseInt(data['TEMP'] / 100));
        setText("widget_countup12", data['kWh']);
        setText("widget_countup42", data['kW'] * 1000);
        setText("widget_countup52", data['CO2']);
        setText("widget_countup62", data['PM25']);
        setText("widget_countup72", data['RH'] / 100);
        setText("widget_countup82", data['TEMP'] / 100);

        if (CO2data.length > 10) CO2data.shift();
        if (PM25data.length > 10) PM25data.shift();
        if (RHdata.length > 10) RHdata.shift();
        if (TEMPdata.length > 10) TEMPdata.shift();
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
        $("#CO2_chart").sparkline(CO2data, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' ppm'
        });
        $('#PM25_chart').sparkline(PM25data,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' μg/m3'
        });
        $('#RH_chart').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#TEMP_chart").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });

    socket.on('update_kWh_pa', function (data) {
        var chart=c3.generate({bindto:'#chart_kWh',data:{
            columns:[
                ['Public 2F',data['pa200W']],
                ['Public 3F',data['pa300W']],
                ['Public 4F',data['pa400W']]
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

    socket.on('update_pie_pa', function (data) {
        var chart1=c3.generate({bindto:'#rmkWh_chart',data:{
            columns:[['2F',data['pa200W']],['3F',data['pa300W']],['4F',data['pa400W']]],type:'donut'},
            donut:{title:"Public Area"},
            color:{pattern:['#00c0ef','#0fb0c0','#668cff','#ffb300','#69B3BF']}
        });
        setTimeout(function(){
                chart1.load({
                    columns:[['2F',data['pa200kWh']],['3F',data['pa300kWh']],['4F',data['pa400kWh']]]
                });
            }
            ,4000);
    });

    socket.on('pa' + room + '_chart_trend', function (data) {
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

    $("#top_widget1, #top_widget4, #top_widget5, #top_widget6, #top_widget7, #top_widget8").flip({
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

    socket.on('pa' + room + '_chart_status', function (data) {
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
                        "id": "pa_200",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }
});