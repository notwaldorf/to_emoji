const translate = require('moji-translate');
const Twit = require('twit');
const T    = new Twit(require('./.env'));
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

	if (message.in_reply_to_screen_name === 'to_emoji') {
    let translated = translate.translate(text, true);
  	console.log(screenName, text + " -> " + translated);

		T.post('statuses/update', { in_reply_to_status_id: nameID, status: '@' + screenName + ' ' + translated }, function(err, data, response) {
			// console.log(data)
		})
	}

})
