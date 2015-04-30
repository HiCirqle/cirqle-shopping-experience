var dataset = require('../modules/dataset');
var GATrack = require('../modules/track');
var cqjq = require('jquery');
var mockbutton = require('../modules/mockbutton');
var buttonCache = require('../modules/buttoncache');
var analytics = require('../modules/segmentio');
analytics.init('nfllvg24aq', window); // (id, window, disabled)
analytics.identity();
require('../modules/webPolyfill')(window);
var postImage = require('../modules/postImage');
var config = require('../modules/config');
var cirqleButton = require('../modules/shopbutton');
var browserHelper = require('../modules/browserHelper');
var attachHandler = browserHelper.attachHandler;
var _ = require('lodash');
var buttonSingleton;
var cq_config;
var position = require('../modules/position');
var repositionButton = require('../modules/position').repositionButton;

function buttonActivated(){
  dataset(document.getElementsByTagName("body")[0], "cpButtonActivated", true);
}

function setCirqleCss(scope, css){
  var s = scope.createElement('link');
  s.rel = "stylesheet";
  s.type = "text/css";
  s.href = css;
  s.id = "cirqlecss_"+config.get('blog_id');
  var head = scope.head || scope.getElementsByTagName('head')[0];
  head.appendChild(s);
}

class Button {
  constructor(){}

  cirqle_mockbutton(b_id){
    console.log('mockbutton');
    mockbutton(b_id);
  }

  embedButtonOnLoad(scope){
    try{
      buttonActivated();
      this.findImages(scope);

    }catch(e){
    }
  }

  findImages(scope){
    buttonSingleton.getTaggedImg().then(function(imgUrls){
      postImage.setScope(scope);
      var imgElmObjs = postImage.findImages(imgUrls);
      console.log(imgElmObjs);

      for(var j = imgElmObjs.length-1; j >=0; j--){
        var imgElm = imgElmObjs[j].element;
        var imgUrl = dataset(imgElm, "img") || imgElmObjs[j].url;
        if(imgElm && imgElm.nodeType && !dataset(imgElm, "cqUuid")){
          (function(imgElm, imgUrl){
            if(imgElm.height == 0 || imgElm.width == 0){
              cqjq("<img/>")
              .load(function() {
                // embeddShopButton(imgElm, imgUrl);
                cirqleButton.embedButton(imgElm, imgUrl);
              })
              .error(function() {})
              .attr("src", imgElm.src);
            }
            else{
              // embeddShopButton(imgElm, imgUrl);
              cirqleButton.embedButton(imgElm, imgUrl);
            }

          })(imgElm, imgUrl);
        }
      }
    });
  }

  cirqle_init (b_id, customConfig){
    var pathName = document.location.pathname;
    cq_config = customConfig || {};

    //overwirte showOnHover = false when on mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /Mobile/i.test(navigator.userAgent)) {
      cq_config = {showOnHover:false};
    }

    config.setBlogId(b_id); // set blog id to config module
    cirqleButton.setConfig({
      config:config,
      GATrack:GATrack,
      analytics:analytics,
      customConfig:cq_config,
      buttonSingleton:buttonCache
    }); // set blog id to config module
    cirqleButton.setScope(document);

    var blog_id = config.get('blog_id');
    var cirqle_getpost_by_url = config.get('cirqle_getpost_by_url');

    buttonSingleton =  buttonCache;
    buttonSingleton.init(cirqle_getpost_by_url);
    buttonSingleton.getTaggedImg();

    if(cq_config.buttonText && typeof cq_config.buttonText === "string"){
      config.set('buttonText', cq_config.buttonText);
    }

    // set up cirqle button environment. eg load css file
    var css_url = config.get('css_url')
    if(cq_config.customCss && typeof cq_config.customCss === "string" && _.includes(cq_config.customCss, "cdn.cirqle.nl")){
      css_url = cq_config.customCss;
    }
    setCirqleCss(document, css_url);

    // send tracking of blog view with cirqle button embedded
    analytics.track("blogView", {
      blogId: config.get('blog_id')
    });

    // iniitalize observer first, for element loaded after page is laoded
    var body = document.getElementsByTagName('body')[0];
    var id;

    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      var mutated = false;

      for(var i=0; i < mutations.length; i++) {
        var mutation = mutations[i];
        var addedNodes = mutation.addedNodes;
        var target = mutation.target;
        var type = mutation.type;

        for(var j=0; j < addedNodes.length; j++){
          if(!addedNodes[j].querySelectorAll) continue;
          var img = addedNodes[j].querySelectorAll('img');
          if(img.length > 0){
            mutated = true;
            break;
          }
        }

        try{
          var img = target.querySelectorAll('img');
          if(img.length > 0){
            mutated = true;
          }
        }catch(e){}

        if(mutated){
          break;
        }
      }

      if(mutated){
        clearTimeout(id);
        id = setTimeout(doneChanging, 1000);
      }
    });

    // configuration of the observer:
    var observerConfig = { attributes: true, childList: true, characterData: true, subtree: true };

    // pass in the target node, as well as the observer options
    observer.observe(body, observerConfig);

    function doneChanging(){
      repositionButton(buttonSingleton);
    }

    function iframelistener(event){
      if ( event.origin !== config.get('iframe_origin') ){
        return;
      }

      var message = event.data;
      try{
        message = JSON.parse(message);
      }catch(e){}
      if(message instanceof Object){
        if(message.action == 'productView'){
          analytics.track("productView", {
            blogId: config.get('blog_id'),
            postId: message.postId,
            productId: message.productId
          });
        }
        console.log(message);
        if(message.action == 'affiliateClick'){
          // GA
          if(message.blogDomain && message.productId && message.postUrl)
            GATrack.trackEvent('affiliateLink', 'click', message.blogDomain, {productId:message.productId, postUrl:message.postUrl})
        }

      }
    }

    attachHandler(window, "message", iframelistener);

    // Handle post that show up after on load. eg. lazy loading
    var DOMNodeInsertedListener = function(e) {
      var inserted = e.target;
      if(!inserted.querySelectorAll) return;
      var image = inserted.querySelectorAll('img');
      var iframe = inserted.querySelectorAll("iframe[src*='"+document.domain+"/post']");

      if(image.length > 0 || iframe.length > 0){
        //Handle post that show up on load
        this.embedButtonOnLoad(inserted);
      }
    };
    var bodyElm = document.getElementsByTagName("body")[0];
    attachHandler(bodyElm, "DOMNodeInserted", DOMNodeInsertedListener);

    var id;
    cqjq(window).resize(function() {
      // touch screen trigger resize, only fadeout when not device
      clearTimeout(id);
      id = setTimeout(doneResizing, 500);
    });

    function doneResizing(){
      repositionButton(buttonSingleton); // some theme doesn't fire mutation event on viewport change, we have to manually forse reposition upon resizing
    }

    // findPostImag
    this.embedButtonOnLoad(document);
  };
}

try{
  GATrack.blacklistUrl('www.elle.nl');
  GATrack.saveCustomGADomainPair({domainUrl:'www.lindanieuws.nl', ga:'UA-60685671-1'});
  GATrack.trackView();
}catch(e){}

module.exports = Button;
