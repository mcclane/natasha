# Natasha, a chat bot to run an instagram meme page

Disclaimer: This is something I wrote in high school.

- twilio to send and receive SMS messages
- instagram-private-api node js package to post to instagram.
- scraped possible memes to post from a list of instagram accounts

Example conversation:

```
you> Meme
natasha> (sends meme photo)
natasha> Post meme? Y/Meme?
you> Y
(meme posted to instagram account)
natasha> Done.
```


# A guided tour
- [index.js](index.js): Single webhook for receiving texts. Decides what to send back using the functions in sms\_responses
- [sms\_responses.js](sms_responses.js): parses the incoming text, carries out necessary action, and forms a response. Options include adding the details of an instagram account, sending a meme, and posting a meme.
- [instagram.js](instagram.js): Functions to post memes to instagram
- [photos.js](photos.js): Functions to scrape a random meme from instagram
- [database.js](database.js): Drives a MongoDB database mapping phone numbers to instagram credentials. Super secure.
- [accounts.js](accounts.js) and [hashtags.js](hashtags.js): stores lists of accounts and hashtags to scrape memes from. Before the invention of JSON.
- [nohup.out](nohup.out): Some logs from when I actually used this.
