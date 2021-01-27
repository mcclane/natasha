const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://localhost:27017/";

var db = undefined;
var collection = undefined;

function initializeMongoDB() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(mongoURL, function(err, client) {
            db = client.db("natasha");
            db.createCollection("clients", () => {
                console.log("Connected to MongoDB!");
                collection = db.collection("natasha");
                resolve();
            });
        });
    });
}

// insert a phone number and username, will remove any existing references to the username
function setInstagramUsername(phone, username) {
    return new Promise(function(resolve, reject) {
        phoneNumberExists(phone)
        .then((exists) => {
            if(exists) {
                collection.updateOne({phone: phone}, { $set: {username: username} }, function() {
                    resolve();
                });
   
            }
            else {
                collection.deleteOne({phone: phone}, function() {
                    collection.insert({phone: phone, username: username}, function() {
                        resolve();
                    });
                });
            }
        });
    });
    
}

function setInstagramPassword(phone, password) {
    return new Promise(function(resolve, reject) {
        phoneNumberExists(phone)
        .then((exists) => {
            if(exists) {
                collection.updateOne({phone: phone}, { $set: {password: password} }, function() {
                    resolve();
                });
            }
            else {
                collection.deleteOne({phone: phone}, function() {
                    collection.insert({phone: phone, password: password}, function() {
                        resolve();
                    });
                });
            }
        });
    });
}

// for getting instagram account information from phone number
function getInstagramCredentials(phone) {
    return new Promise(function(resolve, reject) {
        collection.findOne({phone: phone}, function(err, result) {
            resolve(result);
        });
    });
}

// check if the phone number is already in the database
function phoneNumberExists(phone) {
    return new Promise(function(resolve, reject) {
        collection.find({phone: phone}).toArray(function(err, result) {
            resolve(result.length > 0);
        });
    });
}

function validate(from, success_callback, no_password_callback, no_exist_callback) {
    // check if the number is in the database, and if we need password
    getInstagramCredentials(from)
        .then(result => {
            console.log("Result: "+JSON.stringify(result));
            if('username' in result && 'password' in result) {
                success_callback();
            }
            else if('username' in result) {
                no_password_callback();
            }
            else {
                failure_callback();
            }
        });
}

module.exports = {
    initializeMongoDB: initializeMongoDB,
    setInstagramUsername: setInstagramUsername,
    setInstagramPassword: setInstagramPassword,
    getInstagramCredentials: getInstagramCredentials,
    phoneNumberExists: phoneNumberExists,
    validate: validate
}
