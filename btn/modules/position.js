var cqjq = require('jquery');
var highestZIndex = require('highestZIndex');
var browserHelper = require('browserHelper');
var isHidden = browserHelper.isHidden;
var isCovered = browserHelper.isCovered;
var getHeight = browserHelper.getHeight;
var getWidth = browserHelper.getWidth;
var attachHandler = browserHelper.attachHandler;
var detachHandler = browserHelper.detachHandler;

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

function positionButtonAbsolute(imgNode, btnNode, adjustZIndex){
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

  if(!adjustZIndex) adjustZIndex = true;

  if(adjustZIndex){
    var current = parseInt(cqjq(btnNode).css("z-index"), 10);
    var zIndex = highestZIndex(0, btnNode);
    /*console.log('positionButtonAbsolute', zIndex);*/
    // zIndex+=100;
    if(zIndex === 0) zIndex = highestZIndex(0, imgNode);
    if(zIndex === 0) zIndex = 1; // if it's still zero
    btnNode.style.zIndex = zIndex;
  }

  // console.log(btnNode);
  // console.log(zIndex);
  // console.log(current);
  // if(isNaN(current)){
  // }

  btnNode.className = "cirqle-outer-button";
  btnNode.style.position = "absolute";
  btnNode.style.top = buttonTop+"px";
  btnNode.style.left = buttonLeft+"px";

  return btnNode;
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

function repositionButton(buttonSingleton, adjustZIndex){
  if(!buttonSingleton) return;
  var buttons = buttonSingleton.getAllButtons();
  if(buttons.length === 0){return;};

  for(var i=0; i < buttons.length; i++){
    var btnObj = buttons[i];
    if(btnObj.btn.style.position == "relative"){
      continue; // exclude button posistioned by relative
    }
    else if(isHidden(btnObj.img)){
      cqjq(btnObj.btn).hide();
      continue;
    }
    else{
      // if(isMoved(btnObj.img) || isMoved(btnObj.btn)){
      positionButtonAbsolute(btnObj.img, btnObj.btn, adjustZIndex);
      // }
    }

    // var isButtonCovered =  isCovered(btnObj.img);
    var isImageHidden =  isHidden(btnObj.img);
    if(isImageHidden){
      console.log('hide button');
      cqjq(btnObj.btn).hide();
    }
  }
}

function calibrateZindexOnScroll(el){
  var onScrollEventHandler = function(){
    el.style.zIndex = highestZIndex(0, el)+2;
  };

  attachHandler(window, 'scroll', onScrollEventHandler);
}

function isMoved(el){
  var offset = getNodePosition(el);
  return (Math.abs(offset[0] - el.absoluteTop) > 0) || (Math.abs(offset[1] - el.absoluteLeft) > 0) || (Math.abs(el.height - el.previousHeight) > 0) || (Math.abs(el.width - el.previousWidth) > 0);
}

module.exports = {
  repositionButton:repositionButton,
  positionButtonAbsolute:positionButtonAbsolute,
  positionButtonRelative:positionButtonRelative,
  getNodePosition:getNodePosition,
  calibrateZindexOnScroll:calibrateZindexOnScroll,
  isMoved:isMoved
}
