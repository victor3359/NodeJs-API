"use strict";
$(document).ready(function() {

    var powerdata = [];
    var powerdata_c = [];
    var chartdata = [];

    var room = '309';

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

    //3F Socket
    socket.on('rm'+ room +'_init', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);

        new CountUp("widget_countup1", 0,data['kWh'] , 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,data['kW'] * 1000 , 0, 5.0, options).start();
        /*
        if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }
        */
        setText("widget_countup12", data['kWh']);
        setText("widget_countup42", data['kW'] * 1000);

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

    socket.on('rm' + room + '_chart_rt', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('rm'+ room +'_chart_data', function (data) {
        for(var i=data.length - 1;i >= 0;i--) {
            chartdata.push({
                data1: parseFloat(data[i]['kW']) * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });


    socket.on('rm' + room +'_data', function (data) {
        powerdata.push(data['kWh']);
        powerdata_c.push(data['kW'] * 1000);

        setText("widget_countup1", parseInt(data['kWh']));
        setText("widget_countup4", data['kW'] * 1000);

        /*if(data['PWNF']){
            setText("widget_countup2", '活躍');
        }else{
            setText("widget_countup2", '非活躍');
        }*/
        setText("widget_countup12", data['kWh']);
        setText("widget_countup42", data['kW'] * 1000);

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


    socket.on('rm' + room + '_chart_trend', function (data) {
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
                        "id": "Hok_300",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }
});