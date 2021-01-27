const mongo = require('./database.js');
const instagram = require('./instagram.js');
const photos = require('./photos.js');
const sms_responses = require('./sms_responses.js');
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');


const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.post('/sms', (req, res) => {
    sms_responses.get_response(req.body)
        .then((twiml) => {
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
        });
});

mongo.initializeMongoDB()
app.listen(1337, console.log("Listening on port 1337!"));
