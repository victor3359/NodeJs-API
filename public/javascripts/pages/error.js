//<![CDATA[

'use strict';
var table=$('#example_demo').DataTable({"dom":"<'row'<'col-md-5 col-sm-12'l><'col-md-7 col-sm-12'f>r><'table-responsive't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>"});
var $example_demo=$('#example_demo tbody');
$example_demo.on('mouseenter','td',function(){
    var colIdx=table.cell(this).index().column;
    $(table.cells().nodes()).removeClass('highlight');
    $(table.column(colIdx).nodes()).addClass('highlight');
    return false;
});
$example_demo.on('mouseleave','td',function(){
    $(table.cells().nodes()).removeClass('highlight');
    return false;
});
$example_demo.on('click','tr',function(){
    $(this).toggleClass('selected');$('#del_button').on('click',function(){
        table.row('#example_demo tbody .selected').remove().draw(false);
        return false;
    });
    return false;
});
$(".dataTables_wrapper").removeClass("form-inline");$(".dataTables_paginate .pagination").addClass("float-right");

$(document).ready(function () {
    var tabledata = [];
    var socket = io.connect('http://localhost:10000');
    socket.emit('done', 0);


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

    socket.on('error_info_page', function (data) {
        for(var i=data.length - 1;i>=0;i--){
            tabledata.push([data[i]['error_type'], data[i]['datetime'], data[i]['error_info']]);
        }
        for(var i=0;i<data.length;i++){
            table.row.add(tabledata[i]).draw(false);
        }
    });
    socket.on('error_info', function (data) {
        for(var i=data.length - 1;i>=0;i--){
            tabledata.push([data[i]['error_type'], data[i]['datetime'], data[i]['error_info']]);
        }
        for(var i=0;i<data.length;i++){
            ShowNotify(data[i]['error_type'], data[i]['error_info'], data[i]['datetime']);
            table.row.add(tabledata[i]).draw(false);
        }
    });
});

//]]>