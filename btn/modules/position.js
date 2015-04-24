var cqjq = require('jquery');
var highestZIndex = require('../modules/highestZIndex');
var browserHelper = require('../modules/browserHelper');
var isHidden = browserHelper.isHidden;

function positionButtonRelative(imgNode, btnNode, button){
  btnNode.className = "cirqle-outer-button";
  cqjq(btnNode).hide(); // must hide it in order to get the computed dimension

  var offsetFromBottomRight = 15;
  var btnHeight = parseInt(cqjq(btnNode).css('height'));
  var btnWidth = parseInt(cqjq(btnNode).css('width'));
  cqjq(btnNode).show();

  var buttonTop = offsetFromBottomRight + btnHeight; // button height 32px/32px
  var buttonRight = offsetFromBottomRight; // button width 131px/66px

  btnNode.style.zIndex = "102";
  btnNode.style.position = "relative";
  btnNode.style.height = "0px";
  imgNode.parentNode.appendChild(btnNode); //append outer button

  button.style.position = "absolute";
  button.style.top = "-"+buttonTop+"px";
  button.style.right = buttonRight+"px";

  return btnNode;
}

function positionButtonAbsolute(imgNode, btnNode){
  btnNode.className = "cirqle-outer-button";
  cqjq(btnNode).hide(); // must hide it in order to get the computed dimension

  var offsetFromBottomRight = 15;
  var imgPos = getNodePosition(imgNode);
  var btnHeight = parseInt(cqjq(btnNode).css('height'));
  var btnWidth = parseInt(cqjq(btnNode).css('width'));
  cqjq(btnNode).show();

  //ipad and tablet shows desktop button
  var imgNodeHeight = imgNode.height || getHeight(imgNode);
  var imgNodeWidth = imgNode.width || getWidth(imgNode);
  var buttonTop = imgPos[0] + parseFloat(imgNodeHeight) - offsetFromBottomRight - btnHeight; // button height 32px/32px
  var buttonLeft = imgPos[1] + parseFloat(imgNodeWidth) - offsetFromBottomRight - btnWidth; // button width 131px/66px

  var current = parseInt(cqjq(btnNode).css("z-index"), 10);
  var zIndex = highestZIndex(0, btnNode)+100;
  // console.log(btnNode);
  // console.log(zIndex);
  // console.log(current);
  btnNode.style.zIndex = zIndex;
  // if(isNaN(current)){
  // }

  btnNode.className = "cirqle-outer-button";
  btnNode.style.position = "absolute";
  btnNode.style.top = buttonTop+"px";
  btnNode.style.left = buttonLeft+"px";

  return btnNode;
}

function getHeight(e){
  if (e.currentStyle)
    height = e.currentStyle['height'];
  else if (window.getComputedStyle && e && e.nodeType)
    height = window.getComputedStyle(e,null).getPropertyValue('height');
  else
    height = 0;
  return height;
}

function getWidth(e){
  if (e.currentStyle)
    width = e.currentStyle['width'];
  else if (window.getComputedStyle && e && e.nodeType)
    width = window.getComputedStyle(e,null).getPropertyValue('width');
  else
    width = 0;
  return width;
}

function getNodePosition(node) {
  var offset = cqjq(node).offset();
  var top = parseInt(offset.top);
  var left = parseInt(offset.left);
  if(cqjq('body').css('position') == 'relative'){
    var body = cqjq('body').offset();
    left -= parseInt(body.left);
    top -= parseInt(body.top);
  }

  return [top, left];
}

function repositionButton(){
  var buttons = buttonSingleton.getAllButtons();
  if(buttons.length === 0){return;};

  for(var i=0; i < buttons.length; i++){
    btnObj = buttons[i];
    if(btnObj.btn.style.position == "relative"){
      continue; // exclude button posistioned by relative
    }
    else if(isHidden(btnObj.img)){
      cqjq(btnObj.btn).hide();
      continue;
    }
    else{
      // if(isMoved(btnObj.img) || isMoved(btnObj.btn)){
      positionButtonAbsolute(btnObj.img, btnObj.btn);
      // }
    }
  }
}

module.exports = {
  repositionButton:repositionButton,
  positionButtonAbsolute:positionButtonAbsolute,
  positionButtonRelative:positionButtonRelative,
  getNodePosition:getNodePosition
}
