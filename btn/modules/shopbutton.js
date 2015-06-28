var cqjq = require('jquery');
var dataset = require('dataset');
var position = require('position');
var positionButtonAbsolute = position.positionButtonAbsolute;
var positionButtonRelative = position.positionButtonRelative;
var getNodePosition = require('nodePosition');
var highestZIndex = require('highestZIndex');
var Timer = require('Timer');
var browserHelper = require('browserHelper');
var attachHandler = browserHelper.attachHandler;
var detachHandler = browserHelper.detachHandler;
var isHidden = browserHelper.isHidden;
var isCovered = browserHelper.isCovered;
var getHeight = browserHelper.getHeight;
var getWidth = browserHelper.getWidth;
var shoppingExperience = require('shoppingExperience');
var showWindow = shoppingExperience.showWindow;
var toogleParentScrollY = shoppingExperience.toogleParentScrollY;
var tooglePurchaseDialog = shoppingExperience.tooglePurchaseDialog;
require('webPolyfill')(window);
var scope = document;
var thisModule = {};

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
})();

function setConfig(config){
  Object.keys(config).forEach(function(key){
    thisModule[key] = config[key];
  });

  shoppingExperience.setBlogId(thisModule.config.get('blog_id'));
}

function setScope(sc){
  scope = sc;
}

function isExpired(item){
  var limit = 600000; // 10 minutes = 600000 miliseconds;
  /*var limit = 5000; // 5 seconds = 5000 miliseconds;*/
  var now = new Date().getTime();
  var diff = (item && item.timestamp) ? now - item.timestamp : null;
  console.log(typeof item)
  console.log(item && item.timestamp)
  return (!item || diff === null || diff > limit);
}

function getPostImageInfo(imgurl){
  var defer = cqjq.Deferred();
  var item = JSON.parse(localStorage.getItem(imgurl));
  var isItemExpired = isExpired(item);
  /*console.log(item, isItemExpired);*/
  //caching here
  if(localStorage && item && !isItemExpired){
    console.log('getPostImageInfo - local', imgurl);
    defer.resolve(item);
  }
  else{
    var url = thisModule.config.get('apiDomain') + "/api/1/posts/products?url="+imgurl+"&blogId="+thisModule.config.get('blog_id');
    cqjq.getJSON(url).then(function(data){
      /*console.log(url, data);*/
      if(localStorage && data.length > 0){
        localStorage.removeItem(imgurl);
        data[0]['timestamp'] = new Date().getTime();
        console.log('getPostImageInfo - api', imgurl);
        localStorage.setItem(imgurl,JSON.stringify(data[0]));
      }
      else{
        data.push({url:imgurl})
      }
      defer.resolve(data[0]);
    });
  }
  return defer;
}
/*imgIdentifyMethods.page = true*/

function createButton(imgNode, uuid){
  var button = document.createElement('div');
  button.className = "cirqle-btn";
  // button.dataset.uuid = uuid;
  // imgNode.dataset.cqUuid = uuid;
  dataset(button, "uuid", uuid);
  dataset(imgNode, "cqUuid", uuid);

  var icon = document.createElement('div');
  icon.className = "cirqle-btn-icon";
  icon.innerHTML = '<svg height="32" id="shopping-cart" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path d=" M0 4 L5 4 L6 8 L30 8 L28 22 L6 22 L3.5 6 L0 6z M10 24 A3 3 0 0 0 10 30 A3 3 0 0 0 10 24 M24 24 A3 3 0 0 0 24 30 A3 3 0 0 0 24 24 "></path></svg>';

  var text = document.createElement('div');
  text.className = "cirqle-btn-copy";
  text.innerHTML = thisModule.config.get('buttonText');

  button.appendChild(icon);
  button.appendChild(text);

  return button;
}

function embedButtonAbsolute(imgNode, uuid, ifrmScope){
  var button = createButton(imgNode, uuid);

  var outerButton = document.createElement('div');

  outerButton.appendChild(button);
  if(ifrmScope){
    ifrmScope.getElementsByTagName("body")[0].appendChild(outerButton);
    outerButton = positionButtonRelative(imgNode, outerButton, button);
  }else{
    document.getElementsByTagName("body")[0].appendChild(outerButton);
    outerButton = positionButtonAbsolute(imgNode, outerButton);
  }
  // outerButton.dataset.uuid = uuid;
  dataset(outerButton, "uuid", uuid);

  return outerButton;
}

function embedButton(imgNode, imgUrl, ifrmScope){
  if(dataset(imgNode, "postId")) return; // shop button has been embedded

  var el = imgNode;
  var uuid = guid();

  var imgHover = el;

  var button = embedButtonAbsolute(imgNode, uuid, ifrmScope);

  if(parseInt(cqjq(button).css('width')) > imgNode.width){
      try {
          button.parentNode.removeChild(button);
      }
      catch(err) {}
      return;
  }
  /*console.log(imgNode);*/
  getPostImageInfo(imgUrl).then(function(data){
    if(data){
      if(!data.postId) data.postId = 0;
      var imgObj = data;
      dataset(imgNode, "postId", imgObj.postId);
    }
  });

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // some code..
  }
  else{
    // button on hidden
    if(thisModule.customConfig.showOnHover && thisModule.customConfig.showOnHover === true){button.style.visibility = "hidden";}

    (function(){
      if(thisModule.customConfig.showOnHover && thisModule.customConfig.showOnHover === true){
        attachHandler(button, "mouseenter", function(e) {
          button.style.visibility = "visible";
        });

        attachHandler(button, "mouseleave", function(e) {
          button.style.visibility = "hidden";
        });
      }

      var timer = new Timer();
      attachHandler(imgHover, "mouseenter", function(e) {
        timer.start();
        if(thisModule.customConfig.showOnHover && thisModule.customConfig.showOnHover === true){button.style.visibility = "visible";}
      });

      attachHandler(imgHover, "mouseleave", function(e) {
        timer.end(function(duration){
          getPostImageInfo(imgUrl).then(function(data){
            if(data){
              if(!data.postId) data.postId = 0;
              var imgObj = data;
              var trackTraits = {
                blogId: thisModule.config.get('blog_id'),
                postId: imgObj.postId,
                imageUrl: imgObj.url
              };
              var traits = cqjq.extend({}, trackTraits, {duration: duration});
              analytics.track("postImageHover", traits);
            }
          });
        });
        if(thisModule.customConfig.showOnHover && thisModule.customConfig.showOnHover === true){button.style.visibility = "hidden";}
      });

    })()
  };

  setButtonClickEvent(button, imgUrl);

        // save button for repositioning when viewport changed
  var imgPos = getNodePosition(el);
  el.absoluteTop = imgPos[0];
  el.absoluteLeft = imgPos[1];
  el.previousHeight = el.height;
  el.previousWidth = el.width;
  thisModule.buttonSingleton.saveButton({img:el, btn:button, uuid:uuid});
  // var isButtonCovered =  isCovered(el);
  var isImageHidden =  isHidden(el);
  // console.log(isImageHidden, isButtonCovered);
  if(isImageHidden){
    cqjq(button).hide();
  }

  try{
    if(!thisModule.config.get('isButtonLoaded')){
      thisModule.GATrack.trackPageViewWithButtonLoaded();
      thisModule.config.set('isButtonLoaded', true);
    }
    thisModule.GATrack.trackShopButtonShow();
  }catch(e){}
}

function setButtonClickEvent(button, imgUrl, options){
  attachHandler(button, "click", function(e) {
    /*console.log(options);*/
    // option only applicable to shopbox
    try{
      if(options && options.category && options.action && options.label && options.property){
        thisModule.GATrack.trackEvent(options.category, options.action, options.label, options.property);
      }
      thisModule.GATrack.trackShopButtonClick();
    }catch(e){}

    e.stopPropagation();

    var timer = new Timer();
    getPostImageInfo(imgUrl).then(function(data){
      var imgObj, trackTraits;
      if(data){
        if(!data.postId) data.postId = 0;
        imgObj = data;
        trackTraits = {
          blogId: thisModule.config.get('blog_id'),
          postId: imgObj.postId,
          imageUrl: imgObj.url
        };
      }
      // append iframe window here
      showWindow(imgObj, timer, trackTraits);
      // hide parent page scrollbar
      toogleParentScrollY();
      //show positioned iframe
      tooglePurchaseDialog(timer, trackTraits);
      // track clicked rate through segment IO
      analytics.track("shopbuttonClicked", trackTraits);
    });

    function closeiframelistener(event){
      console.log(event);
      console.log(event.origin, thisModule.config.get('iframe_origin'));
      if ( event.origin !== thisModule.config.get('iframe_origin') ){
        return;
      }

      var message = event.data;

      if(message == "cqCloseShopWindow"){
        getPostImageInfo(imgUrl).then(function(data){
          if(data){
            if(!data.postId) data.postId = 0;
            var imgObj = data;
            var trackTraits = {
              blogId: thisModule.config.get('blog_id'),
              postId: imgObj.postId,
              imageUrl: imgObj.url
            };
            //close positioned iframe
            tooglePurchaseDialog(timer, trackTraits);
            toogleParentScrollY();
          }
        })

        //remove this event listener
        detachHandler(window, "message", closeiframelistener);
      };
    }

    attachHandler(window, "message", closeiframelistener);

    // stop event bubbling to prevent fire of outer link
    if (!e) var e = window.event;
    e.cancelBubble = true;
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    return false;

  }, true); // set true for even capturing instead of bubbling
}

module.exports = {
  setConfig:setConfig,
  setScope:setScope,
  embedButton:embedButton,
  getPostImageInfo:getPostImageInfo,
  setButtonClickEvent:setButtonClickEvent
}
