#!/usr/bin/env node

/*
	Author: Arjun Variar
	Dependencies: npm install ntwitter geocoder natural wordpos restler glossary.
	Caution: Work In Progress
	Currently I am checking the average tweet for various configurable filters :D (Check below for list of parameters on which you may want to filter on.)
	TODO:
		1) http://css.dzone.com/articles/using-natural-nlp-module: Add the classification API to the bot. And train it using the tweets which have hash-tags in them for the first 100 or 1000 
			 & then predict hashtags later on; keep improving the classification.

    Plugins used for extracting important terms:
    Wordpos for using Nouns as important terms. (https://github.com/moos/wordpos)
    Yahoo term extraction API. (http://developer.yahoo.com/search/content/V1/termExtraction.html 5000 request limit)
    Glossary server-side API. (https://github.com/harthur/glossary)
*/

var twitter = require('ntwitter'),
		geocoder = require('geocoder'),
		natural = require('natural');

var twit = new twitter({
  consumer_key: '3OM51waVLgJF9jgq6NwVVw',
  consumer_secret: '1BMPzbZaTHsMcncOJY18wZ6Sh4vZuSviJWQfJC9RHro',
  access_token_key: '15353932-wIT2cKVBXAJpR7gwGEpa9tuI0NsDf14KobgMsO28z',
  access_token_secret: '5AcQ2eOCBvHm4vDxha6bUDohhsNu9ofpnvKrS9F0'
});

var config = {
	region: 'World',
	printInterval: 30000,
	filter: 'true',
	topTopicsToPrint: 10,
    plugin: 'Sentiment' // plugins currently supported are (Glossary,Yahoo,Wordpos,Hashtag,Sentiment for sentiment analysis)
},FunctionExecuter,important_words_array = [],classifier,PrintExecuter = displayTopNumbers;

if (config.plugin == 'Glossary') {
    var glossary = require("glossary")({ collapse: true , blacklist: ["I" , "I'm" , "We" , "Me" , "&amp" , "http"]});
    FunctionExecuter = GlossaryExtract;
} else if (config.plugin == 'Yahoo') {
    var rest = require('restler');
    var Y = rest.service(function() {
        }, {
          baseURL: 'http://search.yahooapis.com'
        }, {
          extract: function(message) {
            return this.post('ContentAnalysisService/V1/termExtraction', { data: { appid: 'b9blaUfV34FwMZsV18h7FRohGQAukT6LespTaEgIWKjAL34uStZ1A2R1ueSjGzQMvQxemUaBsI29gwv0kbGSArE3A7qAXtY-',context: message , output : 'json'} });
          }
    });
    var client = new Y();
    FunctionExecuter =  YahooExtract;
} else if (config.plugin == 'Wordpos') {
    var WordPOS = require('wordpos');
    var wordpos = new WordPOS();
    FunctionExecuter = WordposExtract;
} else if (config.plugin == 'Hashtag') {
    FunctionExecuter = HashtagExtract;
} else if (config.plugin == 'Sentiment') {
    loadClassifier();
    FunctionExecuter = CheckSentiment;
    PrintExecuter = sentimentCount;
}

console.log('Data will be populated every ' + (config.printInterval)/1000 + ' secs.')
geocoder.geocode(config.region,function(err, data) {
	if (err) {
		console.log(err);
		process.exit(0);
	}
	var results = data.results[0];
	var swt = results.geometry.viewport.southwest , nst = results.geometry.viewport.northeast;
	var location = config.region == 'World' ? "-180,-90,180,90" : [swt.lng,swt.lat,nst.lng,nst.lat].join(',');
	var TimeArray = [],lasttime = Date.now(),currenttime, time;
	setInterval(function() {
		time = (TimeArray.reduce(function(a,b) { return a + b },0) / TimeArray.length).toFixed(2);
		PrintExecuter(config.topTopicsToPrint);
		if (!isNaN(time)) console.log( "########################################### The Average time between the tweets is " + time + " secs.");
	}, config.printInterval);
	twit.stream('statuses/filter', { 'locations' : location },function(stream) {
	  stream.on('data', function (data) {
	  	if (eval(config.filter)) {
				currenttime = Date.now(data.created_at),diff = (currenttime - lasttime)/1000,lasttime = currenttime;
				TimeArray.push(diff);
				// showSummary(data);
			}
			FunctionExecuter(data);
	  });
	});
});

function showSummary(data) {
	var url = data.user.url ? "@" + data.user.url : '';
	console.log(data.created_at + "::" + data.user.name + url + " said \"" + data.text + "\"");
}

function classifyHashTags(data) {
	data.entities.hashtags.forEach(function(hash) {
		classifier.addDocument(data.text,hash);
		classifier.train();
	});
}

function AddWordsToArray(result) {
	result.forEach(function(r) {
		var important_word = important_words_array.filter(function(obj) {
			return obj.key == r;
		})[0];
		if (important_word)
			important_word.count++;
		else
			important_words_array.push({key:r,count:1});
	});
}

function displayTopNumbers(number) {
	var temp = important_words_array.sort(function(a,b) { return b.count - a.count}).filter(function(obj) {return obj.key.length >= 3});
    if (temp.length < number) number = temp.length - 1;
	for (var i = 0;i <= number ;++i) {
		console.log("Trending Topic "+i+" is \""+temp[i].key + "\" with the count "+temp[i].count);
	};
	console.log("-------------------------##############################------------------------------");
}

function sentimentCount() {
    var pos = important_words_array.filter(function(obj) {return obj.key == 'pos'})[0].count ;
    var neg = important_words_array.filter(function(obj) {return obj.key == 'neg'})[0].count ;
    var percentage = ((pos * 100) / (pos + neg)).toFixed(2);
    console.log('The % of Positive Tweets are ' + percentage);
}

function YahooExtract(data) {
	client.extract(data.text).on('error',function(err) {
			console.error(err);
	}).on('success',function(result) {
			AddWordsToArray(JSON.parse(result)["ResultSet"]["Result"]);
	});
}

function GlossaryExtract(data) {
    var keywords = glossary.extract(data.text);
    AddWordsToArray(keywords);
}

function WordposExtract(data) {
    wordpos.getNouns(data.text,AddWordsToArray);
}

function HashtagExtract(data) {
    AddWordsToArray(data.entities.hashtags.map(function(obj){return obj.text}));
}

function CheckSentiment(data) {
    AddWordsToArray([classifier.classify(data.text)]);
}

function loadClassifier() {
    natural.BayesClassifier.load('token_classifier.json', null, function(err, result) {
        if (err) throw err;
        classifier = result;
        console.log('Classifier Loaded.');
    });
}



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