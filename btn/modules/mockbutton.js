var $ = require('jquery');

function getImage(blogid){
  var apiUrl = "https://api.cirqle.nl:8443/api/1/blogs/"+blogid+"/photos?tagged=true";
  return $.getJSON(apiUrl);
}

function appendImage(blogid){
  getImage(blogid).then(function(images){
    images.map(function(url){
      $('body').append('<img class="mockimage" style="width:500px" src="'+url+'">').append('<br>');
    })
  });
}

module.exports = appendImage;
