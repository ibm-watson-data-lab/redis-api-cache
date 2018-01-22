const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const redis = require("redis");
const morgan = require("morgan");
const url = require("url");
const fetch = require("node-fetch");

app.use(express.static(__dirname));

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

const apiKey = process.env.API_KEY;

let connectionString = process.env.COMPOSE_REDIS_URL;

if (connectionString === undefined) {
  console.error("Please set the COMPOSE_REDIS_URL environment variable");
  process.exit(1);
}

let client = null;

if (connectionString.startsWith("rediss://")) {
  client = redis.createClient(connectionString, {
    tls: { servername: new URL(connectionString).hostname }
  });
} else {
  client = redis.createClient(connectionString);
}

app.get('/api/colleges', (req, res) => {
  let query = req.query.college;
  let college = `college/${query}`.trim();
  client.get(college, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(data);
    } else {
      console.log("Cache missed for " + query);
      fetch(
        "https://api.data.gov/ed/collegescorecard/v1/schools?api_key=" +
          apiKey +
          "&school.name=" +
          query +
          "&fields=school.name,id,location.lon,location.lat&per_page=100"
      )
        .then(res => res.json())
        .then(json => {
          console.log(json)
          client.set(college, JSON.stringify(json));
          //client.setex(college, 300, JSON.stringify(json));
          res.send(json);
        })
        .catch(err => {
          console.error(err);
          resp.send(500);
        });
    }

  });
});
app.listen(9000);