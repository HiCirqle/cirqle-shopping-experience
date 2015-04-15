(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dataset = require('./modules/dataset');

(function(){
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
  var segmentIOSwitch = true;
  var cqjq;

  setSegmentIo();

  if(typeof MutationObserver == 'undefined'){
    var theNewScript = document.createElement("script");
    theNewScript.type = "text/javascript";
    theNewScript.src = web_component_cdn;
    document.getElementsByTagName("head")[0].appendChild(theNewScript);
  }

  // load jquery if not loaded
  if(typeof jQuery == "undefined"){
    var theNewScript = document.createElement("script");
    theNewScript.type = "text/javascript";
    theNewScript.src = jquery_cdn;
    document.getElementsByTagName("head")[0].appendChild(theNewScript);
  }

  function loadJqueryIfNotLoaded(cb){
    // return cb();
    // jQuery MAY OR MAY NOT be loaded at this stage
    var waitForLoad = function () {
      if (typeof jQuery != "undefined") {
        if(jQuery.fn.jquery != "1.11.1"){
          var theNewScript = document.createElement("script");
          theNewScript.type = "text/javascript";
          theNewScript.src = jquery_cdn;
          document.getElementsByTagName("head")[0].appendChild(theNewScript);
          window.setTimeout(waitForLoad, 500);
        }
        else{
          cqjq = jQuery.noConflict();
          cb();
        }

      } else {
        window.setTimeout(waitForLoad, 500);
      }
    };
    window.setTimeout(waitForLoad, 500);
  }

  function webComponentReady(cb){
    var waitForLoad = function () {
      if (typeof MutationObserver == 'undefined') {
        window.setTimeout(waitForLoad, 500);
      } else {
        cb()
      }
    };
    window.setTimeout(waitForLoad, 500);
  }

  buttonSingleton = (function(){
    var btns = [];
    var taggedImgs;

    function saveButton(btn){
      btns.push(btn);
    }

    function getAllButtons(){
      return btns;
    }

    function getTaggedImg(){
      return getTaggedImgFromApi();
    }

    return {
      getTaggedImg:function(){
        if(taggedImgs){
          var defer = jQuery.Deferred();
          return defer.resolve(taggedImgs)
        }
        return getTaggedImg().then(function(data){
          taggedImgs = data;
          return taggedImgs;
        });
      },
      saveButton:saveButton,
      getAllButtons:getAllButtons
    }
  })();

  function buttonActivated(){
    // document.getElementsByTagName("body")[0].dataset.cpButtonActivated = true;
    dataset(document.getElementsByTagName("body")[0], "cpButtonActivated", true);
  }

  this.cirqle_init = function(b_id, config){
    var pathName = document.location.pathname;

    cq_config = config || {};

    //overwirte showOnHover = false when on mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /Mobile/i.test(navigator.userAgent)) {
      cq_config = {showOnHover:false};
    }

    blog_id = b_id;
    cirqle_getpost_by_url = apiDomain + "/api/1/blogs/"+blog_id+"/photos?tagged=true";
    cirqle_getPostid_by_blogid_url = apiDomain + "/api/1/posts/blog/"+blog_id;
    cirqle_getpost_by_postid_url = apiDomain + "/api/1/posts/{post_id}/blog/"+blog_id+"/photos?tagged=true";

    loadJqueryIfNotLoaded(function(){

      // jQuery(function() {
      // your page initialization code here
      // the DOM will be available here

      // set up cirqle button environment. eg load css file, segment io setting
      if(cq_config.customCss && typeof cq_config.customCss == "string" && cq_config.customCss.indexOf("cdn.cirqle.nl") > -1){
        css_url = cq_config.customCss;
      }
      setCirqleCss(document, css_url);

      // segment IO identify user, anonymous in this case
      window.onload = function(){
        identity();
      }

      // send tracking of blog view with cirqle button embedded
      track("blogView", {
        blogId: blog_id
      });

      // findPostImage
      embedButtonOnLoad(document);

      var body = document.getElementsByTagName('body')[0]
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
              if(!addedNodes[j].querySelectorAll){continue;}

                var img = addedNodes[j].querySelectorAll('img');
                if(img.length > 0){
                  mutated = true;
                  break;
                }
              }

              var img = target.querySelectorAll('img');
              if(img.length > 0){
                mutated = true;
              }

              if(mutated){
                break;
              }
            }

            if(mutated){
              clearTimeout(id);
              // jQuery('.cirqle-outer-button').hide();
              // jQuery('.cirqle-outer-button').fadeOut();
              id = setTimeout(doneChanging, 1000);
            }
          });

          // configuration of the observer:
          var config = { attributes: true, childList: true, characterData: true, subtree: true };

          // pass in the target node, as well as the observer options
          observer.observe(body, config);

        });

        function doneChanging(){
          repositionButton();
        }

        // Handle post that show up after on load. eg. lazy loading
        document.getElementsByTagName("body")[0].addEventListener("DOMNodeInserted", function(e) {
          var inserted = e.target;
          if(!inserted.querySelectorAll){return;}
            var image = inserted.querySelectorAll('img');
            var iframe = inserted.querySelectorAll("iframe[src*='"+document.domain+"/post']");

            if(image.length > 0 || iframe.length > 0){
              //Handle post that show up on load
              embedButtonOnLoad(inserted);
            }
          });


          function iframelistener(event){
            if ( event.origin !== iframe_origin ){
              return;
            }

            var message = event.data;
            if(message instanceof Object){
              message = JSON.parse(message);
              track("productView", {
                blogId: blog_id,
                postId: message.postId,
                productId: message.productId
              });
            }
          }

          if (window.addEventListener){
            attachHandler(window, "message", iframelistener);
          } else {
            attachHandler(window, "onmessage", iframelistener);
          }

          var id;
          cqjq(window).resize(function() {
            // touch screen trigger resize, only fadeout when not device
            clearTimeout(id);
            id = setTimeout(doneResizing, 500);
          });

          function doneResizing(){
            repositionButton(); // some theme doesn't fire mutation event on viewport change, we have to manually forse reposition upon resizing
          }

          // });

        });
      }

  function clearButton(){
    buttons.forEach(function(btnObj){
      if(!isHidden(btnObj.img)){
        // jQuery(btnObj.btn).fadeIn();
      }
      else{
        // jQuery(btnObj.btn).fadeOut();
      }
    });
  }

  function repositionButton(){
    var buttons = buttonSingleton.getAllButtons();
    if(buttons.length == 0){return;}

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

  function setSegmentIo(){
    if(segmentIOSwitch){
      try{
        if(!window.analytics){
          window.analytics=window.analytics||[],window.analytics.methods=["identify","group","track","page","pageview","alias","ready","on","once","off","trackLink","trackForm","trackClick","trackSubmit"],window.analytics.factory=function(t){return function(){var a=Array.prototype.slice.call(arguments);return a.unshift(t),window.analytics.push(a),window.analytics}};for(var i=0;i<window.analytics.methods.length;i++){var key=window.analytics.methods[i];window.analytics[key]=window.analytics.factory(key)}window.analytics.load=function(t){if(!document.getElementById("analytics-js")){var a=document.createElement("script");a.type="text/javascript",a.id="analytics-js",a.async=!0,a.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.io/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n)}},window.analytics.SNIPPET_VERSION="2.0.9",
          window.analytics.load("nfllvg24aq");
        }

      }catch(e){}
      // window.analytics.page();
    }
  }

  function identity(){
    if(segmentIOSwitch){
      analytics.identify({
        integrations: {
          'All': false,
          'Webhooks': true
        }
      }, function(){
      });
    }
  }

  function track(action, traits){
    if(segmentIOSwitch){
      analytics.track(action, traits, {
        integrations: {
          'All': false,
          'Webhooks': true
        }
      }, function(){
      });
    }
  }

  function setCirqleCss(scope, css){
    var s = scope.createElement('link');
    s.rel = "stylesheet"
    s.type = "text/css";
    s.href = css;
    s.id = "cirqlecss_"+blog_id;
    scope.head.appendChild(s);
  }

  function getTaggedImgFromApi(){
    return cqjq.getJSON(cirqle_getpost_by_url);
  }

  function embedButtonOnLoad(content){
    try{
      buttonActivated();
      // getPostImageFromAPI(content);
      var imgIdentifier = "media.tumblr.com"; // speed up img look up
      findPostImage(content, imgIdentifier);

    }catch(e){
    }
  }

  /*imgIdentifyMethods.page = true*/
  function findPostImage(scope, post_img_identifier){
    var domain  = document.domain;
    var postImagesNodeAndURL = [];
    var selector = post_img_identifier ? "img[src*='"+post_img_identifier+"']" : "img";

    var postImagewidth = 131;
    var postImageheight = 32;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      var postImagewidth = 66;
      var postImageheight = 32;
    }

    buttonSingleton.getTaggedImg().then(function(imgUrls){
        for(var i = imgUrls.length-1; i >=0; i--){
            var selector = "img[src*='"+removeUrlParam(imgUrls[i])+"'],img[data-img*='"+removeUrlParam(imgUrls[i])+"']";
            var imgElms = scope.querySelectorAll(selector);

        for(var j = imgElms.length-1; j >=0; j--){
          var imgElm = imgElms[j];
          if(imgElm && !dataset(imgElm, "cqUuid")){
            (function(imgElm, i){
              if(imgElm.height == 0 || imgElm.width == 0){
                cqjq("<img/>")
                .load(function() {
                  getPostImageInfo(imgUrls[i]).then(function(data){
                    if(data.length > 0){
                      embeddShopButton(imgElm, data[0]);
                    }
                  });
                })
                .error(function() {})
                .attr("src", imgElm.src);
              }
              else{
                getPostImageInfo(imgUrls[i]).then(function(data){
                  if(data.length > 0){
                    embeddShopButton(imgElm, data[0]);
                  }
                });
              }

            })(imgElm, i);
          }
        }

      }
    });

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /Mobile/i.test(navigator.userAgent)) {
      // disable iframe button if on mobile
      return;
    }

    // // iframe
    var iframe = scope.querySelectorAll("iframe[src*='"+domain+"/post']") || [];

    // for every iframe found
    for(var i = 0; i < iframe.length; i++){
        (function(i){
            //wait for each iframe to be loaded before accessing its element
            cqjq(iframe[i]).load(function(){
                // set iframe css
                setCirqleCss(iframeRef(this), css_url);
                (function(ifrmScope){
                    buttonSingleton.getTaggedImg().then(function(imgUrls){
                        for(var i = imgUrls.length-1; i >=0; i--){
                            var selector = "img[src*='"+removeUrlParam(imgUrls[i])+"']";
                            var imgElm = ifrmScope.querySelector(selector);

                if(imgElm && !dataset(imgElm, "cqUuid")){
                  (function(imgElm, ifrmScope){
                    if(imgElm.height == 0 || imgElm.width == 0){
                      cqjq("<img/>")
                      .load(function() {
                        getPostImageInfo(imgUrls[i]).then(function(data){
                          if(data.length > 0){
                            embeddShopButton(imgElm, data[0], ifrmScope);
                          }
                        });
                      })
                      .error(function() {})
                      .attr("src", imgElm.src);
                    }
                    else{
                      getPostImageInfo(imgUrls[i]).then(function(data){
                        if(data.length > 0){
                          embeddShopButton(imgElm, data[0], ifrmScope);
                        }
                      });
                    }
                  })(imgElm, ifrmScope);
                }
              }
            });
          })(iframeRef(this));
        });

      })(i);
    }
  }

  function getPostImageInfo(imgurl){
    var url = apiDomain + "/api/1/posts/products?url="+imgurl+"&blogId="+blog_id;
    return cqjq.getJSON(url);
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
    text.innerHTML = "Shop this post";

    button.appendChild(icon);
    button.appendChild(text);

    return button;
  }

  function embedButtonAbsolute(imgNode, uuid, ifrmScope){
    var button = createButton(imgNode, uuid)

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

    // assign previous button position and dimension
    // btnNode.absoluteTop = btnNode.style.top;
    // btnNode.absoluteLeft = btnNode.style.left;
    // btnNode.previousHeight = btnHeight;
    // btnNode.previousWidth = btnWidth;

    //ipad and tablet shows desktop button
    var buttonTop = imgPos[0] + imgNode.height - offsetFromBottomRight - btnHeight; // button height 32px/32px
    var buttonLeft = imgPos[1] + imgNode.width - offsetFromBottomRight - btnWidth; // button width 131px/66px

    console.log(imgPos);
    console.log(imgNode.height, imgNode.width);
    console.log(btnHeight, btnWidth);
    // console.log(highestZIndex(0, btnNode)+1);
    var current = parseInt(cqjq(btnNode).css("z-index"), 10);
    if(isNaN(current)) btnNode.style.zIndex = highestZIndex(0, btnNode)+1;

    btnNode.className = "cirqle-outer-button";
    btnNode.style.position = "absolute";
    btnNode.style.top = buttonTop+"px";
    btnNode.style.left = buttonLeft+"px";

    return btnNode;
  }

  function embeddShopButton(imgNode, imgObj, ifrmScope){
    if(dataset(imgNode, "postId")){
      // shop button has been embedded
      return;
    }
    // imgNode.dataset.postId = imgObj.postId;
    dataset(imgNode, "postId", imgObj.postId);

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

    var trackTraits = {
      blogId: blog_id,
      postId: imgObj.postId,
      imageUrl: imgObj.url
    };

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
                var traits = cqjq.extend({}, trackTraits, {duration: duration});
                track("postImageHover", traits);
              });
              if(cq_config.showOnHover && cq_config.showOnHover === true){button.style.visibility = "hidden";}
              });

            })()
          }

          attachHandler(button, "click", function(e) {
            e.stopPropagation();

            var timer = new Timer();

        // append iframe window here
        showWindow(imgObj, timer, trackTraits);
        toogleParentScrollY();
        //show positioned iframe
        tooglePurchaseDialog(timer, trackTraits);

            function closeiframelistener(event){
              if ( event.origin !== iframe_origin ){
                return;
              }

              var message = event.data;

              if(message == "cqCloseShopWindow"){
                //close positioned iframe
                tooglePurchaseDialog(timer, trackTraits);
                toogleParentScrollY();
              }
            }

            if (window.addEventListener){
              attachHandler(window, "message", closeiframelistener);
            } else {
              attachHandler(window, "onmessage", closeiframelistener);
            }

            // if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            //     showPurchaseDialogMobile(data);
            // }
            // else{
            //     appendPurchaseDialog(data);
            // }
            // tooglePurchaseDialog();
            // alert("buy button clicked")

            // track clicked rate through segment IO
            track("shopbuttonClicked", trackTraits);

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

        }

function showWindow(img, timer, trackTraits){
    // <iframe class=iframe-hidden src=index.html style="border:0; width:100%; height:100%; position:fixed; top:0; z-index:99999"></iframe>
    // delete previous content if any
    try {
      var prevContent = document.getElementById("cq-shopwindow");
      prevContent.parentNode.removeChild(prevContent);
    }
    catch(err) {}

    var iframe = document.createElement('iframe');
    iframe.src = iframe_src_url+'?imageurl='+encodeURIComponent(img.url)+"&bloggerid="+img.bloggerId+"&blogid="+blog_id+"&postid="+img.postId+"&blogname="+blogName+"&blogdomain="+blogDomain+"&posturl="+img.postUrl;
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
    iframeDiv.style.zIndex = highestZIndex(0, iframeDiv)+2; // button is +1

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
      s.id = "cq-noscrolly-css"
      document.head.appendChild(s);

      var styles = "body {overflow:hidden !important;}";

      try{s.innerHTML = styles;}
      //IE fix
      catch(error){s.styleSheet.cssText = styles;}
    }
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
          track("shopwindowOpen", traits);
        });
      }
    }
    else{
      shopwindow.style.visibility = "visible";
      timer.start();
    }

  }

  // small timer object
  function Timer(){
    this.start = function(){
      this.startTime = new Date();
    };
    this.end = function(cb){
      if(!(this.startTime && this.startTime instanceof Date)){cb(false)}

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
        if(style != null && (style.display === 'none' || style.visibility == 'hidden' || style.opacity == 0)){
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

    // cqjq("*").each(function() {
    //     var current = parseInt(cqjq(this).css("z-index"), 10);
    //     var position = cqjq(this).css("position");
    //     var isVisible = cqjq(this).is(":visible");
    //     var className = cqjq(this).attr("class");
    //     if(current && current > highest && !isNaN(current) && position && position != "static" && isVisible && className != "cirqle-outer-button"){
    //         var intersect = findIntersectors(this, btn);
    //         if(intersect.length > 0) highest = current;
    //     }
    // });

    highest = Math.max.apply(null,cqjq.map(cqjq('body *'), function(e,n){
        var current = parseInt(cqjq(e).css("z-index"), 10);
        var position = cqjq(e).css("position");
        var isVisible = cqjq(e).is(":visible");
        var className = cqjq(e).attr("class");
        var id = cqjq(e).attr("id");
        if(current && !isNaN(current) && position && position != "static" && isVisible && className != "cirqle-outer-button" && id != "cq-shopwindow"){
            var intersect = findIntersectors(e, btn);
            if(intersect.length > 0)
                return current;
            else{
                return defaultIndex;
            }
        }else{
            return defaultIndex;
        }
    }));

    return highest
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
          var i_x = [thisPos.left, thisPos.left + $this.outerWidth()]
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
    var top = left = 0;
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
    // return url.split("?")[0].split("#")[0].replace(/.*?:\/\//g, "");
    return url.split("?")[0].split("#")[0].replace(/.*?:\/\/.*?\//g, "");
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
})();

},{"./modules/dataset":2}],2:[function(require,module,exports){
module.exports=dataset;

/*global document*/


// replace namesLikeThis with names-like-this
function toDashed(name) {
  return name.replace(/([A-Z])/g, function(u) {
    return "-" + u.toLowerCase();
  });
}

var fn;

if (document.head && document.head.dataset) {
  fn = {
    set: function(node, attr, value) {
      node.dataset[attr] = value;
    },
    get: function(node, attr) {
      return node.dataset[attr];
    },
    del: function (node, attr) {
      delete node.dataset[attr];
    }
  };
} else {
  fn = {
    set: function(node, attr, value) {
      node.setAttribute('data-' + toDashed(attr), value);
    },
    get: function(node, attr) {
      return node.getAttribute('data-' + toDashed(attr));
    },
    del: function (node, attr) {
      node.removeAttribute('data-' + toDashed(attr));
    }
  };
}

function dataset(node, attr, value) {
  var self = {
    set: set,
    get: get,
    del: del
  };

  function set(attr, value) {
    fn.set(node, attr, value);
    return self;
  }

  function del(attr) {
    fn.del(node, attr);
    return self;
  }

  function get(attr) {
    return fn.get(node, attr);
  }

  if(!node.nodeType){
    return null;
  }

  if (arguments.length === 3) {
    return set(attr, value);
  }
  if (arguments.length == 2) {
    return get(attr);
  }

  return self;
}

},{}]},{},[1]);

//# sourceMappingURL=map/cirqle-on-squarespace.js.map