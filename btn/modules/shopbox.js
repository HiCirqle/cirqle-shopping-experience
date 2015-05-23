var cqjq = require('jquery');
var _ = require('lodash');
var Q = require('q');
var scope = document;
var thisModule = {};

function getProduct(product_id){
  var defer = cqjq.Deferred();
  //caching here
  if(localStorage && localStorage.getItem(product_id)){
    // defer.resolve(JSON.parse(localStorage.getItem(imgurl)));
  }
  else{
    var url = "http://54.73.226.47:9090/api/1/search/products?q=id:%22"+product_id+"%22";

    cqjq.getJSON(url).then(function(data){
      // if(localStorage){
      //   localStorage.setItem('product-'+imgurl,JSON.stringify(data));
      // }
      if(!data.products || data.products.length === 0) return defer.resolve({});
      defer.resolve(data.products[0]);
    });
  }
  return defer;
}

function embedBox(product){
    console.log(product, _.isEmpty(product));
    if(_.isEmpty(product)) return null;
    product.productImageUrl = product.imageLargeUrl && product.imageLargeUrl[0] || product.imageSmallUrl && product.imageSmallUrl[0];
    product.currencyAndPrice = product.preferredCurrency + " " + product.priceInPreferredCurrency || product.currency + " " + product.price;
    product.name = _.trunc(product.name, {
      'length': 45,
      'separator': ' ',
      'omission': ''
    });
    var template = '<div id="shopbox" class="sticky"><div class="dialog"><a id="shopboxClose" href="#" class="close-thin"></a></div><div class="photo" style="background-image:url(\'{{productImageUrl}}\')"></div><div class="text"><div class="name">{{name}}</div><div>From <span class="price">{{currencyAndPrice}}</span></div></div><div class="callToAction"><div class="shopbox-btn btn-orange btn"><a id="shopboxButton" href="#">Shop Now</a></div></div></div>';
    var template = '<div id="shopbox" class="sticky"><div class="dialog"><a id="shopboxClose" href="#" class="close-thin"></a></div><div class="photo">      <img src="{{productImageUrl}}" alt="" /></div><div class="text"><div class="name">{{name}}</div><div>From <span class="price">{{currencyAndPrice}}</span></div></div><div class="callToAction"><div class="shopbox-btn btn-orange btn"><a id="shopboxButton" href="#">Shop Now</a></div></div></div>';
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

function embed(product_id){
  return getProduct(product_id).then(embedBox);
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
  embed:embed
}
