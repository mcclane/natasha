const mongo = require('./database.js');
const photos = require('./photos.js');
const instagram = require('./instagram.js');
const hashtags = require('./hashtags.js');
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

var commands = {
    'username': returnUsername,
    'password': returnPassword,
    'subject': returnSubject
}
var state = {};

function get_response(body) {
    return new Promise(function(resolve, reject) {
        const twiml = new MessagingResponse();
        possible_username= /[Uu][Ss][Ee][Rr][Nn][Aa][Mm][Ee]: (\S+)/.exec(body.Body);
        possible_password = /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]: (\S+)/.exec(body.Body);
        possible_subject = /[Ss][Uu][Bb][Jj][Ee][Cc][Tt]: (\S+)/.exec(body.Body);
        // see if they want a meme!
        if(state[body.From] == null) {
            state[body.From] = {
                subject: "memes"
            }
        }
        if(body.Body.toLowerCase().trim() === "photo") {
            console.log("They want a meme!");
            photos.get_random_photo(state[body.From].subject)
                .then((photo) => {
                    state[body.From].latest = photo;
                    twiml.message("Reply with Post to post this photo:\n"+photo.url);
                    resolve(twiml);
                })
                .catch((reason) => {
                    twiml.message(reason);
                    resolve(twiml);
                })
        }
        else if(body.Body.toLowerCase().trim() === "video") {
            console.log("They want a video!");
            photos.get_random_video(state[body.From].subject)
                .then((video) => {
                    state[body.From].latest = video;
                    twiml.message("Reply with Post to post this video:\n"+video.url);
                    resolve(twiml);
                })
                .catch((reason) => {
                    twiml.message(reason);
                    resolve(twiml);
                });
        }
        // check for a Username:
        else if(possible_username != null && possible_username.length > 0) {
            console.log(possible_username[1]);
            mongo.setInstagramUsername(body.From, possible_username[1]);
            twiml.message("Username Received!");
            resolve(twiml);
        }
        // check for a Password:
        else if(possible_password != null) {
            console.log(possible_password[1]);
            mongo.setInstagramPassword(body.From, possible_password[1]);
            twiml.message("Password Received!");
            resolve(twiml);
        }
        // check for a subject
        else if(possible_subject != null) {
            state[body.From].subject = possible_subject[1];
        }
        // check if they want to post the meme
        else if(body.Body.toLowerCase().trim() === "post" && body.From in state) {
            mongo.validate(body.From,
                function success() {
                    // check if it is image
                    thing_to_post = state[body.From].latest;
                    if(thing_to_post.type === "image") {
                        console.log("Starting to post this this meme!");
                        // download the meme
                        let filename = "./memes/" + /[^\/]+.jpg/.exec(thing_to_post.url);
                        photos.download_photo(thing_to_post.url, filename, function() {
                            // then post the meme
                            mongo.getInstagramCredentials(body.From)
                                .then((credentials) => {
                                    instagram.upload_photo(credentials, filename, "Tag a friend "+hashtags[state[body.From].subject], function callback() {
                                        twiml.message("Done.");
                                        resolve(twiml);
                                    })
                                });
                        });
                    }
                    // video
                    else if(thing_to_post.type === "video") {
                        try {
                            console.log("Starting to post this video!");
                            // grab the filenames from the url
                            let filename = "./memes/" + /[^\/]+.mp4/.exec(thing_to_post.url);
                            let display_filename = "./memes/" + /[^\/]+.jpg/.exec(thing_to_post.display_url);
                            // download the photo and save it to the filenames
                            photos.download_video(thing_to_post.url, thing_to_post.display_url, filename, display_filename, function() {
                                // retrieve the credentials and post the photo
                                mongo.getInstagramCredentials(body.From)
                                    .then((credentials) => {
                                        instagram.upload_video(credentials, filename, display_filename, "Tag a friend \n"+hashtags[state[body.From].subject], function callback() {
                                            twiml.message("Done.");
                                            resolve(twiml); // end
                                        })
                                        
                                    })
                                    .catch((reason) => {
                                            twiml.message("Error: "+reason);
                                            resolve(twiml);
                                    }); 
                            });
                        } catch(error) {
                            twiml.message("Something went wrong trying to post the video. Please try again.");
                            resolve(twiml);
                        }
                    }
                },
                function no_password() {
                    twiml.message("You need to supply a password by sending 'Password: yourpassword123'");
                    resolve(twiml);
                },
                function no_exist() {
                    twiml.message("You need to supply a username by sending 'Username: yourusername123'");
                    resolve(twiml);
                }
            );
        }
        // see if the text is a command
        else if(body.Body.toLowerCase().trim() in commands) {
            commands[body.Body.toLowerCase().trim()](body)
                .then((result) => {
                    twiml.message(result);
                    resolve(twiml);
                });
        }
        else {
            twiml.message("Help Message!");
            resolve(twiml);
        }
    });
}

function returnUsername(body) {
    return new Promise(function(resolve, reject) {
        mongo.phoneNumberExists(body.From)
            .then((exists) => {
                if(exists) {
                    mongo.getInstagramCredentials(body.From)
                        .then((credentials) => {
                            resolve(credentials.username);
                        });
                }
                else {
                    resolve("No username found");
                }
            })
    });
}
function returnPassword(body) {
    return new Promise(function(resolve, reject) {
        mongo.phoneNumberExists(body.From)
            .then((exists) => {
                if(exists) {
                    mongo.getInstagramCredentials(body.From)
                        .then((credentials) => {
                            if('password' in credentials) {
                                resolve(credentials.password);
                            }
                            else {
                                resolve("No password found");
                            }
                        });
                }
                else {
                    resolve("No password found");
                }
            })
    });
}

function returnSubject(body) {
    return new Promise((resolve, reject) => {
        resolve(state[body.From].subject);
    });
}

module.exports = {
    get_response: get_response
}
