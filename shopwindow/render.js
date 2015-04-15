var cq_getproduct_url = "http://54.217.202.215:8080/api/1/posts/products/full";

function updatePrimaryProduct(data){

    var part1 = '<div class="product"><a href="{{productUrl}}" target="_blank"><div class="productImage productImageHeight" style="background-image: url({{imageLargeUrl}});"></div></a></div>';
    var part2 = '<div class="secondBox secondBoxFontSize"><span class="productName productNameFontSize">{{name}}</span><span class="productPrice productPriceFontSize">{{#checkCurrency}} {{currency}} {{/checkCurrency}} {{#checkPrice}} {{price}} {{/checkPrice}}</span></div><div class="divider"></div><div class="secondBox"><a href="{{productUrl}}" id="buybtn" target="_blank"><span class="secondBoxBuyButton">{{#shortenTitle}} {{brand}} {{/shortenTitle}}</span></a></div><div class="divider"></div><div class="secondBox secondBoxFontSize description"><span class="productInformation productInformationFontSize">Product information</span><div class="secondBoxOuterScroll"><div class="secondBoxInnerScroll"><span class="productDesc productDescFontSize">{{description}}</span></div></div></div>';

	var mainProduct = data;

	mainProduct.checkCurrency = function(){
        return function (text, render) {
			return this.currency || "$";
		}
	};			

	mainProduct.checkPrice = function(){
		return function (text, render) {	
			return this.price || "";	
		}
	};

	mainProduct.shortenTitle = function(){
		return function (text, render) {
			
			var button_title = (this.brand) ? "BUY AT " + String(this.brand).toUpperCase() : "BUY";
			// button_title = shortenString(button_title,15,"...");
			return render(button_title);
		}
	};

	var html1 = Mustache.render(part1, mainProduct);
	var html2 = Mustache.render(part2, mainProduct);
	$('#cq-dialog-purchase-content #part1').html(html1);
	$('#cq-dialog-purchase-content #part2').html(html2);

    //track product view
    trackProductView(data.id, postId);

    // fade in main image
    $('div.productImage').css({visibility:"hidden"});
    var src = $('div.productImage').css('background-image');
    var url = src.match(/\((.*?)\)/)[1].replace(/('|")/g,'');
    var img = new Image();

    attachHandler(img, 'load', function(){
        $('div.productImage').css({opacity: 0, visibility: "visible"}).animate({opacity: 1}, 1000);
    });

    img.src = url;
    // fail-safe for cached images which sometimes don't trigger "load" events
    if (img.complete){
        // img.load();
        $('div.productImage').css({opacity: 0, visibility: "visible"}).animate({opacity: 1}, 1000);
    }

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

function generateSlider(products){
    var imgdiv_queue = new Array();

	for(var i = 0; i<products.length; i++){
        var otherProduct = products[i];
        var img = document.createElement("div");
        img.style.backgroundImage = "url("+otherProduct.imageSmallUrl+")";
        img.className = "sliderImage sliderImageSize";
        
        // var link = document.createElement("a");
        // link.href = "javascript: void(0);";
        // link.appendChild(img);
        document.getElementById('productSlider').appendChild(img);
        imgdiv_queue.push(img);
        registerLinkClickedUpdateContentEvent(img, otherProduct);

    }

    // fade in list of product image

    fadeImage(imgdiv_queue.shift());
    
    function fadeImage(imgdiv){
        
        imgdiv = $(imgdiv);
        var src = imgdiv.css('background-image');
        var url = src.match(/\((.*?)\)/)[1].replace(/('|")/g,'');
        
        var img = new Image();
        
        attachHandler(img, 'load', function(){
            imgdiv.css({opacity: 0, visibility: "visible"}).animate({opacity: 1}, 500);
            if(imgdiv_queue.length > 0 ){fadeImage(imgdiv_queue.shift())}
        });

        img.src = url;

        // fail-safe for cached images which sometimes don't trigger "load" events
        if (img.complete){
            // img.load();
            imgdiv.css({opacity: 0, visibility: "visible"}).animate({opacity: 1}, 500);
        }
    }

    
}

// callback from the product in the slider
var registerLinkClickedUpdateContentEvent  = function(link, product){
    attachHandler(link, "click", function(){
        updatePrimaryProduct(product);   
    });
    
}

var trackProductView = function(productId, postId){
    var message = JSON.stringify({
        productId: productId, 
        postId: postId
    });

    parent.postMessage(message, "*");
}

function attachHandler(element, event, handler) {
    if(element.addEventListener){
        element.addEventListener(event, handler, false);
    } else if(element.attachEvent){
        element.attachEvent(event, handler, false);
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

function generateHash(bloggerId,blogId,imageUrl,postId){
    var url = "http://54.73.226.47:8080/tracking/generate?postId="+postId+"&imageUrl="+imageUrl+"&blogId="+blogId+"&bloggerId="+bloggerId;
    return $.getJSON(url);
}

function sendBuyTrack(trackObj){
    var url = "http://54.217.202.215:8080/api/1/blogs/"+trackObj.blogId+"/"+encodeURIComponent(trackObj.imageUrl)+"/clicked?hash="+trackObj.hash;
    return $.getJSON(url);
}

function buyTrack(bloggerId, blogId, imageUrl, postId){
    generateHash(bloggerId, blogId, imageUrl, postId).then(function(data){
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

    imageUrl = getUrlParameters("imageurl", "", true);
    bloggerId = getUrlParameters("bloggerid", "", true);
    blogId = getUrlParameters("blogid", "", true);
    postId = getUrlParameters("postid", "", true);

    $('body').on('click', 'a#buybtn', function() {
        buyTrack(bloggerId,blogId,imageUrl,postId);
    });

    getProducts(imageUrl, function(data){
        console.log(data);
        updatePrimaryProduct(data[0]);
        generateSlider(data);

        $("#productSlider").mCustomScrollbar({
            theme:"minimal", 
            axis:"x", 
            advanced:{autoExpandHorizontalScroll:true}
        }); 
    });

});




