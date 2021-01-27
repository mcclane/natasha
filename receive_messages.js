const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.post('/sms', (req, res) => {
    console.log(req.body);
});

app.listen(1337, console.log("Listening on port 1337!"));
