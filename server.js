const express = require("express");
const app = express();
const redis = require("redis");
const url = require("url");
const fetch = require("node-fetch");
require('dotenv').config();

app.use(express.static(__dirname + "/public"));

const apiKey = process.env.DATAGOV_API_KEY;
const connectionString = process.env.COMPOSE_REDIS_URL;

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
  let college = `college/${query}`.trim().toLowerCase();
  client.get(college, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(data);
    } else {
      fetch(
        "https://api.data.gov/ed/collegescorecard/v1/schools?api_key=" +
          apiKey +
          "&school.name=" +
          query +
          "&fields=school.name,id,location.lon,location.lat&_per_page=100"
      )
        .then(res => res.json())
        .then(json => {
          console.log(json)
          client.setex(college, 300, JSON.stringify(json));
          res.send(json);
        })
        .catch(err => {
          console.error(err);
          resp.send(202);
        });
    }

  });
});
app.listen(9000);