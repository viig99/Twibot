#!/usr/bin/env node

/*
	Author: Arjun Variar
	Dependencies: npm install ntwitter geocoder
	Caution: Work In Progress
	Currently I am checking the average tweet for various configurable filters :D (Check below for list of parameters on which you may want to filter on.)
*/

var twitter = require('ntwitter'),
		geocoder = require('geocoder');

var twit = new twitter({
  consumer_key: '3OM51waVLgJF9jgq6NwVVw',
  consumer_secret: '1BMPzbZaTHsMcncOJY18wZ6Sh4vZuSviJWQfJC9RHro',
  access_token_key: '15353932-wIT2cKVBXAJpR7gwGEpa9tuI0NsDf14KobgMsO28z',
  access_token_secret: '5AcQ2eOCBvHm4vDxha6bUDohhsNu9ofpnvKrS9F0'
});

var config = {
		region: 'New York,USA',
		printInterval: 30000,
		filter: 'data.user.followers_count > 100'
};

geocoder.geocode(config.region,function(err, data) {
	var results = data.results[0];
	var swt = results.geometry.viewport.southwest , nst = results.geometry.viewport.northeast;
	var location = [swt.lng,swt.lat,nst.lng,nst.lat].join(',');
	var TimeArray = [],lasttime = Date.now(),currenttime, time;
	setInterval(function() {
		time = (TimeArray.reduce(function(a,b) { return a + b },0) / TimeArray.length).toFixed(2);
	  if (!isNaN(time)) console.log( "########################################### The Average time between the tweets is " + time + " secs.");
	}, config.printInterval);
	twit.stream('statuses/filter', { 'locations' : location },function(stream) {
	  stream.on('data', function (data) {
	  	if (eval(config.filter)) {
				currenttime = Date.now(data.created_at),diff = (currenttime - lasttime)/1000,lasttime = currenttime;
				TimeArray.push(diff);
				var url = data.user.url ? "@" + data.user.url : '';
				console.log(data.created_at + "::" + data.user.name + url + " said \"" + data.text + "\"");
			}
	  });
	});
});





/*
Sample Data from Twitter on which you may want to filter on:
{
    "retweet_count": 0,
    "text": "Man I like me some @twitterapi",
    "entities": {
        "urls": [],
        "hashtags": [],
        "user_mentions": [
            {
                "indices": [
                    19,
                    30
                ],
                "name": "Twitter API",
                "id": 6253282,
                "screen_name": "twitterapi",
                "id_str": "6253282"
            }
        ]
    },
    "retweeted": false,
    "in_reply_to_status_id_str": null,
    "place": null,
    "in_reply_to_user_id_str": null,
    "coordinates": null,
    "source": "web",
    "in_reply_to_screen_name": null,
    "in_reply_to_user_id": null,
    "in_reply_to_status_id": null,
    "favorited": false,
    "contributors": null,
    "geo": null,
    "truncated": false,
    "created_at": "Wed Feb 29 19:42:02 +0000 2012",
    "user": {
        "is_translator": false,
        "follow_request_sent": null,
        "statuses_count": 142,
        "profile_background_color": "C0DEED",
        "default_profile": false,
        "lang": "en",
        "notifications": null,
        "profile_background_tile": true,
        "location": "",
        "profile_sidebar_fill_color": "ffffff",
        "followers_count": 8,
        "profile_image_url": "http://a1.twimg.com/profile_images/1540298033/phatkicks_normal.jpg",
        "contributors_enabled": false,
        "profile_background_image_url_https": "https://si0.twimg.com/profile_background_images/365782739/doof.jpg",
        "description": "I am just a testing account, following me probably won't gain you very much",
        "following": null,
        "profile_sidebar_border_color": "C0DEED",
        "profile_image_url_https": "https://si0.twimg.com/profile_images/1540298033/phatkicks_normal.jpg",
        "default_profile_image": false,
        "show_all_inline_media": false,
        "verified": false,
        "profile_use_background_image": true,
        "favourites_count": 1,
        "friends_count": 5,
        "profile_text_color": "333333",
        "protected": false,
        "profile_background_image_url": "http://a3.twimg.com/profile_background_images/365782739/doof.jpg",
        "time_zone": "Pacific Time (US & Canada)",
        "created_at": "Fri Sep 09 16:13:20 +0000 2011",
        "name": "fakekurrik",
        "geo_enabled": true,
        "profile_link_color": "0084B4",
        "url": "http://blog.roomanna.com",
        "id": 370773112,
        "id_str": "370773112",
        "listed_count": 0,
        "utc_offset": -28800,
        "screen_name": "fakekurrik"
    },
    "id": 174942523154894850,
    "id_str": "174942523154894848"
}
*/