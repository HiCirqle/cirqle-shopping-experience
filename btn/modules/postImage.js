var cqjq = require('jquery');
var _ = require('lodash');
require('../modules/webPolyfill')(window);
var scope = document;

class ImageElement{
  constructor(element, url){
    this.element = element
    this.url = url
  }
}

class PostImage{
  constructor(){}

}

function setScope(sc){
  scope = sc
}

function getElementBackgroundImageValue(e){
  var backgroundImage = "";
  if (e.currentStyle)
    backgroundImage = e.currentStyle['backgroundImage'];
  else if (window.getComputedStyle && e && e.nodeType)
    backgroundImage = window.getComputedStyle(e,null).getPropertyValue('background-image');
  else
    backgroundImage = "";

  return backgroundImage.slice(4, -1);;
}

function findBackgroundImage(urls){
  var all = scope.querySelectorAll('body *');
  // all = Object.keys(all).map(function (key) {return all[key]});
  all = makeArray(all);

  return _.reduce(all, function(prev, e) {
    var backgroundImage = getElementBackgroundImageValue(e);
    // console.log(backgroundImage);
    var index = _.indexOf(urls, backgroundImage);
    if(index > 0){
      prev.push(new ImageElement(e, urls[index]));
    }
    return prev;
  }, []);
}

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

function getTumblrImageId(imageURL){
  // media.tumblr.com
  if(_.indexOf(imageURL, "media.tumblr.com") > -1){
    imageURL  = imageURL.substring(0, imageURL.lastIndexOf("/"));
    return imageURL.substring(imageURL.lastIndexOf("/")+1);
  }
  else{
    return removeUrlParam(imageURL);
  }
}

function makeArray(objects){
  // return Object.keys(objects).map(function (key) {return objects[key]});
  return cqjq.map(Object.keys(objects), function(key){return objects[key]});
}

function findImages(imgUrls){
  var imgElementObjects = [];
  var backgroundImgElmObject = findBackgroundImage(imgUrls);

  for(var i = imgUrls.length-1; i >=0; i--){
    var selector = "img[src*='"+removeUrlParam(imgUrls[i])+"'],img[data-img*='"+removeUrlParam(imgUrls[i])+"'],img[src*='"+removeUrlDomain(imgUrls[i])+"']";
    var elements = scope.querySelectorAll(selector);
    elements = makeArray(elements);
    elements = cqjq.map(elements, function(e){
      return new ImageElement(e, imgUrls[i]);
    });
    imgElementObjects = imgElementObjects.concat(elements);
  }
  return imgElementObjects.concat(backgroundImgElmObject);
}

module.exports = {
  setScope:setScope,
  findImages:findImages,
  getTumblrImageId:getTumblrImageId
}
