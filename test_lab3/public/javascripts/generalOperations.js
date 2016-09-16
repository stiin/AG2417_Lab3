var map;
var thisUserMarker = null;
var thisUserId = null;

function initMap() {

	thisUserId = getURLVariable('userId');

	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
	map = new L.Map('map');

	map.doubleClickZoom.disable();
	map.setView(new L.latLng(51.3, 0.7),9);
	map.addLayer(osm);

	getMarkers();
	createUserMarkerEvent();
}


function getMarkers() {
	// Checks if user is admin

	var request = $.ajax({
		url: "/api/checkIfAdmin",
		type: "GET",
		data: {userId: thisUserId},
		cache: false
	});

	request.done(function(msg) {
		console.log(msg);

		if (msg != "incorrect") {
			var isAdmin = msg[0].isadmin;
			if (isAdmin) {
				getAdminMarkers();
			} else {
				getUserMarker();
			}
		}
	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function getAdminMarkers() {
	// Returns all regular user's markers
	// bind popup to each marker with the user's email/name

	var request = $.ajax({
		url: "/api/getAllMarkers",
		type: "GET",
		data: {},
		cache: false
	});

	request.done(function(msg) {
		for (var i = 0; i < msg.length; i++) {
			if (msg != "incorrect") {
				var email = msg[i].email;
				var latitude = msg[i].latitude;
				var longitude = msg[i].longitude;

				var latLng = L.latLng(latitude, longitude);
				var marker = L.marker(latLng, {});
				marker.addTo(map);
				marker.bindPopup('<b>Email: ' + email + '</b>');
			}
		}
	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function getUserMarker(){
	// Get the user's stored marker from the database

	var request = $.ajax({
		url: "/api/getMarker",
		type: "GET",
		data: {userId: thisUserId},
		cache: false
	});

	request.done(function(msg) {

		if (msg != "incorrect") {
			var latitude = msg[0].latitude;
			var longitude = msg[0].longitude;

			var latlng = L.latLng(latitude, longitude);
			thisUserMarker = L.marker(latlng, {});
			thisUserMarker.addTo(map);
		}
	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function createUserMarkerEvent() {
	// If no marker exists on the map: insert marker on map by double clicking on the map.
	// If a marker has already been inserted on the map: remove marker, insert marker on the coordinate of the double click

	map.on('dblclick', function (e) {
		if (thisUserMarker != null) {
			// marker should be updated in the database because it already exists
			map.removeLayer(thisUserMarker);
			thisUserMarker = L.marker(e.latlng, {}).addTo(map);
			updateUserMarkerInDatabase();
		}
		else {
			// marker should be inserted in the database because it does not exist
			thisUserMarker = L.marker(e.latlng, {}).addTo(map);
			insertUserMarkerInDatabase();
		}
	});
}


function insertUserMarkerInDatabase(){

	var request = $.ajax({
		url: "/api/insertMarker",
		type: "POST",
		data: {userId:thisUserId, latitude: thisUserMarker._latlng.lat, longitude:thisUserMarker._latlng.lng},
		cache: false
	});

	request.done(function(msg) {
		console.log(msg);
		if (msg != "correct") alert('Something went wrong while inserting the marker into the db');

	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function updateUserMarkerInDatabase(){

	var request = $.ajax({
		url: "/api/updateMarker",
		type: "POST",
		data: {userId:thisUserId, latitude: thisUserMarker._latlng.lat, longitude:thisUserMarker._latlng.lng},
		cache: false
	});

	request.done(function(msg) {
		console.log(msg);
		if (msg != "correct") alert('Something went wrong while updating the marker into the db');

	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function sendLoginToServer(){

	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;

	console.log('logging in with username: '+ username +' and password '+ password);
 
	var request = $.ajax({
            url: "/api/loginUser",
            type: "POST",
            data: {username:username, password:password},
            cache: false
        });

	request.done(function(msg) {
            console.log(msg);
            if (msg=="incorrect") alert('The credentials are wrong!');
            else {
            	var userId = msg[0].user_id;
            	var urlDirect = "/map?userId="+ userId;
            	console.log(urlDirect);
            	window.location.href = urlDirect;
            }
        });

	request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
}


function registerNewUser() {
	// Can only register regular users without admin privileges

	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;

	var request = $.ajax({
		url: "/api/registerUser",
		type: "POST",
		data: {username:username, password:password},
		cache: false
	});

	request.done(function(msg) {
		console.log(msg);
		if (msg=="correct") {
			// If the registration is successful - redirect to the login page
			var urlDirect = "/"
			console.log(urlDirect);
			console.log("registration successful");
			window.location.href = urlDirect;
		}
		else {
			alert('The registration was unsuccessful! ' + msg);
		}
	});

	request.fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


function getURLVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
}