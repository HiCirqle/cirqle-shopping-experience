var _ = require('lodash');
var gaTrackingCode = 'UA-60330716-1';
var domainName = window.location.host;
var path = window.location.pathname;
var blacklist = [];
var GADomainPair = [];
require('webPolyfill')(window);

var dimensions = {
  postUrl:"dimension1",
  productId:"dimension2"
};


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','__cqgaTracker');

function saveCustomGADomainPair(pair){
  if(pair.ga && pair.domainUrl)
    GADomainPair[pair.domainUrl] = pair.ga;
}

function blacklistUrl(url){
  blacklist.push(url);
}

function isBlackListed(){
  return _.indexOf(blacklist, domainName) > -1;
}

function trackView(){
  if(isBlackListed()) return;

  if(GADomainPair[domainName]) gaTrackingCode = GADomainPair[domainName];

  __cqgaTracker('create', gaTrackingCode, 'auto', {'name': 'blogTracker'});
  __cqgaTracker('blogTracker.send', 'pageview', {
    'blogUrl': domainName,
    'path': path,
    'useBeacon': true,
    'hitCallback': function() {
      // console.log('pageview');
    }
  });
}

function trackPageViewWithButtonLoaded(){
  if(isBlackListed()) return;
  var category = 'shopButton';
  var action = 'pageviewed';
  var label = domainName;
  __cqgaTracker('blogTracker.send', 'event', category, action, label);
  // console.log("Page with button viewedd", label);
}

function trackShopButtonClick(){
  if(isBlackListed()) return;
  var category = 'shopButton';
  var action = 'click';
  var label = domainName;
  __cqgaTracker('blogTracker.send', 'event', category, action, label);
  console.log("Button clicked");
}

function trackShopButtonShow(){
  if(isBlackListed()) return;
  var category = 'shopButton';
  var action = 'show';
  var label = domainName;
  __cqgaTracker('blogTracker.send', 'event', category, action, label);
  console.log("Button shown");
}

function trackEvent(category, action, label, property){
  if(isBlackListed()) return;
  if(property instanceof Object){
    Object.keys(property).forEach(function(e){
      if(dimensions[e]){
        __cqgaTracker('blogTracker.set', dimensions[e], property[e]);
        console.log(dimensions[e], property[e]);
      }
    });
  }

  // ga('set', 'dimension1', dimensionValue);
  if(category, action, label)
    __cqgaTracker('blogTracker.send', 'event', category, action, label);

  // console.log("Event tracked", category, action, label, property);
}

module.exports = {
  saveCustomGADomainPair:saveCustomGADomainPair,
  blacklistUrl:blacklistUrl,
  trackView:trackView,
  trackShopButtonClick:trackShopButtonClick,
  trackShopButtonShow:trackShopButtonShow,
  trackPageViewWithButtonLoaded:trackPageViewWithButtonLoaded,
  trackEvent:trackEvent
}
