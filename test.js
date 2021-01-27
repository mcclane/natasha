const request = require('request');

function get_random_photo(account, callback) {
    request.get("https://www.instagram.com/mcclanehowland/", (err, res, body) => {
        data = JSON.parse(/<script\s+type="text\/javascript">window\._sharedData\s+=\s+(\{.*?\});/.exec(body)[1]);
        images = [];
        data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.forEach(i => {
            image = i.node.dimensions;
            image.url = i.node.display_url;
            images.push(image);
        });
        callback(images[Math.round(Math.random()*images.length)]);
    });
}
get_random_photo(function() {
    console.log("Done!");
});
