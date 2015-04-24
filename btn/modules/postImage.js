// var jQuery = require('jquery');
var scope = document;

function ImageElement(element, url){
  this.element = element
  this.url = url
}

function setScope(sc){
  scope = sc
}

function getElementBackgroundImageValue(e){
  if (e.currentStyle)
    backgroundImage = e.currentStyle['backgroundImage'];
  else if (window.getComputedStyle && e && e.nodeType)
    backgroundImage = window.getComputedStyle(e,null).getPropertyValue('background-image');
  else
    backgroundImage = "";
  return backgroundImage;
}

function findBackgroundImage(urls){
  var all = scope.querySelectorAll('body *');
  all = Object.keys(all).map(function (key) {return all[key]});

  return all.reduce(function(prev, e) {
    var backgroundImage = getElementBackgroundImageValue(e);
    var index = urls.indexOf(backgroundImage);
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

function makeArray(objects){
  return Object.keys(objects).map(function (key) {return objects[key]});
}

function findImages(imgUrls){
  var imgElementObjects = [];
  var backgroundImgElmObject = findBackgroundImage(imgUrls);

  for(var i = imgUrls.length-1; i >=0; i--){
    var selector = "img[src*='"+removeUrlParam(imgUrls[i])+"'],img[data-img*='"+removeUrlParam(imgUrls[i])+"'],img[src*='"+removeUrlDomain(imgUrls[i])+"']";
    var elements = scope.querySelectorAll(selector);
    elements = makeArray(elements);
    elements = elements.map(function(e){
      return new ImageElement(e, imgUrls[i]);
    });
    imgElementObjects = imgElementObjects.concat(elements);
  }
  return imgElementObjects.concat(backgroundImgElmObject);
}
module.exports = {
  setScope:setScope,
  findImages:findImages
}
