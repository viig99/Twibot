#!/usr/bin/env node

/*
	Author: Arjun Variar
	Dependencies: npm install ntwitter geocoder
	Caution: Work In Progress
	Currently Reading all Tweets from India minus any filtering (Using Geocoder to Automate the geocoding process.)
*/

var twitter = require('ntwitter'),
		geocoder = require('geocoder');

var twit = new twitter({
  consumer_key: '3OM51waVLgJF9jgq6NwVVw',
  consumer_secret: '1BMPzbZaTHsMcncOJY18wZ6Sh4vZuSviJWQfJC9RHro',
  access_token_key: '15353932-wIT2cKVBXAJpR7gwGEpa9tuI0NsDf14KobgMsO28z',
  access_token_secret: '5AcQ2eOCBvHm4vDxha6bUDohhsNu9ofpnvKrS9F0'
});

geocoder.geocode('India',function(err, data) {
	var results = data.results[0];
	var swt = results.geometry.viewport.southwest , nst = results.geometry.viewport.northeast;
	var location = [swt.lng,swt.lat,nst.lng,nst.lat].join(',');
	twit.stream('statuses/filter', { 'locations' : location },function(stream) {
	  stream.on('data', function (data) {
	  		var url = data.user.url ? "@" + data.user.url : '';
	    	console.log(data.created_at + "::" + data.user.name + url + " said \"" + data.text + "\"");
	  });
	});
});