var cq_getproduct_url = "http://54.217.202.215:8080/api/1/posts/products/full";

function updateProduct(data){
// href="http://www.facebook.com/sharer.php?u={$url}&media={$imgPath}&description={$desc}

    var fb_share = 'http://www.facebook.com/sharer.php?u='+postUrl;
    var tweet = 'https://twitter.com/intent/tweet?status='+encodeURI('Come shop with us! '+postUrl);
    var mailto = 'mailto:?Subject='+encodeURI('Come shop with us!')+'&body='+encodeURI('Come shop with us! '+postUrl);

    var productTemplate = "{{#products}}<div class=product><div class=product__img style=background-image:url({{imageSmallUrl}})></div><div class=product__share><ul class=js><li><a class=clicker href='javascript:void(0);'>Share</a><ul style='display:none'><li><a href='"+fb_share+"' target=_blank>Facebook</a></li><li><a href='"+tweet+"'  target=_blank>Twitter</a></li><li><a href='"+mailto+"'>Mail</a></li></ul></li></ul></div><div class=product__desc><h3 class=product__title><a href=#>{{name}}</a></h3><h4 class=product__brand>{{brand}}</h4><p>{{description}}</p></div><div class=product__footer><div class=product__price>{{#checkCurrency}} {{currency}} {{/checkCurrency}} {{#checkPrice}} {{price}} {{/checkPrice}}</div><a class=product__btn href={{productUrl}} target='_blank' data-advertiserid={{advertiserId}} data-productid={{productId}}>{{#shortenTitle}} {{brand}} {{/shortenTitle}}</a></div></div>{{/products}}";

	var mainProduct = {products:data};

	mainProduct.checkCurrency = function(){
        return function (text, render) {
            var currency = this.currency;
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
            var price = this.price || "";
            var currency = this.currency || "";

            price = price.replace(currency, "");
			return price;	
		}
	};

	mainProduct.shortenTitle = function(){
		return function (text, render) {
			
			var button_title = (this.brand) ? "Buy at <strong>" + String(this.brand).toUpperCase() + "</strong>" : "Buy";
			return render(button_title);
		}
	};

	var html = Mustache.render(productTemplate, mainProduct);
    $('#product_container').html(html);
    // $('body').on('click', 'a.product__btn', function(e) {
    //     // Create link in memory
    //     var a = window.document.createElement("a");
    //     a.target = '_blank';
    //     a.href = $(this).attr('href');

    //     // Dispatch fake click
    //     var e = window.document.createEvent("MouseEvents");
    //     e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    //     a.dispatchEvent(e);
    // });

    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // }

    //track product view
    trackProductView(data.id, postId);

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
        productId: productId, 
        postId: postId
    });

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

    var url = cq_getproduct_url+"?url="+imgurl+"&maxResults=20"+"&postId="+postId;

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
    });
}

function getHash(data){
    var url = "http://54.217.202.215:8080/tracking/generate?productId="+data.productId+"&advertiserId="+data.advertiserId+"&postId="+postId+"&imageUrl="+encodeURIComponent(imageUrl)+"&blogId="+blogId+"&bloggerId="+bloggerId;
    return $.getJSON(url).then(function(hash){
        data.productUrl = data.productUrl+"&memberId="+hash.code+"&clickref="+hash.code;
        return data;
    });
}

function generateHash(bloggerId,blogId,imageUrl,postId,advertiserId,productId){
    var url = "http://54.217.202.215:8080/tracking/generate?productId="+productId+"&advertiserId="+advertiserId+"&postId="+postId+"&imageUrl="+encodeURIComponent(imageUrl)+"&blogId="+blogId+"&bloggerId="+bloggerId;
    return $.getJSON(url);
}

function sendBuyTrack(trackObj){
	// eg. http://54.217.202.215:8080/api/1/blogs/clicked?hash=a60d9e27
    var url = "http://54.217.202.215:8080/api/1/blogs/clicked?hash="+trackObj.hash;
    return $.getJSON(url);
}

function buyTrack(bloggerId, blogId, imageUrl, postId, advertiserId, productId){
    generateHash(bloggerId, blogId, imageUrl, postId, advertiserId, productId).then(function(data){
        var obj = {
            hash: data.code, 
            blogId: blogId, 
            imageUrl: imageUrl
        }
        sendBuyTrack(obj).done(function(){
            console.log("buy action tracked");
        })
    });
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

    console.log(postId);

    $('#blogName').html(blogName);
    $('#blogDomain').html(blogDomain);

    $('body').on('click', 'a.product__btn', function() {
    	var advertiserId = $(this).data('advertiserid');
    	var productId = $(this).data('productid');
        buyTrack(bloggerId,blogId,imageUrl,postId,advertiserId,productId);
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




