# College Search Application

A small application that demonstrates how to use IBM Compose for Redis as a cache for College Scorecard API queries. The application queries the API for college names, then shows the college name and their location on a map using Mapbox.

## Prerequisites

1. Node.js - the application uses the [Express framework](https://expressjs.com/), so you'll need [Node.js](https://nodejs.org/en/) installed. Node.js also comes with the npm package manager to install Express and the other libraries the application uses.
2. IBM Cloud - [Sign up for a free IBM Cloud account](https://www.ibm.com/cloud/). This will allow you to provision an IBM Compose for Redis database.
3. Data.Gov API KEY - You can get an API key to use with all of the APIs from Data.Gov. Just [sign up](https://api.data.gov/signup/) for a key using your email, and a key will be sent to you. Then we can use it when making HTTP requests to the College Scorecard API.
4. IBM Compose for Redis - Redis is used to store the user query and response data from the College Scorecard API. The database uses the "cache mode", which you'll have to contact IBM Cloud Support to turn on once you've provisioned the database. Cache mode disables the database from auto-scaling, and therefore relies on Redis to evict items from memory.
5. Mapbox - You will need a Mapbox access token. [Sign up](https://www.mapbox.com/) for a Mapbox account then create your own access token.

### Getting the IBM Compose for Redis connection URI

Once you're in IBM Cloud, just click on **Create Resource** and look for Compose for Redis. Click on it to get into the service page, then click on **Create** to create the database.

That will take you to your Compose for Redis management page. You'll see your Redis connection string URI within the _Connection Strings_ panel.

![ibm compose redis screenshot](/screenshots/redis.png)

### Setting Environment Variables

Create a file called `.env` to store environment variables. A template for that file is `.env.template` in this repository. Copy the contents of the `.env.template` file into `.env`.

```shell
COMPOSE_REDIS_URL=redis://admin:<password>@sl-us-south-1-portal.20.dblayer.com:33282
DATAGOV_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
```

Then set `COMPOSE_REDIS_URL` to your IBM Compose for Redis URI and `DATAGOV_API_KEY` to the Data.Gov API key that was emailed to you.

Both of these variables are used inside the `server.js` file as:

```javascript
const apiKey = process.env.DATAGOV_API_KEY;
const connectionString = process.env.COMPOSE_REDIS_URL;
```

Next, within the `map.js` file, in the `public/js/` folder, substitute the Mapbox access token with your own:

```javascript
mapboxgl.accessToken = "pk.eyJ1IjoiYWFsZ2VyIiwiYSI6ImNqMzB2OGJlbjAwMW8zM2s4cWVsY3IybWIifQ.9qDiHbV9N5ezaQ8czC9gew";
```

_This access token only serves as an example._

## Running the College Search Application

Install the Node.js packages included in `package.json`:

```shell
npm install
```

Run the application

```shell
npm start
```

In your preferred browser, type in `localhost:9000` to interact with the application.
