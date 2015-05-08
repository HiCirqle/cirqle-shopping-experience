var Button = require('button');
class BloggerButton extends Button {
  constructor(){
    super();
  }

  findPostImages(imgUrls, scope){
    return super.findPostImages(imgUrls, scope);
    console.log("blogger findPostImages");
  }
}

var self = new BloggerButton();
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
