var express = require('express');
var router = express.Router();
var request = require('request');


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
router.get('/pa200', function (req, res, next) {
    res.render('pa200', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/pa300', function (req, res, next) {
    res.render('pa300', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/pa400', function (req, res, next) {
    res.render('pa400', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm201', function (req, res, next) {
    res.render('rm201', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm202', function (req, res, next) {
    res.render('rm202', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm203', function (req, res, next) {
    res.render('rm203', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm204', function (req, res, next) {
    res.render('rm204', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm205', function (req, res, next) {
    res.render('rm205', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm301', function (req, res, next) {
    res.render('rm301', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm302', function (req, res, next) {
    res.render('rm302', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm303', function (req, res, next) {
    res.render('rm303', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm304', function (req, res, next) {
    res.render('rm304', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
});
router.get('/rm305', function (req, res, next) {
    res.render('rm305', {
        title: 'Hok House',
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