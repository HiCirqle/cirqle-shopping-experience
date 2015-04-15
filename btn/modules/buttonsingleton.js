// module.exports=track;
var jQuery = require('jquery');
/*global document*/
var btns = [];
var taggedImgs;
var getTaggedImgFromApi;

function saveButton(btn){
  btns.push(btn);
}

function getAllButtons(){
  return btns;
}

// function getTaggedImgFromApi(){
//   return jQuery.getJSON(cirqle_getpost_by_url);
// }

function createTagRetrievalFunction(url){
  return function(){
    jQuery.getJSON(url);
  }
}

function init(url){
  getTaggedImgFromApi = createTagRetrievalFunction(url);
}

function loadTaggedImg(){
  return getTaggedImgFromApi();
}

function getTaggedImg(){
  var defer = jQuery.Deferred();
  if(!getTaggedImgFromApi) return defer.resolve([]);

  if(taggedImgs){
    return defer.resolve(taggedImgs);
  }

  return loadTaggedImg().then(function(data){
    taggedImgs = data;
    return taggedImgs;
  });
}

module.exports = {
  init:init,
  getTaggedImg:getTaggedImg,
  saveButton:saveButton,
  getAllButtons:getAllButtons
}
