var Button = require('./modules/Button');
class TumblrButton extends Button {
  constructor(){
    super();
  }

  findPostImage(){
    super.findPostImage();
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
