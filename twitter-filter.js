#!/usr/bin/env node

/*
	Author: Arjun Variar
	Dependencies: npm install ntwitter
	Caution: Work In Progress
*/

var twitter = require('ntwitter'),
		geocoder = require('geocoder');

var twit = new twitter({
  consumer_key: '3OM51waVLgJF9jgq6NwVVw',
  consumer_secret: '1BMPzbZaTHsMcncOJY18wZ6Sh4vZuSviJWQfJC9RHro',
  access_token_key: '15353932-wIT2cKVBXAJpR7gwGEpa9tuI0NsDf14KobgMsO28z',
  access_token_secret: '5AcQ2eOCBvHm4vDxha6bUDohhsNu9ofpnvKrS9F0'
});

geocoder.geocode('Bangalore, India',function(err, data) {
	var results = data.results[0];
	var swt = results.geometry.viewport.southwest , nst = results.geometry.viewport.northeast;
	var location = [swt.lng,swt.lat,nst.lng,nst.lat].join(',');
	twit.stream('statuses/filter', { 'locations' : location },function(stream) {
	  stream.on('data', function (data) {
	    	console.log(data.user.name + "@" + data.user.url + " said \"" + data.text + "\"");
	  });
	});
});