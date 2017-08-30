var express = require('express');
var router = express.Router();
var request = require('request');

var url = "http://localhost:8080/r402";
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Hok House',
        chart: 'chartdiv'
    });
    function update() {
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var importedJSON = JSON.parse(body);
                console.log(importedJSON);
            }
        });
    }
    setInterval(update, 1000);
});
module.exports = router;