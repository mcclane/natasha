const instagramClient = require('instagram-private-api').V1;

function restoreInstagramSession(credentials) {
    return new Promise((resolve, reject) => {
        try {
            let device = new instagramClient.Device(credentials.username);
            let storage = new instagramClient.CookieFileStorage(__dirname + '/cookies/'+credentials.username+'.json');
            resolve(new instagramClient.Session.create(device, storage, credentials.username, credentials.password));
        } catch(error) {
            reject("Something went wrong trying to log in, sorry!");
        }
    });
}

function upload_photo(credentials, filename, caption, callback) {
    restoreInstagramSession(credentials)
        .then(function(session) {
            instagramClient.Upload.photo(session, filename)
                .then(function(upload) {
                    console.log(upload.params.uploadId);
                    return instagramClient.Media.configurePhoto(session, upload.params.uploadId, caption);
                })
                .then(function(medium) {
                    console.log(medium);
                })
                .then(callback);
        });
}

function upload_video(credentials, filename, thumbnail_filename, caption, callback) {
    restoreInstagramSession(credentials)
        .then(function(session) {
                instagramClient.Upload.video(session, filename, thumbnail_filename)
                    .then(function(upload) {
                        return instagramClient.Media.configureVideo(session, upload.uploadId, caption, upload.durationms);
                    })
                    .then(function(medium) {
                        // we configure medium, it is now visible with caption
                        console.log(medium.params)
                    })
                    .then(callback);
        });
}

module.exports = {
    restoreInstagramSession: restoreInstagramSession,
    upload_photo: upload_photo,
    upload_video: upload_video
};
