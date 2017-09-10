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
    res.render('rm402', {
        title: 'Hok Room 402',
        chart: 'chartdiv'
    });
});
router.get('/rm401', function (req, res, next) {
    res.render('rm401', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm402', function (req, res, next) {
    res.render('rm402', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm403', function (req, res, next) {
    res.render('rm403', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm404', function (req, res, next) {
    res.render('rm404', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm405', function (req, res, next) {
    res.render('rm405', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm406', function (req, res, next) {
    res.render('rm406', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/error', function (req, res, next) {
    res.render('error', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});

module.exports = router;