const request = require('request');
const fs = require('fs');
const accounts = require('./accounts.js');


function get_random_photo(subject) {
    return new Promise((resolve, reject) => {
        source = accounts.images[subject];
        username = source[Math.floor(Math.random()*source.length)];
        console.log("Retrieving a meme from: "+username);
        request.get("https://www.instagram.com/"+username, (err, res, body) => {
            data = JSON.parse(/<script\s+type="text\/javascript">window\._sharedData\s+=\s+(\{.*?\});/.exec(body)[1]);
            images = [];
            data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.forEach(i => {
                if(!i.node.is_video) {
                    try {
                        image = i.node.dimensions;
                        image.type = "image"
                        image.url = i.node.display_url;
                        image.title = "follow @outofmemescomebacklater for more!";
                        if(image != undefined) {
                            images.push(image);
                        }
                    } catch(error){}
                }
            });
            //console.log(images);
            if(images.length > 0) {
                resolve(images[Math.round(Math.random()*images.length)]);
            }
            else {
                reject("Something went wrong. Try again!");
            }
        });
    });
}

function get_random_video(subject) {
    return new Promise((resolve, reject) => {
        source = accounts.videos[subject];
        username = source[Math.floor(Math.random()*source.length)];
        console.log("Retrieving a video from: "+username);
        request.get("https://www.instagram.com/"+username, (err, res, body) => {
            data = JSON.parse(/<script\s+type="text\/javascript">window\._sharedData\s+=\s+(\{.*?\});/.exec(body)[1]);
            videos = [];
            data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.forEach(i => {
                if(i.node.is_video) {
                    try {
                        videos.push({
                            type: "video",
                            shortcode: i.node.shortcode,
                            display_url: i.node.display_url,
                        });
                    } catch(error){}
                }
            });
            if(videos.length > 0) {
                try {
                    random_video = videos[Math.round(Math.random()*videos.length)];
                    // now we need to get the link the the actual video
                    request.get("https://www.instagram.com/p/"+random_video.shortcode, (err, res, body) => {
                        random_video.url = /video_url":"(\S+?)"/.exec(body)[1];
                        resolve(random_video);
                    });
                } catch(error) {
                    reject("Something went wrong. Try Again!");
                }
            }
            else {
                reject("Something went wrong. Try again!");
            }
        });
    });
}

function download_photo(url, filename, callback) {
    options = {
        url: url
    }
    request(options).pipe(fs.createWriteStream(filename)).on('close', callback)
}

function download_video(url, display_url, url_filename, display_url_filename, callback) {
        options = {
            url: url
        }
        console.log("Starting download of video");
        request(options).pipe(fs.createWriteStream(url_filename)).on('close', function() {
            console.log("Finished download of video");
            console.log("Starting download of thumbnail");
            request({url: display_url}).pipe(fs.createWriteStream(display_url_filename)).on('close', function() {
                console.log("Finished download of thumbnail");
                callback()
            });    
        });

}

module.exports = {
    get_random_photo: get_random_photo,
    get_random_video: get_random_video,
    download_photo: download_photo,
    download_video: download_video
};
