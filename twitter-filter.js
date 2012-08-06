var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: '3OM51waVLgJF9jgq6NwVVw',
  consumer_secret: '1BMPzbZaTHsMcncOJY18wZ6Sh4vZuSviJWQfJC9RHro',
  access_token_key: '15353932-wIT2cKVBXAJpR7gwGEpa9tuI0NsDf14KobgMsO28z',
  access_token_secret: '5AcQ2eOCBvHm4vDxha6bUDohhsNu9ofpnvKrS9F0'
});

twit.stream('statuses/sample', function(stream) {
  stream.on('data', function (data) {
  	if ((/^.*(Olympics|India).*$/gi).test(data.text)) {
    	console.log(data.user.name + "@"+data.user.url+" said \"" + data.text + "\"");
    }
  });
});