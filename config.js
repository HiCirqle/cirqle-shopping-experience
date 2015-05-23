var config = {
  "production":{
      "apiHost": "http://dashboardapi.cirqle.nl",
      "cdnHost": "http://cdn.cirqle.nl",
      "iframeSrcUrl": "/experience2/iframecontent.html"
  },
  "staging":{
      "apiHost": "http://dashboardapi-staging.cirqle.nl",
      "cdnHost": "http://cdn.cirqle.nl",
      "iframeSrcUrl": "/experience2/iframecontent.html"
  },
  "development":{
      "apiHost": "http://localhost:9000",
      "cdnHost": "http://localhost:8888",
      "iframeSrcUrl": "/iframecontent.html"
  }
}

module.exports = config;
