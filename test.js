const translate = require('moji-translate');

tweetFromSomeone('one');
tweetFromYourself('me');
tweetFromSomeone('two');
tweetFromSomeone('three');
tweetFromSomeone('four');


function tweetFromSomeone(who) {
  onTweet({
    user: { screen_name: who },
    text: 'test robot likes dogs',
    id_str: who,
    in_reply_to_screen_name: 'to_emoji'
  });
}

function tweetFromYourself(who) {
  onTweet({
    user: { screen_name: 'to_emoji' },
    text: 'test robot likes dogs',
    id_str: who,
    in_reply_to_screen_name: 'to_emoji'
  });
}

function onTweet(message) {
  let screenName = message.user.screen_name;
  let nameID = message.id_str;
  let text = message.text;

  // OMG never reply to yourself.
  if (screenName === "to_emoji") {
    console.log('choosing not to talk to myself', text);
    return;
  }

  // If you were directly responded to. Looking at mentions sent the bot in a loop
  // and uhhhh let's not do that again.
  if (message.in_reply_to_screen_name === 'to_emoji') {
    let translated = translate.translate(text, true);
    if (translated.trim() === '') {
      translated = '🤷‍♀️🤔';
    }

    let when = Math.floor(Math.random() * (15 - 3)) + 3;
    console.log(`[${when}s]: @${screenName} ${text} -> ${translated}`);

    // Set a delay between 5 to 10s.
    setTimeout(function() {
      console.log('** tweeeted **' + (new Date()).toLocaleTimeString());
    }, when * 1000);

    // T.post('statuses/update', {
    //      in_reply_to_status_id: nameID, status: '@' + screenName + ' ' + translated
    //   }, function(err, data, response) {
    //       if (err) {
    //         console.log(err);
    //       }
    // })
  }
}
