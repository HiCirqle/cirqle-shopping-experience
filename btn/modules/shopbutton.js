var cqjq = require('jquery');
var dataset = require('../modules/dataset');
var getNodePosition = require('../modules/nodePosition');
var highestZIndex = require('../modules/highestZIndex');
var Timer = require('../modules/Timer');
var browserHelper = require('../modules/browserHelper');
var attachHandler = browserHelper.attachHandler;
var detachHandler = browserHelper.detachHandler;
var isHidden = browserHelper.isHidden;
var getHeight = browserHelper.getHeight;
var getWidth = browserHelper.getWidth;
var shoppingExperience = require('../modules/shoppingExperience');
var showWindow = shoppingExperience.showWindow;
var toogleParentScrollY = shoppingExperience.toogleParentScrollY;
var tooglePurchaseDialog = shoppingExperience.tooglePurchaseDialog;
require('../modules/webPolyfill')(window);
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

function getPostImageInfo(imgurl){
  var defer = cqjq.Deferred();
  //caching here
  if(localStorage && localStorage.getItem(imgurl)){
    defer.resolve(JSON.parse(localStorage.getItem(imgurl)));
  }
  else{
    var url = thisModule.config.get('apiDomain') + "/api/1/posts/products?url="+imgurl+"&blogId="+thisModule.config.get('blog_id');
    cqjq.getJSON(url).then(function(data){
      if(localStorage){
        localStorage.setItem(imgurl,JSON.stringify(data));
      }
      defer.resolve(data);
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

function positionButtonRelative(imgNode, btnNode, button){
  btnNode.className = "cirqle-outer-button";
  cqjq(btnNode).hide(); // must hide it in order to get the computed dimension

  var offsetFromBottomRight = 15;
  var btnHeight = parseInt(cqjq(btnNode).css('height'));
  var btnWidth = parseInt(cqjq(btnNode).css('width'));
  cqjq(btnNode).show();

  var buttonTop = offsetFromBottomRight + btnHeight; // button height 32px/32px
  var buttonRight = offsetFromBottomRight; // button width 131px/66px

  btnNode.style.zIndex = "102";
  btnNode.style.position = "relative";
  btnNode.style.height = "0px";
  imgNode.parentNode.appendChild(btnNode); //append outer button

  button.style.position = "absolute";
  button.style.top = "-"+buttonTop+"px";
  button.style.right = buttonRight+"px";

  return btnNode;
}

function positionButtonAbsolute(imgNode, btnNode){
  btnNode.className = "cirqle-outer-button";
  cqjq(btnNode).hide(); // must hide it in order to get the computed dimension

  var offsetFromBottomRight = 15;
  var imgPos = getNodePosition(imgNode);
  var btnHeight = parseInt(cqjq(btnNode).css('height'));
  var btnWidth = parseInt(cqjq(btnNode).css('width'));
  cqjq(btnNode).show();

  //ipad and tablet shows desktop button
  var imgNodeHeight = imgNode.height || getHeight(imgNode);
  var imgNodeWidth = imgNode.width || getWidth(imgNode);
  var buttonTop = imgPos[0] + parseFloat(imgNodeHeight) - offsetFromBottomRight - btnHeight; // button height 32px/32px
  var buttonLeft = imgPos[1] + parseFloat(imgNodeWidth) - offsetFromBottomRight - btnWidth; // button width 131px/66px

  var current = parseInt(cqjq(btnNode).css("z-index"), 10);
  var zIndex = highestZIndex(0, btnNode)+100;
  // console.log(btnNode);
  // console.log(zIndex);
  // console.log(current);
  btnNode.style.zIndex = zIndex;
  // if(isNaN(current)){
  // }

  btnNode.className = "cirqle-outer-button";
  btnNode.style.position = "absolute";
  btnNode.style.top = buttonTop+"px";
  btnNode.style.left = buttonLeft+"px";

  return btnNode;
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

  getPostImageInfo(imgUrl).then(function(data){
    if(data.length > 0){
      var imgObj = data[0];
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
            if(data.length > 0){
              var imgObj = data[0];
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

  attachHandler(button, "click", function(e) {
    try{
      thisModule.GATrack.trackShopButtonClick();
    }catch(e){}

    e.stopPropagation();

    var timer = new Timer();

    getPostImageInfo(imgUrl).then(function(data){
      if(data.length > 0){
        var imgObj = data[0];
        var trackTraits = {
          blogId: thisModule.config.get('blog_id'),
          postId: imgObj.postId,
          imageUrl: imgObj.url
        };
        // append iframe window here
        showWindow(imgObj, timer, trackTraits);
        // hide parent page scrollbar
        toogleParentScrollY();
        //show positioned iframe
        tooglePurchaseDialog(timer, trackTraits);
        // track clicked rate through segment IO
        analytics.track("shopbuttonClicked", trackTraits);
      }
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
          if(data.length > 0){
            var imgObj = data[0];
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

        // save button for repositioning when viewport changed
  var imgPos = getNodePosition(el);
  el.absoluteTop = imgPos[0];
  el.absoluteLeft = imgPos[1];
  el.previousHeight = el.height;
  el.previousWidth = el.width;
  thisModule.buttonSingleton.saveButton({img:el, btn:button, uuid:uuid});

  if(isHidden(el)){
    cqjq(button).hide();
  }

  try{
    if(!isButtonLoaded){
      thisModule.GATrack.trackPageViewWithButtonLoaded();
      isButtonLoaded = true;
    }
    thisModule.GATrack.trackShopButtonShow();
  }catch(e){}
}

module.exports = {
  setConfig:setConfig,
  setScope:setScope,
  embedButton:embedButton
}
