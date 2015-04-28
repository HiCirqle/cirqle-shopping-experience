var jQuery = require('jquery');

var btns = [];
var taggedImgs;
var requesting = false;
var requestPromise;
var getTaggedImgFromApi;

function saveButton(btn){
  btns.push(btn);
}

function getAllButtons(){
  return btns;
}

function createTagRetrievalFunction(url){
  return function(){
    return jQuery.getJSON(url+'&callback=?');
  }
}

function init(url){
  getTaggedImgFromApi = createTagRetrievalFunction(url);
}

function getTaggedImg(){
  var defer = jQuery.Deferred();
  if(!getTaggedImgFromApi) return defer.resolve([]);

  if(!requesting && taggedImgs){
    return defer.resolve(taggedImgs);
  }

  if(!requesting && !requestPromise){
    requesting = true;
    requestPromise = getTaggedImgFromApi().then(function(data){
      requesting = false;
      taggedImgs = data;
      return data;
    });
  }
  return requestPromise;
}

module.exports =  {
  init:init,
  getTaggedImg:getTaggedImg,
  saveButton:saveButton,
  getAllButtons:getAllButtons
};
