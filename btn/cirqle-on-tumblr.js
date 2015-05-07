var cqjq = require('jquery');
var postImage = require('postImage');
var browserHelper = require('browserHelper');
var iframeRef = browserHelper.iframeRef;
var Button = require('Button');
class TumblrButton extends Button {
  constructor(){
    super();
  }

  // overwirte method to find Image
  findPostImages(imgUrls, scope){
    // return super.findPostImages(imgUrls, scope);
    postImage.setScope(scope);
    return postImage.findTumblrImages(imgUrls);
    console.log("tumblr findPostImages");
  }

  findImages(scope){
    super.findImages(scope);
    var iframe = scope.querySelectorAll("iframe[src*='"+domain+"/post']") || [];

    // for every iframe found
    for(var i = 0; i < iframe.length; i++){
      (function(i){
        //wait for each iframe to be loaded before accessing its element
        cqjq(iframe[i]).load(function(){
          // set iframe css
          var iframeScope = iframeRef(iframe[i]);
          super.setCirqleCss(iframeScope, css_url);
          super.findImages(iframeScope);
        });

      })(i);
    }

  }
}

var self = new TumblrButton();
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
