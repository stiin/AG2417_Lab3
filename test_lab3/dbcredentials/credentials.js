var pg = require('pg');

var host ='localhost';
var port ='5433';
var dbName = 'AG2417_lab3_NEW';

var connectionString = 'postgres://postgres:terror@'+host+':'+port+'/'+dbName;


// Export the connection string for usage by the API
module.exports = connectionString;

var client = new pg.Client(connectionString);
client.connect();

// these queries will only be run once, for initialization
var queryCreateUserTable = client.query('CREATE TABLE if not exists user_table (user_id serial not null, email text, password text, isAdmin boolean default false)'); 
var queryCreateMarkerTable = client.query('CREATE TABLE if not exists marker_table (marker_id serial not null, user_id bigint not null, latitude double precision, longitude double precision)');

//Execute queries
queryCreateUserTable.on('end', function() {
		queryCreateMarkerTable.on('end', function() {
			client.end();
		})
});

