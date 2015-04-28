var iframe_src_url;
var blogName = document.title;
var blogDomain = window.location.host;
var cqjq = require('jquery');
var config = require('../modules/config');
var position = require('../modules/position');
var repositionButton = position.repositionButton;
var highestZIndex = require('../modules/highestZIndex');
var calibrateZindexOnScroll = position.calibrateZindexOnScroll;
var Timer = require('../modules/Timer');

function setBlogId(id){
  iframe_src_url = config.getSetting('iframe_src_url');
}

function showWindow(img, timer, trackTraits){
  console.log(iframe_src_url);
  if(!iframe_src_url) return;
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

function tooglePurchaseDialog(timer, trackTraits){

  var shopwindow = document.getElementById("cq-shopwindow");

  if(shopwindow && shopwindow.style.visibility === "visible"){
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
  // else if(shopwindow && shopwindow.style.visibility !== "visible"){
  else{
    console.log(shopwindow);
    shopwindow.style.visibility = "visible";
    timer.start();
    try{
      calibrateZindexOnScroll(shopwindow);
    }catch(e){consoel.log(e)}
  };

}

module.exports = {
  setBlogId:setBlogId,
  showWindow:showWindow,
  tooglePurchaseDialog:tooglePurchaseDialog,
  toogleParentScrollY:toogleParentScrollY
}
