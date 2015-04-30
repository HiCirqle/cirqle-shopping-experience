var postImage = require('./modules/postImage');
var Button = require('./modules/Button');
class TumblrButton extends Button {
  constructor(){
    super();
  }

  findPostImages(imgUrls, scope){
    // return super.findPostImages(imgUrls, scope);
    postImage.setScope(scope);
    return postImage.findTumblrImages(imgUrls);
    console.log("tumblr findPostImages");
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
