const translate = require('moji-translate');
const Twit = require('twit');
const throttle = require('lodash.throttle');
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

const throttleLimit = process.env.throttle_limit || config.throttle_limit; // In seconds;

const stream = T.stream('user');

let sendTweetThrottled = throttle((nameID, screenName, translated)=>{
  T.post('statuses/update', {
      in_reply_to_status_id: nameID, status: '@' + screenName + ' ' + translated
  }, function(err, data, response) {
      if (err) {
        console.log(err);
      }else{
        console.log(new Date().toLocaleTimeString());
      }
  });
}, throttleLimit * 1000);
    
// Thanks to @ohhoe's https://github.com/rachelnicole/isReallyCute-bot for
// all of the code samples <3

// Translate a tweet.
stream.on('tweet', function (message) {
  let screenName = message.user.screen_name;
  let nameID = message.id_str;
  let text = message.text;

  // OMG never reply to yourself.
  if (screenName === "to_emoji") {
    console.log('   choosing not to talk to myself', text);
    return;
  }

  // If you were directly responded to. Looking at mentions sent the bot in a loop
  // and uhhhh let's not do that again.
  if (message.in_reply_to_screen_name === 'to_emoji') {
    let translated = translate.translate(text, true);
    if (translated.trim() === '') {
      translated = '🤷‍♀️🤔';
    }
  
    console.log(`⏳ @${screenName} ${text} -> ${translated}`);

    console.log('✅  ' + (new Date()).toLocaleTimeString() + ` @${screenName} ${translated}`);

    sendTweetThrottled(nameID, screenName, translated);
    
  }
})
