require ('newrelic');
const translate = require('moji-translate');
const Twit = require('twit');
var config;

var http = require("http");
var server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<html>");
  response.write("<head>");
  response.write("<title>Emoji bot</title>");
  response.write("<style>p {font-family:sans-serif;font-size: 20px;line-height:2;padding:40px;</style>");
  response.write("</head>");
  response.write("<body>");
  response.write("<p>I am an emoji bot!<br>Talk to me at https://twitter.com/to_emoji</p>");
  response.write("</body>");
  response.write("</html>");
  response.end();
});
server.listen(process.env.PORT || 5000);
console.log('🐳 Started server' );

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

    // Throttle. Maybe.
    let when = Math.floor(Math.random() * (15 - 3)) + 3;
    console.log('⏳  ' + timestamp() + ` [${when}s]: @${screenName} ${text} -> ${translated}`);

    setTimeout(function() {
      console.log('✅  ' + timestamp() + ` @${screenName} ${translated}`);
      T.post('statuses/update', {
           in_reply_to_status_id: nameID, status: '@' + screenName + ' ' + translated
        }, function(err, data, response) {
            if (err) {
              console.log(err);
            }
      });
    }, when * 1000);
  }
})

function timestamp() {
  return (new Date()).toLocaleTimeString();
}
