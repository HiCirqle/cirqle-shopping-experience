var Button = require('button');
class WordpressButton extends Button {
  constructor(){
    super();
  }

  findPostImages(imgUrls, scope){
    console.log("wordpress findPostImages");
    return super.findPostImages(imgUrls, scope);
  }
  // findImages(scope){
  //   super.findImages(scope);
  //   console.log("wordpress findImages");
  // }
  // embedButtonOnLoad(scope){
  //   super.embedButtonOnLoad(scope);
  //   console.log("wordpress embedButtonOnLoad");
  // }
  // cirqle_init(b_id, customConfig){
  //   super.cirqle_init(b_id, customConfig);
  //   console.log("wordpress cirqle_init");
  // }
}

var self = new WordpressButton();
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
