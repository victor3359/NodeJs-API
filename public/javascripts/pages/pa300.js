"use strict";
$(document).ready(function() {

    var CO2data = [];
    var PM25data = [];
    var RHdata = [];
    var TEMPdata = [];

    function controlalert(name, cmd){
        iziToast.show({title:'Command',message:'Turn ' + cmd + ' the ' + name + '.' ,color:'#00cc99',position:'bottomRight'});
    }

    socket.emit('done', 0);

    //Controller Def Start
    $('#WC_Light_Switch').click(function () {
        if(getText('WC_Light_State') == 'Off'){
            socket.emit('WCLight', 'ON');
            controlalert('W.C. Light', 'On');
        }else{
            socket.emit('WCLight', 'OFF');
            controlalert('W.C. Light', 'Off');
        }
    });
    $('#WD_Light_Switch').click(function () {
        if(getText('WD_Light_State') == 'Off'){
            socket.emit('WDLight', 'ON');
            controlalert('Window Light', 'On');
        }else{
            socket.emit('WDLight', 'OFF');
            controlalert('Window Light', 'Off');
        }
    });
    $('#RM_Light_Switch').click(function () {
        if(getText('RM_Light_State') == 'Off'){
            socket.emit('RMLight', 'ON');
            controlalert('Room Lights', 'On');
        }else{
            socket.emit('RMLight', 'OFF');
            controlalert('Room Lights', 'Off');
        }
    });
    $('#BD_Light_Switch').click(function () {
        if(getText('BD_Light_State') == 'Off'){
            socket.emit('BDLeftLight', 'ON');
            socket.emit('BDRightLight', 'ON');
            controlalert('Bed Lights', 'On');
        }else{
            socket.emit('BDLeftLight', 'OFF');
            socket.emit('BDRightLight', 'OFF');
            controlalert('Bed Lights', 'Off');
        }
    });
    $('#All_On').click(function () {
        socket.emit('WCLight', 'ON');
        socket.emit('WDLight', 'ON');
        socket.emit('RMLight', 'ON');
        socket.emit('BDLeftLight', 'ON');
        socket.emit('BDRightLight', 'ON');
        controlalert('Lights', 'On All');
    });
    $('#All_Off').click(function () {
        socket.emit('WCLight', 'OFF');
        socket.emit('WDLight', 'OFF');
        socket.emit('RMLight', 'OFF');
        socket.emit('BDLeftLight', 'OFF');
        socket.emit('BDRightLight', 'OFF');
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

    //Room 402 Socket
    socket.on('pa400_init', function (data) {
        CO2data.push(data['CO2']);
        PM25data.push(data['PM25']);
        RHdata.push(data['RH']);
        TEMPdata.push(data['TEMP']);

        new CountUp("widget_countup1", 0,data['CO2'] , 0, 5.0, options).start();
        new CountUp("widget_countup2", 0,data['PM25'] , 0, 5.0, options).start();
        new CountUp("widget_countup3", 0,parseInt(data['RH'] / 100) , 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,parseInt(data['TEMP'] / 100) , 0, 5.0, options).start();
        setText("widget_countup12", data['CO2']);
        setText("widget_countup22", data['PM25']);
        setText("widget_countup32", data['RH'] / 100);
        setText("widget_countup42", data['TEMP'] / 100);
        /*
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
        */
        $("#visitsspark-chart").sparkline(CO2data, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' ppm'
        });
        $('#salesspark-chart').sparkline(PM25data,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' μg/m3'
        });
        $('#mousespeed').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#rating").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });


    socket.on('pa400_data', function (data) {
        CO2data.push(data['CO2']);
        PM25data.push(data['PM25']);
        RHdata.push(data['RH']);
        TEMPdata.push(data['TEMP']);


        setText("widget_countup1", data['CO2']);
        setText("widget_countup2", data['PM25']);
        setText("widget_countup3", parseInt(data['RH'] / 100));
        setText("widget_countup4", parseInt(data['TEMP'] / 100));
        setText("widget_countup12", data['CO2']);
        setText("widget_countup22", data['PM25']);
        setText("widget_countup32", data['RH'] / 100);
        setText("widget_countup42", data['TEMP'] / 100);
        /*
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
        */


        if (CO2data.length > 10) CO2data.shift();
        if (PM25data.length > 10) PM25data.shift();
        if (RHdata.length > 10) RHdata.shift();
        if (TEMPdata.length > 10) TEMPdata.shift();

        $("#visitsspark-chart").sparkline(CO2data, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' ppm'
        });
        $('#salesspark-chart').sparkline(PM25data,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' μg/m3'
        });
        $('#mousespeed').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#rating").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });



//   flip js

    $("#top_widget1, #top_widget2,#top_widget3, #top_widget4").flip({
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