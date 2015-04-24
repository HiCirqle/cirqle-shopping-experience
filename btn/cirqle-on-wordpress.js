var dataset = require('./modules/dataset');
var GATrack = require('./modules/track');
var cqjq = require('jquery');
var mockbutton = require('./modules/mockbutton');
var buttonCache = require('./modules/buttoncache');
var analytics = require('./modules/segmentio');
analytics.init('nfllvg24aq', window); // (id, window, disabled)
analytics.identity();
require('./modules/webPolyfill')(window);
var postImage = require('./modules/postImage');
var config = require('./modules/config');
var cirqleButton = require('./modules/button');



// (function(){
  // var css_url = "http://cdn.cirqle.nl/button1/wordpress-buttonv1.0.0-black.css";
  var css_url = "http://cdn.cirqle.nl/button1/cirqle-style-general.css";
  var iframe_origin = "https://cdn.cirqle.nl"; // domain name of iframecontent.html
  // var iframe_src_url = iframe_origin+"/experience-test/iframecontent.html"; // test
  var iframe_src_url = iframe_origin+"/experience2/iframecontent.html"; //live
  var jquery_cdn = "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js";
  var web_component_cdn = "//cdn.cirqle.nl/polyfills/webcomponents.min.js";
  var maxPostCount =  15;
  var blogName = document.title;
  var blogDomain = window.location.host;
  // var apiDomain = "http://54.73.226.47:9090"; //test
  var apiDomain = "https://api.cirqle.nl:8443"; //live
  // var apiDomain = "http://54.217.202.215:8080"; //live
  var segmentIOSwitch = true;
  // var cqjq;
  var isButtonLoaded = false;
  var buttonText = "Shop this post";

  // setSegmentIo();

  try{
    GATrack.blacklistUrl('www.elle.nl');
    GATrack.saveCustomGADomainPair({domainUrl:'www.lindanieuws.nl', ga:'UA-60685671-1'});
    GATrack.trackView();
  }catch(e){}

  // if(typeof MutationObserver == 'undefined'){
  //   console.log('no MutationObserver');
  //   var theNewScript = document.createElement("script");
  //   theNewScript.type = "text/javascript";
  //   theNewScript.src = web_component_cdn;
  //   document.getElementsByTagName("head")[0].appendChild(theNewScript);
  // }

  // when jquery is ready, load data from API immediately
  // load jquery if not loaded
  // if(typeof jQuery == "undefined"){
  //   var theNewScript = document.createElement("script");
  //   theNewScript.onload = function(){}; // when jquery is ready
  //   theNewScript.type = "text/javascript";
  //   theNewScript.src = jquery_cdn;
  //   document.getElementsByTagName("head")[0].appendChild(theNewScript);
  // }
  // else{
  //   loadJqueryIfNotLoaded(function(){
  //     buttonSingleton.getTaggedImg();
  //   });
  // }

  function loadJqueryIfNotLoaded(cb){
    return cb();
    // jQuery MAY OR MAY NOT be loaded at this stage
    // var previous$;
    // if(typeof $ !== 'undefined'){
    //   previous$ = $;
    // }
    //
    // var jQueryInjected = false;
    //
    // var waitForLoad = function () {
    //   if (typeof jQuery != "undefined") {
    //     if(jQuery.fn.jquery != "1.11.1"){
    //       if(!jQueryInjected){
    //         var theNewScript = document.createElement("script");
    //         theNewScript.type = "text/javascript";
    //         theNewScript.src = jquery_cdn;
    //         document.getElementsByTagName("head")[0].appendChild(theNewScript);
    //         jQueryInjected = true;
    //       }
    //       window.setTimeout(waitForLoad, 50);
    //     }
    //     else{
    //       // do not overwrite any usage depending on $
    //       cqjq = jQuery.noConflict();
    //       $ = previous$;
    //       console.log(cqjq.fn.jquery);
    //       console.log($);
    //       cb();
    //     }
    //
    //   } else {
    //     window.setTimeout(waitForLoad, 50);
    //   }
    // };
    // window.setTimeout(waitForLoad, 50);
  }

  function webComponentReady(cb){
    return cb();
    // var waitForLoad = function () {
    //   if (typeof MutationObserver == 'undefined') {
    //     window.setTimeout(waitForLoad, 50);
    //   } else {
    //     cb();
    //   }
    // };
    // window.setTimeout(waitForLoad, 50);
  }

  // buttonSingleton = (function(){
  //   var btns = [];
  //   var taggedImgs;
  //   var requesting = false;
  //   var requestPromise;
  //
  //   function saveButton(btn){
  //     btns.push(btn);
  //   }
  //
  //   function getAllButtons(){
  //     return btns;
  //   }
  //
  //   function getTaggedImg(){
  //     requesting = true;
  //     return getTaggedImgFromApi().then(function(data){
  //       requesting = false;
  //       return data;
  //     });
  //   }
  //
  //   return {
  //     getTaggedImg:function(){
  //       if(taggedImgs){
  //         var defer = jQuery.Deferred();
  //         return defer.resolve(taggedImgs);
  //       }
  //
  //       if(!requesting){
  //         requestPromise = getTaggedImg().then(function(data){
  //           taggedImgs = data;
  //           return taggedImgs;
  //         })
  //       }
  //       return requestPromise;
  //     },
  //     saveButton:saveButton,
  //     getAllButtons:getAllButtons
  //   };
  //
  // })();

  // buttonSingleton.getTaggedImg();


  function buttonActivated(){
    dataset(document.getElementsByTagName("body")[0], "cpButtonActivated", true);
  }

  this.cirqle_mockbutton = function(b_id){
    console.log('mockbutton');
    mockbutton(b_id);
  }

  this.cirqle_init = function(b_id, customConfig){
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
      analytics:analytics
    }); // set blog id to config module
    cirqleButton.setScope(document);

    var blog_id = config.getSetting('blog_id');
    var cirqle_getpost_by_url = config.getSetting('cirqle_getpost_by_url');

    buttonSingleton =  buttonCache;
    buttonSingleton.init(cirqle_getpost_by_url);
    buttonSingleton.getTaggedImg();

    loadJqueryIfNotLoaded(function(){

      if(cq_config.buttonText && typeof cq_config.buttonText === "string"){
        buttonText = cq_config.buttonText;
      }

      // set up cirqle button environment. eg load css file, segment io setting
      if(cq_config.customCss && typeof cq_config.customCss === "string" && cq_config.customCss.indexOf("cdn.cirqle.nl") > -1){
        css_url = cq_config.customCss;
      }
      setCirqleCss(document, css_url);

      // segment IO identify user, anonymous in this case
      // window.onload = function(){
      //   identity();
      // };

      // send tracking of blog view with cirqle button embedded
      analytics.track("blogView", {
        blogId: config.getSetting('blog_id')
      });

      // iniitalize observer first, for element loaded after page is laoded
      var body = document.getElementsByTagName('body')[0];
      var id;

      webComponentReady(function(){
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
      });

      function doneChanging(){
        repositionButton();
      }

      function iframelistener(event){
        if ( event.origin !== iframe_origin ){
          return;
        }

        var message = event.data;
        try{
          message = JSON.parse(message);
        }catch(e){}
        if(message instanceof Object){
          if(message.action == 'productView'){
            analytics.track("productView", {
              blogId: config.getSetting('blog_id'),
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

      if (window.addEventListener){
        attachHandler(window, "message", iframelistener);
      } else {
        attachHandler(window, "onmessage", iframelistener);
      }

      // Handle post that show up after on load. eg. lazy loading
      document.getElementsByTagName("body")[0].addEventListener("DOMNodeInserted", function(e) {
        var inserted = e.target;
        if(!inserted.querySelectorAll) return;
        var image = inserted.querySelectorAll('img');
        var iframe = inserted.querySelectorAll("iframe[src*='"+document.domain+"/post']");

        if(image.length > 0 || iframe.length > 0){
          //Handle post that show up on load
          embedButtonOnLoad(inserted);
        }
      });

      var id;
      cqjq(window).resize(function() {
        // touch screen trigger resize, only fadeout when not device
        clearTimeout(id);
        id = setTimeout(doneResizing, 500);
      });

      function doneResizing(){
        repositionButton(); // some theme doesn't fire mutation event on viewport change, we have to manually forse reposition upon resizing
      }

      // findPostImage
      embedButtonOnLoad(document);
    });
  };

  function repositionButton(){
    var buttons = buttonSingleton.getAllButtons();
    if(buttons.length === 0){return;};

    for(var i=0; i < buttons.length; i++){
      btnObj = buttons[i];
      if(btnObj.btn.style.position == "relative"){
        continue; // exclude button posistioned by relative
      }
      else if(isHidden(btnObj.img)){
        cqjq(btnObj.btn).hide();
        continue;
      }
      else{
        // if(isMoved(btnObj.img) || isMoved(btnObj.btn)){
        positionButtonAbsolute(btnObj.img, btnObj.btn);
        // }
      }
    }
  }

  function isMoved(el){
    var offset = getNodePosition(el);
    return (Math.abs(offset[0] - el.absoluteTop) > 0) || (Math.abs(offset[1] - el.absoluteLeft) > 0) || (Math.abs(el.height - el.previousHeight) > 0) || (Math.abs(el.width - el.previousWidth) > 0);
  }

  // function setSegmentIo(){
  //   if(segmentIOSwitch){
  //     try{
  //       if(!window.analytics){
  //         window.analytics=window.analytics||[],window.analytics.methods=["identify","group","track","page","pageview","alias","ready","on","once","off","trackLink","trackForm","trackClick","trackSubmit"],window.analytics.factory=function(t){return function(){var a=Array.prototype.slice.call(arguments);return a.unshift(t),window.analytics.push(a),window.analytics}};for(var i=0;i<window.analytics.methods.length;i++){var key=window.analytics.methods[i];window.analytics[key]=window.analytics.factory(key)}window.analytics.load=function(t){if(!document.getElementById("analytics-js")){var a=document.createElement("script");a.type="text/javascript",a.id="analytics-js",a.async=!0,a.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.io/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n)}},window.analytics.SNIPPET_VERSION="2.0.9",
  //         window.analytics.load("nfllvg24aq");
  //       }
  //
  //     }catch(e){}
  //     // window.analytics.page();
  //   }
  // }
  //
  // function identity(){
  //   if(segmentIOSwitch){
  //     analytics.identify({
  //       integrations: {
  //         'All': false,
  //         'Webhooks': true
  //       }
  //     }, function(){
  //     });
  //   }
  // }
  //
  // function track(action, traits){
  //   if(segmentIOSwitch){
  //     analytics.track(action, traits, {
  //       integrations: {
  //         'All': false,
  //         'Webhooks': true
  //       }
  //     }, function(){
  //     });
  //   }
  // }

  function setCirqleCss(scope, css){
    var s = scope.createElement('link');
    s.rel = "stylesheet";
    s.type = "text/css";
    s.href = css;
    s.id = "cirqlecss_"+config.getSetting('blog_id');
    scope.head.appendChild(s);
  }

  // function getTaggedImgFromApi(){
  //   return cqjq.getJSON(cirqle_getpost_by_url);
  // }

  function embedButtonOnLoad(content){
    try{
      buttonActivated();
      findPostImage(content);

    }catch(e){
    }
  }

  function getBackgroundImageValue(e){
    if (e.currentStyle)
      backgroundImage = e.currentStyle['backgroundImage'];
    else if (window.getComputedStyle && e && e.nodeType)
      backgroundImage = window.getComputedStyle(e,null).getPropertyValue('background-image');
    else
      backgroundImage = "";
    return backgroundImage;
  }

  function findBackgroundImage(imgUrls){
    var all = document.querySelectorAll('body *');
    all = Object.keys(all).map(function (key) {return all[key]})
    return all.filter(function(e) {
      var backgroundImage = getBackgroundImageValue(e);

      var match = imgUrls.filter(function(e){
          return backgroundImage.indexOf(e) > -1;
        });
      if (match.length > 0) console.log(backgroundImage);
      return match.length > 0;
    });
  }

  /*imgIdentifyMethods.page = true*/
  function findPostImage(scope){
    console.log('finding post image ...');
    // var domain  = document.domain;
    // var postImagesNodeAndURL = [];
    //
    // var postImagewidth = 131;
    // var postImageheight = 32;
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    //   var postImagewidth = 66;
    //   var postImageheight = 32;
    // }
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
                embeddShopButton(imgElm, imgUrl);
                // cirqleButton.embedButton(imgElm, imgUrl);
              })
              .error(function() {})
              .attr("src", imgElm.src);
            }
            else{
              embeddShopButton(imgElm, imgUrl);
              // cirqleButton.embedButton(imgElm, imgUrl);
            }

          })(imgElm, imgUrl);
        }
      }

      // var backgroundImgElms = findBackgroundImage(imgUrls);
      // backgroundImgElms = Object.keys(backgroundImgElms).map(function (key) {return backgroundImgElms[key]});
      // // var backgroundImgElms = [];
      // for(var i = imgUrls.length-1; i >=0; i--){
      //   var selector = "img[src*='"+removeUrlParam(imgUrls[i])+"'],img[data-img*='"+removeUrlParam(imgUrls[i])+"'],img[src*='"+removeUrlDomain(imgUrls[i])+"']";
      //   var imgElms = scope.querySelectorAll(selector);
      //   if(imgElms.length && imgElms.length > 0){
      //     console.log('found');
      //     console.log(scope);
      //     console.log(selector);
      //     console.log(imgElms);
      //   }
      //   imgElms = Object.keys(imgElms).map(function (key) {return imgElms[key]});
      //   if(imgElms.concat) imgElms = imgElms.concat(backgroundImgElms);
      //
      //   for(var j = imgElms.length-1; j >=0; j--){
      //     var imgElm = imgElms[j];
      //     var imgUrl = dataset(imgElm, "img") || imgUrls[i];
      //     if(imgElm && imgElm.nodeType && !dataset(imgElm, "cqUuid")){
      //       (function(imgElm, i){
      //         if(imgElm.height == 0 || imgElm.width == 0){
      //           cqjq("<img/>")
      //           .load(function() {
      //             embeddShopButton(imgElm, imgUrl);
      //           })
      //           .error(function() {})
      //           .attr("src", imgElm.src);
      //         }
      //         else{
      //           embeddShopButton(imgElm, imgUrl);
      //         }
      //
      //       })(imgElm, i);
      //     }
      //   }
      // }
    });

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /Mobile/i.test(navigator.userAgent)) {
      // disable iframe button if on mobile
      return;
    }
  }

  function getPostImageInfo(imgurl){
    var defer = cqjq.Deferred();
    //caching here
    if(localStorage && localStorage.getItem(imgurl)){
      defer.resolve(JSON.parse(localStorage.getItem(imgurl)));
    }
    else{
      var url = apiDomain + "/api/1/posts/products?url="+imgurl+"&blogId="+config.getSetting('blog_id');
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
    text.innerHTML = buttonText;

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

  function getHeight(e){
    if (e.currentStyle)
      height = e.currentStyle['height'];
    else if (window.getComputedStyle && e && e.nodeType)
      height = window.getComputedStyle(e,null).getPropertyValue('height');
    else
      height = 0;
    return height;
  }

  function getWidth(e){
    if (e.currentStyle)
      width = e.currentStyle['width'];
    else if (window.getComputedStyle && e && e.nodeType)
      width = window.getComputedStyle(e,null).getPropertyValue('width');
    else
      width = 0;
    return width;
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

  function embeddShopButton(imgNode, imgUrl, ifrmScope){
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
      if(cq_config.showOnHover && cq_config.showOnHover === true){button.style.visibility = "hidden";}

      (function(){
        if(cq_config.showOnHover && cq_config.showOnHover === true){
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
          if(cq_config.showOnHover && cq_config.showOnHover === true){button.style.visibility = "visible";}
        });

        attachHandler(imgHover, "mouseleave", function(e) {
          timer.end(function(duration){
            getPostImageInfo(imgUrl).then(function(data){
              if(data.length > 0){
                var imgObj = data[0];
                var trackTraits = {
                  blogId: config.getSetting('blog_id'),
                  postId: imgObj.postId,
                  imageUrl: imgObj.url
                };
                var traits = cqjq.extend({}, trackTraits, {duration: duration});
                analytics.track("postImageHover", traits);
              }
            });
          });
          if(cq_config.showOnHover && cq_config.showOnHover === true){button.style.visibility = "hidden";}
        });

      })()
    };

    attachHandler(button, "click", function(e) {
      try{
        GATrack.trackShopButtonClick();
      }catch(e){}

      e.stopPropagation();

      var timer = new Timer();

      getPostImageInfo(imgUrl).then(function(data){
        if(data.length > 0){
          var imgObj = data[0];
          var trackTraits = {
            blogId: config.getSetting('blog_id'),
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
        if ( event.origin !== iframe_origin ){
          return;
        }

        var message = event.data;

        if(message == "cqCloseShopWindow"){
          getPostImageInfo(imgUrl).then(function(data){
            if(data.length > 0){
              var imgObj = data[0];
              var trackTraits = {
                blogId: config.getSetting('blog_id'),
                postId: imgObj.postId,
                imageUrl: imgObj.url
              };
              //close positioned iframe
              tooglePurchaseDialog(timer, trackTraits);
              toogleParentScrollY();
            }
          })
        };
      }

      if (window.addEventListener){
        attachHandler(window, "message", closeiframelistener);
      } else {
        attachHandler(window, "onmessage", closeiframelistener);
      }

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
    buttonSingleton.saveButton({img:el, btn:button, uuid:uuid});

    if(isHidden(el)){
      cqjq(button).hide();
    }

    try{
      if(!isButtonLoaded){
        GATrack.trackPageViewWithButtonLoaded();
        isButtonLoaded = true;
      }
      GATrack.trackShopButtonShow();
    }catch(e){}
  }

  function showWindow(img, timer, trackTraits){
    // delete previous content if any
    try {
      var prevContent = document.getElementById("cq-shopwindow");
      prevContent.parentNode.removeChild(prevContent);
    }
    catch(err) {}

    var iframe = document.createElement('iframe');
    iframe.src = iframe_src_url+'?imageurl='+encodeURIComponent(img.url)+"&bloggerid="+img.bloggerId+"&blogid="+config.getSetting('blog_id')+"&postid="+img.postId+"&blogname="+encodeURIComponent(blogName)+"&blogdomain="+encodeURIComponent(blogDomain)+"&posturl="+encodeURIComponent(img.postUrl);
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    var iframeDiv = document.createElement('div');
    iframeDiv.style.visibility = "hidden";
    // iframeDiv.setAttribute('style', '-webkit-overflow-scrolling: touch;');
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      iframeDiv.setAttribute('style', '-webkit-overflow-scrolling: touch !important; overflow-y: scroll !important;');
    }

    if( /iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
      // only safari mobile
      //solution http://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
      iframeDiv.style.height = "10px";
      iframeDiv.style.minHeight = "100%";
      iframe.scrolling = "no";
    }else{
      iframeDiv.style.height = "100%";
    }

    iframeDiv.style.width = "100%";
    iframeDiv.style.position = "fixed";
    iframeDiv.style.top = "0";
    iframeDiv.style.left = "0";
    // iframeDiv.style.zIndex = parseInt(cqjq(button).css("z-index"), 10)+1;
    iframeDiv.style.overflow = "auto";
    iframeDiv.id = "cq-shopwindow";
    iframeDiv.appendChild(iframe);

    document.getElementsByTagName("body")[0].appendChild(iframeDiv);
    iframeDiv.style.zIndex = highestZIndex(0, iframeDiv)+101; // button is +1
  }

  function toogleParentScrollY(){
    var prevContent = document.getElementById("cq-noscrolly-css");

    if(prevContent){
      prevContent.parentNode.removeChild(prevContent);
      repositionButton();
    }
    else{
      var s = document.createElement('style');
      s.type = "text/css";
      s.id = "cq-noscrolly-css";
      document.head.appendChild(s);

      var styles = "body {overflow:hidden !important;}";

      try{s.innerHTML = styles;}
      //IE fix
      catch(error){s.styleSheet.cssText = styles;}
    }
  }

  function calibrateZindexOnScroll(el){
    var onScrollEventHandler = function(){
      el.style.zIndex = highestZIndex(0, el)+2;
    };

    if(window.addEventListener)
        window.addEventListener('scroll', onScrollEventHandler, false);
    else if (window.attachEvent)
        window.attachEvent('onscroll', onScrollEventHandler);
  }

  function tooglePurchaseDialog(timer, trackTraits){

    var shopwindow = document.getElementById("cq-shopwindow");

    if(shopwindow && shopwindow.style.visibility == "visible"){
      // instead of hiding the shop window, delete it
      // shopwindow.style.visibility = "hidden";
      try {
        var prevContent = document.getElementById("cq-shopwindow");
        prevContent.parentNode.removeChild(prevContent);
      }
      catch(err) {}


      if(timer instanceof Timer){
        timer.end(function(duration){
          var traits = cqjq.extend({}, trackTraits, {duration: duration});
          analytics.track("shopwindowOpen", traits);
        });
      }
    }
    else{
      shopwindow.style.visibility = "visible";
      timer.start();
      try{
        calibrateZindexOnScroll(shopwindow);
      }catch(e){consoel.log(e)}
    };

  }

  // small timer object
  function Timer(){
    this.start = function(){
      this.startTime = new Date();
    };
    this.end = function(cb){
      if(!(this.startTime && this.startTime instanceof Date)){cb(false)};

      var end = new Date();
      cb(end.getTime() - this.startTime.getTime());
    };
  }




















  // utilities function
  function isHidden(el) {
    try{
      var p = el;
      while(p){
        var style = window.getComputedStyle(p);
        if(style !== null && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === 0)){
          return true;
        }
        p = p.parentNode;
      }
      return false;

    }catch(e){
      return false;
    }

    // var style = window.getComputedStyle(el);
    // return (style.display === 'none' || style.visibility == 'hidden')
  }

  function highestZIndex(defaultIndex, btn){
    var highest = defaultIndex;
    if(!highest){highest = 8;} // becasue blogger image slider is 10

    highest = Math.max.apply(null,cqjq.map(cqjq('body *'), function(e,n){
        var current = parseInt(cqjq(e).css("z-index"), 10);
        var position = cqjq(e).css("position");
        var isVisible = cqjq(e).is(":visible");
        var className = cqjq(e).attr("class");
        var id = cqjq(e).attr("id");
        // console.log(cqjq(e));
        if(current && !isNaN(current) && position && position != "static" && isVisible && className != "cirqle-outer-button" && id != "cq-shopwindow"){
            var intersect = findIntersectors(e, btn);
            if(intersect.length > 0){
                // console.log("highestZIndex",current);
                return current;
            }
            else{
                // console.log("highestZIndex",defaultIndex);
                return defaultIndex;
            }
        }else{
            // console.log("highestZIndex",defaultIndex);
            return defaultIndex;
        }
    }));

    return highest;
  }

  function findIntersectors(targetSelector, intersectorsSelector) {
    var intersectors = [];

    var $target = cqjq(targetSelector);
    var tAxis = $target.offset();
    var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
    var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

    cqjq(intersectorsSelector).each(function() {
          var $this = cqjq(this);
          var thisPos = $this.offset();
          var i_x = [thisPos.left, thisPos.left + $this.outerWidth()];
          var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

          if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
               t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
              intersectors.push($this);
          }

    });
    return intersectors;
  }

  function getNodePosition(node) {
    var offset = cqjq(node).offset();
    var top = parseInt(offset.top);
    var left = parseInt(offset.left);
    if(cqjq('body').css('position') == 'relative'){
      var body = cqjq('body').offset();
      left -= parseInt(body.left);
      top -= parseInt(body.top);
    }

    return [top, left];
  }

  function nodePosition(node){
    var top,left;
    top = left = 0;
    while (node) {
      if (node.tagName) {
        var offset = cqjq(node).offset();
        top = top + offset.top;
        left = left + offset.left;
      }
      node = node.parentNode;
    }

    return [top, left];
  }

  function arr_diff(a1, a2){
    var a=[], diff=[];

    for(var i=0;i<a1.length;i++)
      a[a1[i]]=true;

    for(var i=0;i<a2.length;i++)
      if(a[a2[i]]) delete a[a2[i]];
      else a[a2[i]]=true;

    for(var k in a)
      diff.push(k);

    return diff;
  }

  function getTumblrImageId(imageURL){
    // media.tumblr.com
    if(imageURL.indexOf("media.tumblr.com") > -1){
      imageURL  = imageURL.substring(0, imageURL.lastIndexOf("/"));
      return imageURL.substring(imageURL.lastIndexOf("/")+1);
    }
    else{
      return removeUrlParam(imageURL);
    }
  }

  function attachHandler(element, event, handler, bubble) {
    if(!bubble){
      bubble = false;
    }

    if(element.addEventListener){
      element.addEventListener(event, handler, bubble);
    } else if(element.attachEvent){
      element.attachEvent(event, handler, bubble);
    }
  }

  function storeData(data, id){
    localStorage.setItem(id, JSON.stringify(data) );
  }

  function getData(id){
    return (localStorage.getItem(id) === null) ? null : JSON.parse(localStorage.getItem(id));
  }

  function iframeRef( frameRef ) {
    return frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument;
  }

  function isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
  }

  function getScrollPositionXY(){
    var xscroll = (document.all ? document.scrollLeft : window.pageXOffset);
    var yscroll = (document.all ? document.scrollTop : window.pageYOffset);

    return [xscroll, yscroll];
  }

  function isElementInViewport(el){

    //special bonus for those using cqjq
    if (el instanceof cqjq) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }

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

  function removeUrlParam(url){
    return url.split("?")[0].split("#")[0].replace(/https?:\/\//i, "");
  }

  function removeUrlDomain(url){
    var domain = "";
    try{
      domain = new URL(url).hostname;
    }catch(e){
      return removeUrlParam(url);
    }
    if(domain !== ""){
      var url = removeUrlParam(url);
      url = url.replace(domain, "");
    }
    return url;
  }


  var self = this;
  _cq = _cq || [];
  while(_cq.length) {
    var params = _cq.shift();   // remove the first item from the queue
    var method = params.shift();    // remove the method from the first item
    self[method].apply(self, params);
  }

  _cq.push = function(params) {
    var method = params.shift();    // remove the method from the first item

    self[method].apply(self, params);
  }
// })();
