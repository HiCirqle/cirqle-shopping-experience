var cqjq = require('jquery');
var _ = require('lodash');
var Q = require('q');
var scope = document;
var thisModule = {};

function getProduct(product_id){
  return Q.Promise((resolve, reject, notify)=>{
    var url = "http://54.73.226.47:9090/api/1/search/products?q=id:%22"+product_id+"%22";

    cqjq.getJSON(url).then((data)=>{
      if(!data.products || data.products.length === 0) return resolve({});
      console.log(data);
      resolve(data.products[0]);
    })
    .fail(function(e) {
      resolve({});
    })
  });
}

function getPost(post_id){
  return Q.Promise((resolve, reject, notify)=>{
    var url = "@@apiHost/api/shopping/post/"+post_id;

    cqjq.getJSON(url).then((data)=>{
      if(!data || data.length === 0) return resolve([]);
      console.log(data);
      resolve(data);
    })
    .fail(function(e) {
      resolve([]);
    })
  });
}

function embedProductBox(product){
    console.log(product, _.isEmpty(product));
    if(_.isEmpty(product)) return null;
    product.productImageUrl = product.imageLargeUrl && product.imageLargeUrl[0] || product.imageSmallUrl && product.imageSmallUrl[0];
    product.currencyAndPrice = product.preferredCurrency + " " + product.priceInPreferredCurrency || product.currency + " " + product.price;
    product.name = _.trunc(product.name, {
      'length': 50,
      'separator': ' ',
      'omission': ''
    });

    var template = '<div id="shopbox" class="sticky"><div class="dialog"><a id="shopboxClose" href="#" class="close-thin"></a></div><div class="photo" style="background-image:url(\'{{productImageUrl}}\')"></div><div class="text"><div class="name">{{name}}</div><div><span class="price">{{currencyAndPrice}}</span></div></div><div class="callToAction"><div class="shopbox-btn btn-orange btn"><a id="shopboxButton" href="#">Shop Now</a></div></div></div>';

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    var compiled = _.template(template);
    var result = compiled(product);
    cqjq(result).appendTo('body');
    cqjq('#shopboxClose').click((e)=>{
      e.preventDefault();
      cqjq('#shopbox').fadeOut();
    });
    return cqjq('#shopboxButton')[0];
}

function embedPostBox(photos){
    console.log(photos, _.isEmpty(photos));
    if(_.isEmpty(photos)) return null;

    var photo = photos[0];
    if(photos.length > 1){
      var rand = _.random(0, photos.length-1);
      photo = photos[rand];
    }

    photo.currencyAndPrice = photo.preferredCurrency + " " + photo.priceInPreferredCurrency || photo.currency + " " + photo.price;
    photo.name = _.trunc(photo.name, {
      'length': 45,
      'separator': ' ',
      'omission': ''
    });
    var template = '<div id="shopbox" class="sticky"><div class="dialog"><a id="shopboxClose" href="#" class="close-thin"></a></div><div class="photo" style="background-image:url(\'{{imageurl}}\')"></div><div class="text"><div class="name">{{resources}}</div></div><div class="callToAction"><div class="shopbox-btn btn-orange btn"><a id="shopboxButton" href="{{url}}" target="_blank">Read More</a></div></div></div>';

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    var compiled = _.template(template);
    var result = compiled(photo);
    cqjq(result).appendTo('body');
    cqjq('#shopboxClose').click((e)=>{
      e.preventDefault();
      cqjq('#shopbox').fadeOut();
    });
    return cqjq('#shopboxButton')[0];
}

function embedProduct(product_id){
  return getProduct(product_id).then(embedProductBox);
}

function embedPost(product_id){
  return getPost(product_id).then(embedPostBox);
}

function setScope(sc){
  scope = sc;
}

function setConfig(config){
  Object.keys(config).forEach(function(key){
    thisModule[key] = config[key];
  });
}

module.exports = {
  setConfig:setConfig,
  setScope:setScope,
  embedProduct:embedProduct,
  embedPost:embedPost
}
