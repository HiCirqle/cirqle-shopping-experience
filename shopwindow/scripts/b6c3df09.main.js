// var domain = "http://54.73.226.47:9090"
var domain = "https://api.cirqle.nl:8443";
var cq_getproduct_url = domain + "/api/1/posts/products/full";

function updateProduct(data){
  if(!data || (data&&data instanceof Array&&data.length < 1)){
    var emptyProductTemplate = '<div class="product"><div class="product__content"><h3 class="product__title" style="padding: 63px;font-weight: 900;font-size: 20px;text-align: center;">Sorry, the product is not available at the moment</h3></div></div>';
    $('#product_container').html(emptyProductTemplate);
    return;
  }

// href="http://www.facebook.com/sharer.php?u={$url}&media={$imgPath}&description={$desc}

    var fb_share = 'http://www.facebook.com/sharer.php?u='+postUrl;
    var tweet = 'https://twitter.com/intent/tweet?status='+encodeURI('Come shop with @HiCirqle! '+postUrl);
    var mailto = 'mailto:?Subject='+encodeURI('Come shop with Cirqle!')+'&body='+encodeURI('Come shop with Cirqle! '+postUrl);

    var productTemplate = "{{#products}}<div class=product><div class=product__content><div class=product__img style=background-image:url({{imageLargeUrl}})>{{#showProductImpressionUrl}}{{/showProductImpressionUrl}}</div><div class=product__desc><h3 class=product__title><a href=#>{{name}}</a></h3><h4 class=product__brand>{{brand}}</h4><p>{{description}}</p></div></div><div class=product__footer><div class=product__share><a href='"+fb_share+"' target=_blank><div class='icon fb'></div></a> <a href='"+tweet+"' target=_blank><div class='icon twitter'></div></a></div><div class=price__buy><div class=product__price>{{#checkCurrency}}  {{/checkCurrency}} {{#checkPrice}}  {{/checkPrice}}</div><a class='product__btn {{#availabilityClass}}{{/availabilityClass}}' href={{productUrl}} target=_blank data-advertiserid={{advertiserId}} data-id={{id}}><div class='shop__btn__label {{#availabilityClass}}{{/availabilityClass}}'>{{#shortenTitle}} {{brand}} {{/shortenTitle}}</div></a></div></div></div>{{/products}}";

	var mainProduct = {products:data};

	mainProduct.checkCurrency = function(){
        return function (text, render) {
            var currency = this.preferredCurrency || this.currency;
            if(!this.price && currency){
                currency = "";
            }
            else if(!currency){
                currency = "$"
            }

			return currency;
		}
	};

	mainProduct.checkPrice = function(){
		return function (text, render) {
            var price = String(parseFloat(this.priceInPreferredCurrency).toFixed(2)) || this.price || "";
            var currency = this.currency || "";

            price = price.replace(currency, "").replace(".", ",");
			return price;
		}
	};

  mainProduct.availabilityClass = function(){
  		return function (text, render) {
        console.log(this.expired);
        if(typeof this.expired === "boolean" && this.expired === true) return render("unavailable");
  		}
  }

	mainProduct.shortenTitle = function(){
		return function (text, render) {

			// var button_title = (this.brand) ? "Buy at <strong>" + String(this.brand).toUpperCase() + "</strong>" : "Buy";
			var button_title = "<strong>Shop product</strong>";
      if(typeof this.expired === "boolean" && this.expired === true)
        button_title = "<strong>Out of stock</strong>";
			return render(button_title);
		}
	};

	mainProduct.showProductImpressionUrl = function(){
		return function (text, render) {
      var impressionUrl = this.productUrl;
      if(typeof this.productViewUrl !== "undefined"){
        impressionUrl = this.productViewUrl;
      }else{
        if(impressionUrl.indexOf('ad.zanox.com/ppc') > -1)
          impressionUrl = impressionUrl.replace('ad.zanox.com/ppc', 'ad.zanox.com/ppv');
      }
			var impressionPixel = "<img src='"+impressionUrl+"' style='display:none'>";
			return render(impressionPixel);
		}
	};

	var html = Mustache.render(productTemplate, mainProduct);
  $('#product_container').html(html);
    //track product view
  data.forEach(function(p){
    console.log(p.id);
    trackProductView(p.id, postId);
  })

}

function shortenString(str, limit, trailling){
    trailling = trailling || "...";
    limit = limit || str.length;

    if(limit > trailling.length){
       limit = limit-trailling.length;
    }else{
        return trailling;
    }

    return (str.length > limit) ? str.substring(0, limit)+trailling : str;
}

var trackProductView = function(productId, postId){
    var message = JSON.stringify({
        action: 'productView',
        productId: productId,
        postId: postId
    });
    console.log(message);
    parent.postMessage(message, "*");
}

function attachHandler(element, event, handler, isCapture) {
    if(!isCapture){
        isCapture = false;
    }

    if(element.addEventListener){
        element.addEventListener(event, handler, isCapture);
    } else if(element.attachEvent){
        element.attachEvent(event, handler, isCapture);
    }
}

function getUrlParameters(parameter, staticURL, decode){
   /*
    Function: getUrlParameters
    Description: Get the value of URL parameters either from
                 current URL or static URL
    Author: Tirumal
    URL: www.code-tricks.com
   */
   var currLocation = (staticURL.length)? staticURL : window.location.search,
       parArr = currLocation.split("?")[1].split("&"),
       returnBool = true;

   for(var i = 0; i < parArr.length; i++){
        parr = parArr[i].split("=");
        if(parr[0] == parameter){
            return (decode) ? decodeURIComponent(parr[1]) : parr[1];
            returnBool = true;
        }else{
            returnBool = false;
        }
   }

   if(!returnBool) return false;
}

function getProducts(imgurl, cb){

    var url = cq_getproduct_url+"?url="+imgurl+"&postId="+postId+'&callback=?';

    $.ajax({
        url: url,
        dataType: 'json',
        success: function(results){
            cb(results);
        },
        error: function(request, status, err){
            console.log(status)
            cb([]);
        }
    });
}

function getHashes(data){
    var promises = data.map(getHash);

    return jQuery.when.apply(jQuery, promises).then(function(/* posts... */) {
        return jQuery.makeArray(arguments);
    })
    .progress(function(data){
      console.log('progrss', data);
    });
}

function getHash(data){
    var url = domain + "/tracking/generate?productId="+data.id+"&advertiserId="+data.advertiserId+"&postId="+postId+"&imageUrl="+encodeURIComponent(imageUrl)+"&blogId="+blogId+"&bloggerId="+bloggerId;
    return $.getJSON(url+'&callback=?').then(function(hash){
        data.productUrl = data.productUrl+"&memberId="+hash.code+"&clickref="+hash.code+"&zpar0="+hash.code+"&u1="+hash.code;
        return data;
    });
}

function generateHash(bloggerId,blogId,imageUrl,postId,advertiserId,id){
    var url = domain + "/tracking/generate?productId="+id+"&advertiserId="+advertiserId+"&postId="+postId+"&imageUrl="+encodeURIComponent(imageUrl)+"&blogId="+blogId+"&bloggerId="+bloggerId;
    return $.getJSON(url+'&callback=?');
}

function sendBuyTrack(trackObj){
	// eg domain + /api/1/blogs/clicked?hash=a60d9e27
    var url = domain + "/api/1/blogs/clicked?hash="+trackObj.hash;
    return $.getJSON(url+'&callback=?');
}

function buyTrack(bloggerId, blogId, imageUrl, postId, advertiserId, id, blogDomain, postUrl){
    generateHash(bloggerId, blogId, imageUrl, postId, advertiserId, id).then(function(data){
        var obj = {
            hash: data.code,
            blogId: blogId,
            imageUrl: imageUrl
        }
        sendBuyTrack(obj).done(function(){
            console.log("buy action tracked");
        })
    });

    var message = JSON.stringify({
        action: 'affiliateClick',
        blogDomain: blogDomain,
        productId: id,
        postUrl: postUrl
    });
    console.log(message);
    parent.postMessage(message, "*");
}

$(document).ready(function() {

	var closeBtn = document.getElementById("closeBtn");
	attachHandler(closeBtn, "click", function(){
		//ask parent to close the shopwindow
	    parent.postMessage('cqCloseShopWindow', "*");
	});

    var greyArea = document.getElementsByTagName('html')[0];
    attachHandler(greyArea, "click", function(e){
        if(e.target.tagName == "BODY" || e.target.tagName == "HTML"){
            //ask parent to close the shopwindow
            parent.postMessage('cqCloseShopWindow', "*");
        }
    }, true);

    imageUrl = getUrlParameters("imageurl", "", true);
    bloggerId = getUrlParameters("bloggerid", "", true);
    blogId = getUrlParameters("blogid", "", true);
    postId = getUrlParameters("postid", "", true);
    blogName = getUrlParameters("blogname", "", true);
    blogDomain = getUrlParameters("blogdomain", "", true);
    postUrl = getUrlParameters("posturl", "", true);

    console.log(postUrl);

    $('#blogName').html(blogName);
    $('#blogDomain').html(blogDomain);

    $('body').on('click', 'a.product__btn', function() {
    	var advertiserId = $(this).data('advertiserid');
    	var id = $(this).data('id');
        buyTrack(bloggerId,blogId,imageUrl,postId,advertiserId,id, blogDomain, postUrl);
    });


    $('body').on('click', '.product__share > .js', function(e) {
        $(this).find('ul').slideToggle(100);
        $(this).find('.clicker').toggleClass('active');
        e.stopPropagation();
    });

    $(document).click(function() {
        if ($('.product__share .js ul').is(':visible')) {
          $('.product__share .js ul', this).slideUp();
          $('.clicker').removeClass('active');
        }
    });

    getProducts(imageUrl, function(data){
        getHashes(data).then(function(dataWithHash){
            console.log(data);
            console.log(dataWithHash);
            updateProduct(dataWithHash);
        });

    });

});
