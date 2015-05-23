  // jquery_cdn = "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js";
  // web_component_cdn = "//cdn.cirqle.nl/polyfills/webcomponents.min.js";
  // iframe_src_url = iframe_origin+"/experience-test/iframecontent.html"; // test
  // apiDomain = "http = //54.73.226.47 = 9090"; //test
  // apiDomain = "http = //54.217.202.215 = 8080"; //live
function Config(id){
  this.blog_id = id;
  this.cdn_domain = "@@cdnHost";
  this.iframe_origin = this.cdn_domain; // domain name of iframecontent.html
  this.css_url = this.cdn_domain+"/button1/cirqle-style-general.css";
  this.iframe_src_url = this.iframe_origin+"@@iframeSrcUrl"; //live
  this.maxPostCount =  15;
  this.blogName = document.title;
  this.blogDomain = window.location.host;
  this.apiDomain = "https://api.cirqle.nl:8443"; //live
  this.segmentIOSwitch = true;
  this.isButtonLoaded = false;
  this.buttonText = "Shop this post";
  this.cirqle_getpost_by_url = this.apiDomain + "/api/1/blogs/{{blog_id}}/photos?tagged=true";
  this.cirqle_getPostid_by_blogid_url = this.apiDomain + "/api/1/posts/blog/{{blog_id}}";
  this.cirqle_getpost_by_postid_url = this.apiDomain + "/api/1/posts/{post_id}/blog/{{blog_id}}/photos?tagged=true";
  this.cirqle_getproduct_by_image = this.apiDomain + "/api/1/posts/products/full?url={{url}}&postId={{postId}}";
  this.shopbox_css_url = this.cdn_domain+"/button1/shopbox.css";
};

var config;

function setBlogId(id){
  config = new Config(id);
}

function get(name){
  if(!config || !config.blog_id) return "";
  return config[name] ? config[name].replace("{{blog_id}}", config.blog_id) : "";
}

function set(name, value){
  if(!config || !config.blog_id) return "";
  config[name] = value;
}

module.exports = {
  setBlogId:setBlogId,
  get:get,
  set:set
}
