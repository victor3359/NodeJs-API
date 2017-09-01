var express = require('express');
var router = express.Router();
var request = require('request');

var url = "http://localhost:8080/r402";

/* GET home page. */
/*
function update() {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            importedJSON = JSON.parse(body);
            console.log(importedJSON);
        }
    });
}
*/
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Hok Room 402',
        chart: 'chartdiv'
    });
});
router.get('/rm402', function (req, res, next) {
    res.render('rm402', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});

module.exports = router;