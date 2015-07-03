var config = {
  "production":{
      "apiHost": "//dashboardapi.cirqle.nl",
      "cdnHost": "//cdn.cirqle.nl",
      "iframeSrcUrl": "/shopwindow/iframecontent.html"
  },
  "staging":{
      "apiHost": "//dashboardapi-staging.cirqle.nl",
      "cdnHost": "//cdn.cirqle.nl",
      "iframeSrcUrl": "/shopwindow/iframecontent.html"
  },
  "development":{
      "apiHost": "//localhost:9000",
      "cdnHost": "//localhost:8888",
      "iframeSrcUrl": "/iframecontent.html"
  }
}

module.exports = config;
