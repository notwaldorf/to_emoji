const translate = require('moji-translate');
const Twit = require('twit');
var config;

try {
  config = require('./.env');
} catch (ex) {
  config = {}
}

const T = new Twit({
  consumer_key:        process.env.emoji_bot_consumer_key || config.consumer_key,
  consumer_secret:     process.env.emoji_bot_consumer_secret || config.consumer_secret,
  access_token:        process.env.emoji_bot_access_token || config.access_token,
  access_token_secret: process.env.emoji_bot_access_secret || config.access_token_secret,
  timeout_ms:          60*1000,  // optional HTTP request timeout to apply to all requests.
});

const stream = T.stream('user');

// Thanks to @ohhoe's https://github.com/rachelnicole/isReallyCute-bot for
// all of the code <3

// Send a welcome message to a follower.
stream.on('follow', function (event) {
  let source = event.source;
  let screenName = source.screen_name;

  var welcome  =
      '👋 🆒 🐱! Tweet something at me and I\'ll translate it back to ✨🎉💰';

  console.log('👋  ' + screenName);

  T.post('statuses/update', {
      status: '@' + screenName + ' ' + welcome
    }, function(err, data, response) {
    // console.log(data);
  })
})

// Translate a tweet.
stream.on('tweet', function (message) {
	let screenName = message.user.screen_name;
  let nameID = message.id_str;
  let text = message.text;

  // OMG never reply to yourself.
  if (screenName === "to_emoji") {
    console.log('choosing not to talk to myself', text)
    return;
  }

  // If you were directly responded to. Looking at mentions sent the bot in a loop
  // and uhhhh let's not do that again.
	if (message.in_reply_to_screen_name === 'to_emoji') {
    let translated = translate.translate(text, true);
    if (translated.trim() === '') {
      translated = '🤷‍♀️🤔';
    }
    console.log(screenName, text + " -> " + translated);

		T.post('statuses/update',
          { in_reply_to_status_id: nameID, status: '@' + screenName + ' ' + translated },
      function(err, data, response) {
  			// console.log(data)
  		})
	}

})
