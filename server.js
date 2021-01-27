const MessagingResponse = twilio.twiml.MessagingResponse;

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    processed_body = req.body.Body.toLowerCase().trim();
    // check if the number exists in the database

    console.log(req.body.From);
    mongo.phoneNumberExists(req.body.From).then((result) => {
        if(result) {
            if(processed_body === "meme") {
                try {
                    get_random_photo(memeAccounts[Math.round(Math.random()*memeAccounts.length)])
                        .then((image) => {
                            console.log("Image: "+JSON.stringify(image));
                            currentImage = image;
                            twiml.message(image.url);
                            twiml.message("Caption: "+image.title+"\nPost? Y/Meme");
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        });
                } catch(error) {
                    console.log(error);
                    twiml.message(error);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());    
                }
            }
            else if(processed_body === "y" && currentImage != undefined) {
                try {
                    filename = "./memes/"+currentImage.name+".jpg";
                    download_image(currentImage.url, filename, function() {
                        upload_photo(filename, currentImage.title, function() {
                            twiml.message("Done.");
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                            currentImage = undefined;
                        })
                    });
                } catch(error) {
                    console.log(error);
                    twiml.message("Error: "+error);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());    
                }
            }
            else {
                if(currentImage == undefined) {
                    twiml.message("Unrecognized input. Valid options are:\nMeme");
                }
                else {
                    twiml.message("Unrecognized input. Valid options are:\nY\nMeme");
                }
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }
        }
    });
});


// initialize the mongodb and then start the app
mongo.initializeMongoDB()
    .then(() => {
        app.listen(1337, console.log("Listening on port 1337!"));
    });
