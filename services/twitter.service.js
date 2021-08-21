const { TwitterApi } = require('twitter-api-v2');
const { TWITTER_BEARER_TOKEN } = require('../configs/config');

const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN).readOnly;

const getTweets = async (username) => {
    const { data: { id } } = await twitterClient.v2.userByUsername(username);
    const response = await twitterClient.v2.userLikedTweets(id,
        {
            max_results: 12,
            expansions: 'attachments.media_keys',
            'tweet.fields': 'entities',
            'media.fields': [
                'preview_image_url',
                'url'
            ]
        });
    const { data, includes: { media } } = response._realData;
    const z = [
        { data },
        { media }
    ];

    return z.reduce((acc, value, index, array) => {
        if (value.data !== undefined) {
            value.data.map((tweet) => {
                if (tweet.attachments !== undefined) {
                    if (tweet.entities !== undefined && tweet.entities.urls !== undefined) {
                        acc.push({
                            id: tweet.id,
                            text: tweet.text,
                            media: array[1].media.find((item) => item.media_key === tweet.attachments.media_keys[0]),
                            retweeted: tweet.entities.urls[0].expanded_url
                        });
                        return;
                    }
                    acc.push({
                        id: tweet.id,
                        text: tweet.text,
                        media: array[1].media.find((item) => item.media_key === tweet.attachments.media_keys[0]),
                    });
                } else {
                    if (tweet.entities !== undefined && tweet.entities.urls !== undefined) {
                        acc.push({
                            id: tweet.id,
                            text: tweet.text,
                            retweeted: tweet.entities.urls[0].expanded_url
                        });
                        return;
                    }
                    acc.push({
                        id: tweet.id,
                        text: tweet.text,
                    });
                }
                return 'ok';
            });
            return acc;
        }
        return acc;
    }, []);
};
module.exports = { getTweets };