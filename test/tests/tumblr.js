module.exports = {
  'tumblr button e2e' : function (browser) {
    browser
      .url('http://localhost:8888/tumblr.html')
      .waitForElementVisible('body', 1000)
      .waitForElementPresent('img[class=mockimage]', 10000)
      .waitForElementVisible('div[class=cirqle-outer-button]', 10000)
      .click('div[class=cirqle-outer-button]')
      .pause(900)
      .waitForElementVisible('div[id=cq-shopwindow]', 10000)
      .pause(3000)

      // .waitForElementVisible('a[id=shopboxButton]', 20000)
      // .click('a[id=shopboxButton]')
      // .pause(900)
      // .waitForElementVisible('div[id=cq-shopwindow]', 10000)
      .end();
  }
};
