var $ = require('jquery');

function getImage(blogid){
  var apiUrl = "https://api.cirqle.nl:8443/api/1/blogs/"+blogid+"/photos?tagged=true";
  return $.getJSON(apiUrl);
}

function appendImage(blogid, imageCount){
  var counter = 0;
  $('body').append('<div class=container></div>');
  return getImage(blogid).then(function(images){
    images.forEach(function(url){
      if(imageCount && counter >= imageCount) return;
      $('body').append('<span>This is a image element</span><br><img class="mockimage" style="width:500px" src="'+url+'">').append('<br>');
      counter++;
      // $('.container').append('<span>This is a DIV element</span><br><div class="mockimage" style="height: 500px; width:500px; background-image:url('+url+'); background-repeat: no-repeat; background-size: contain;">').append('<br>');
    })
  });
}

module.exports = appendImage;
