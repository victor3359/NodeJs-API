var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var jquery = require('jquery');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
