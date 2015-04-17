module.exports = {
  'wordpress button e2e' : function (browser) {
    browser
      .url('http://localhost:8888/wordpress.html')
      .waitForElementVisible('body', 1000)
      .waitForElementPresent('img[class=mockimage]', 5000)
      .waitForElementVisible('div[class=cirqle-outer-button]', 900)
      .click('div[class=cirqle-outer-button]')
      .pause(900)
      .waitForElementVisible('div[id=cq-shopwindow]', 3000)
      .pause(3000)
      .end();
  }
};
