var cqjq = require('jquery');
var postImage = require('postImage');
var browserHelper = require('browserHelper');
var iframeRef = browserHelper.iframeRef;
var Button = require('button');
var ImageElement = require('imageElement');

class PreviewButton extends Button {
  constructor(){
    super();
  }

  // overwirte method to find Image
  findPostImages(imgUrls, scope){
    var allImages = scope.getElementsByTagName("img");
    var imgElementObjects = [], width, height;
    console.log(allImages);

    for(var i=0; i<allImages.length; i++){
      width = parseInt(browserHelper.getWidth(allImages[i]));
      height = parseInt(browserHelper.getHeight(allImages[i]));
      if(width > 280 && height > 62)
        imgElementObjects.push(new ImageElement(allImages[i], allImages[i].src))
    }

    console.log(imgElementObjects);
    return imgElementObjects;
  }

  findImages(scope){
   var imgElmObjs = self.findPostImages(null, scope);
   console.log(imgElmObjs);

   for(var j = imgElmObjs.length-1; j >=0; j--){
     var imgElm = imgElmObjs[j].element;
     var imgUrl = imgElmObjs[j].url;
     if(imgElm && imgElm.nodeType){
       (function(imgElm, imgUrl){
         if(imgElm.height == 0 || imgElm.width == 0){
           cqjq("<img/>")
           .load(function() {
             // embeddShopButton(imgElm, imgUrl);
             super.embedButton(imgElm, imgUrl);
           })
           .error(function() {})
           .attr("src", imgElm.src);
         }
         else{
           // embeddShopButton(imgElm, imgUrl);
           super.embedButton(imgElm, imgUrl);
         }

       })(imgElm, imgUrl);
     }
   }
  }
}

var self = new PreviewButton();
console.log(document.getElementsByTagName);
// self.findImages(document);
self.cirqle_init("12277140-9ca1-11e4-9fc0-a50e41abca13");
