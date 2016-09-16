var pg = require('pg');
var express = require('express');
var router = express.Router();
var credentials = require('../dbcredentials/credentials.js');
var apiClient = new pg.Client(credentials);


apiClient.on('notice', function(msg) {
    console.log("notice: %j", msg);
});

apiClient.on('error', function(error) {
    console.log(error);
});

apiClient.connect(function(err){
    if (err){
        return console.error('could not connect to postgres', err);
    }
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginPage', { title: 'Express' });
});

router.get('/registerAccount', function(req, res, next) {
    res.render('registerAccount', { title: 'Express' });
});

router.get('/map', function(req, res, next) {
  res.render('map', { title: 'Express' });
});

module.exports = router;


//LOGIN USER
router.post('/api/loginUser', function(req, res) {

    var results = [];
    var data = {username: req.body.username, password:req.body.password};

    var query = apiClient.query("SELECT user_id FROM user_table where email = '" + data.username+"' and password='"+data.password+"' limit 1");

    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length==0) res.json("incorrect"); //.json not .end
        else {
            res.json(results);
        }
    });
});


// REGISTER USER
router.post('/api/registerUser', function(req, res) {

    var results = [];
    var data = {username: req.body.username, password:req.body.password};

    var query = apiClient.query( "INSERT INTO user_table (email, password, isadmin) VALUES ('" + data.username + "', '" + data.password + "', false)" );

    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length==0) {
            res.json("correct");    //.json not .end
        }
        else {
            res.json("incorrect");  //.json not .end
        }
    });
});


// INSERT MARKER TO DATABASE
router.post('/api/insertMarker', function(req, res) {

    var results = [];
    var data = {userId: req.body.userId, latitude: req.body.latitude, longitude: req.body.longitude};

    var query = apiClient.query( "INSERT INTO marker_table (user_id, latitude, longitude) VALUES (" + data.userId + ", " + data.latitude + ", " + data.longitude + ")" );

    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length==0) {
            res.json("correct")
        }
        else {
            res.json("incorrect");
        }
    });
});


// GET MARKER OF USER
router.get('/api/getMarker', function(req, res) {

    var results = [];
    var data = {userId: req.query.userId};   //query not body here

    var query = apiClient.query( "SELECT latitude, longitude FROM marker_table where user_id = " + data.userId +" limit 1");

    console.log(query);
    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length==0) {
            res.json("incorrect")
        }
        else {
            res.json(results);
        }
    });
});


// UPDATE MARKER IN DATABASE
router.post('/api/updateMarker', function(req, res) {

    var results = [];
    var data = {userId: req.body.userId, latitude: req.body.latitude, longitude: req.body.longitude};

    var query = apiClient.query( "UPDATE marker_table SET latitude = " + data.latitude + ", longitude = " + data.longitude + "WHERE user_id = " + data.userId );

    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length==0) {
            res.json("correct")
        }
        else {
            res.json("incorrect");
        }
    });

});


// CHECK IF USER IS ADMIN
router.get('/api/checkIfAdmin', function(req, res) {

    var results = [];
    var data = {userId: req.query.userId};   //query not body here

    var query = apiClient.query( "SELECT isadmin FROM user_table where user_id = " + data.userId );

    console.log(query);
    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length == 0) {
            res.json("incorrect")
        }
        else {
            res.json(results);
        }
    });
});


// GET ALL MARKERS
router.get('/api/getAllMarkers', function(req, res) {

    var results = [];

    var query = apiClient.query( "SELECT email, latitude, longitude from user_table join marker_table on user_table.user_id = marker_table.user_id where isadmin = false" );

    console.log(query);
    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function(){
        if (results.length == 0) {
            res.json("incorrect")
        }
        else {
            res.json(results);
        }
    });
});