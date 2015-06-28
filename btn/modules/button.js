var dataset = require('dataset');
var GATrack = require('track');
var cqjq = require('jquery');
var mockbutton = require('mockbutton');
var buttonCache = require('buttoncache');
var analytics = require('segmentio');
analytics.init('nfllvg24aq', window); // (id, window, disabled)
analytics.identity();
require('webPolyfill')(window);
var postImage = require('postImage');
var config = require('config');
var shopbutton = require('shopbutton');
var shopbox = require('shopbox');
var browserHelper = require('browserHelper');
var attachHandler = browserHelper.attachHandler;
var _random = require('lodash/number/random');
var buttonSingleton;
var cq_config;
var position = require('position');
var repositionButton = require('position').repositionButton;

function buttonActivated(){
  dataset(document.getElementsByTagName("body")[0], "cpButtonActivated", true);
}

// include method that we want to pass on by inheritance in the class button
class Button {
  constructor(){}

  embedButton(imgElm, imgUrl){
    shopbutton.embedButton(imgElm, imgUrl);
  }

  setCirqleCss(scope, css){
    var s = scope.createElement('link');
    s.rel = "stylesheet";
    s.type = "text/css";
    s.href = css;
    s.id = "cirqlecss_"+config.get('blog_id');
    var head = scope.head || scope.getElementsByTagName('head')[0];
    head.appendChild(s);
  }

  cirqle_mockbutton(b_id){
    mockbutton(b_id, 2);
  }

  embedButtonOnLoad(scope){
    try{
      buttonActivated();
      // find on document at the fastest speed possible
      this.findImages(scope);
      // find on document one more time on DOMContentLoaded
      attachHandler(scope, 'DOMContentLoaded', () => {
        console.log('find on document one more time on DOMContentLoaded');
        this.findImages(scope);
      });

      attachHandler(window, 'load', () => {
        console.log('find on document one more time on window load');
        this.findImages(scope);
      });

    }catch(e){
    }
  }

  findPostImages(imgUrls, scope){
    postImage.setScope(scope);
    return postImage.findImages(imgUrls);
  }

  findImages(scope){
    var self = this;
    buttonSingleton.getTaggedImg().then(function(imgUrls){
      // postImage.setScope(scope);
      // var imgElmObjs = postImage.findImages(imgUrls);
      var imgElmObjs = self.findPostImages(imgUrls, scope);

      for(var j = imgElmObjs.length-1; j >=0; j--){
        var imgElm = imgElmObjs[j].element;
        var imgUrl = dataset(imgElm, "img") || imgElmObjs[j].url;
        if(imgElm && imgElm.nodeType && !dataset(imgElm, "cqUuid")){
          (function(imgElm, imgUrl){
            if(imgElm.height == 0 || imgElm.width == 0){
              cqjq("<img/>")
              .load(function() {
                self.embedButton(imgElm, imgUrl);
              })
              .error(function() {})
              .attr("src", imgElm.src);
            }
            else{
              self.embedButton(imgElm, imgUrl);
            }

          })(imgElm, imgUrl);
        }
      }
    });
  }

  cirqle_init (b_id, customConfig){
    var pathName = document.location.pathname;
    cq_config = customConfig || {};
    /*console.log(customConfig);*/

    //overwirte showOnHover = false when on mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /Mobile/i.test(navigator.userAgent)) {
      cq_config['showOnHover'] = false;
    }

    config.setBlogId(b_id); // set blog id to config module
    var configBundle = {
      config:config,
      GATrack:GATrack,
      analytics:analytics,
      customConfig:cq_config,
      buttonSingleton:buttonCache
    };
    shopbutton.setConfig(configBundle);
    shopbox.setConfig(configBundle);

    shopbutton.setScope(document);

    var blog_id = config.get('blog_id');
    var cirqle_getpost_by_url = config.get('cirqle_getpost_by_url');

    buttonCache.init(cirqle_getpost_by_url);
    buttonSingleton = buttonCache;

    function shopboxInit(imgUrls){
      var rand = _random(0, imgUrls.length-1);
      var imgUrl = imgUrls[rand];
      shopbutton.getPostImageInfo(imgUrl).then(function(img){
        //embed post or product
        console.log(img);
        var productIds = img.productIds || [];
        // randomly select product and get product info from SOLR
        rand = _random(0, productIds.length-1);
        // show the shopbox
        shopbox.embedProduct(productIds[rand]).then((button)=>{
          if(!button) return shopboxInit(imgUrls);
          shopbutton.setButtonClickEvent(button, imgUrl, {
            category:'showbox',
            action:'click',
            label:document.domain,
            property:{productId:productIds[rand], postUrl:window.location.href}
          });
        });
      });
    };

    buttonSingleton.getTaggedImg().then(function(imgUrls){
      if(typeof cq_config.shopbox !== 'undefined' && cq_config.shopbox === false) return;
      // if(imgUrls && imgUrls.length > 0) shopboxInit(imgUrls);
    });

    if(cq_config.buttonText && typeof cq_config.buttonText === "string"){
      config.set('buttonText', cq_config.buttonText);
    }

    // set up cirqle button environment. eg load css file
    var css_url = config.get('css_url')
    if(cq_config.customCss &&
      typeof cq_config.customCss === "string"
      // && _includes(cq_config.customCss, "cdn.cirqle.nl")
      ){
      css_url = cq_config.customCss;
    }

    this.setCirqleCss(document, css_url);

    var shopbox_css_url = config.get('shopbox_css_url')
    this.setCirqleCss(document, shopbox_css_url);

    // send tracking of blog view with cirqle button embedded
    analytics.track("blogView", {
      blogId: config.get('blog_id')
    });

    // iniitalize observer first, for element loaded after page is laoded
    var body = document.getElementsByTagName('body')[0];
    var id;

    console.log('MutationObserver', MutationObserver)
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
            console.log('added img');
            mutated = true;
            break;
          }
        }

        try{
          var img = target.querySelectorAll('img');
          if(img.length > 0){
            console.log('img change');
            /*buttonSingleton.getTaggedImg().then(function(data){
              img.map(function(i){
                  if(data.indexOf(i.src) > -1){
                    console.log(i.src)
                    clearTimeout(id);
                    id = setTimeout(doneChanging, 1000);
                  }
              });
            });*/
            mutated = true;
          }
        }catch(e){}

        if(mutated){
          break;
        }
      }
      if(mutated){
        console.log('mutation', mutated);
        clearTimeout(id);
        id = setTimeout(doneChanging, 200);
      }
    });

    // configuration of the observer:
    var observerConfig = { attributes: true, childList: true, characterData: true, subtree: true };

    // pass in the target node, as well as the observer options
    observer.observe(body, observerConfig);

    function doneChanging(){
      console.log('doneChanging')
      // adjustZIndex for button for when there's changes to the layout
      var adjustZIndex = true;
      repositionButton(buttonSingleton, adjustZIndex);
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
            GATrack.trackEvent('affiliateLink', 'click', message.blogDomain, {productId:message.productId, postUrl:message.postUrl});
        }

      }
    }

    attachHandler(window, "message", iframelistener);

    var self = this;
    // Handle post that show up after on load. eg. lazy loading
    var DOMNodeInsertedListener = function(e) {
      var inserted = e.target;
      if(!inserted.querySelectorAll) return;
      var image = inserted.querySelectorAll('img');
      var iframe = inserted.querySelectorAll("iframe[src*='"+document.domain+"/post']");

      if(image.length > 0 || iframe.length > 0){
        //Handle post that show up on load
        self.embedButtonOnLoad(inserted);
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
