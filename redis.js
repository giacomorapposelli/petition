// const redis = require("redis");

// const client = redis.createClient(
//     process.env.REDIS_URL || { host: "localhost", port: 6379 }
// );

// client.on("error", function (err) {
//     console.log(err);
// });

// client.set("favorite_candy", "fuzzy_peaches", (err, data) => {
//     console.log("log in set favorite candy", err, data);
// });

// client.get("favorite_candy", (err, data) => {
//     console.log("get favorite candy: ", err, data);
// });

// client.del("favorite_candy", (err, data) => {
//     console.log("log in delete favorite candy: ", err, data);
// });

// client.get("favorite_candy", (err, data) => {
//     console.log("log in get after deleting favorite_candy: ", err, data);
// });

// const { promisify } = require("util");

// module.exports.set = promisify(client.set).bind(client);
// module.exports.get = promisify(client.get).bind(client);
// module.exports.setex = promisify(client.setex).bind(client);
// module.exports.del = promisify(client.del).bind(client);
