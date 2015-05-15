var config = {
  "production":{
      "apiHost": "http://dashboardapi.cirqle.nl",
      "cdnHost": "http://cdn.cirqle.nl"
  },
  "staging":{
      "apiHost": "http://dashboardapi-staging.cirqle.nl",
      "cdnHost": "http://cdn.cirqle.nl"
  },
  "development":{
      "apiHost": "http://localhost:9000",
      "cdnHost": "http://localhost:8888"
  }
}

module.exports = config;
