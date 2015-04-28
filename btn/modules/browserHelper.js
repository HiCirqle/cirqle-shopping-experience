function attachHandler(element, event, handler, bubble) {
  if(!bubble){
    bubble = false;
  }

  if(element.addEventListener){
    element.addEventListener(event, handler, bubble);
  } else if(element.attachEvent){
    element.attachEvent(event, handler, bubble);
  }
}

function isHidden(el) {
  try{
    var p = el;
    while(p){
      var style = window.getComputedStyle(p);
      if(style !== null && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === 0)){
        return true;
      }
      p = p.parentNode;
    }
    return false;

  }catch(e){
    return false;
  }

  // var style = window.getComputedStyle(el);
  // return (style.display === 'none' || style.visibility == 'hidden')
}


function getHeight(e){
  var height;
  if (e.currentStyle)
    height = e.currentStyle['height'];
  else if (window.getComputedStyle && e && e.nodeType)
    height = window.getComputedStyle(e,null).getPropertyValue('height');

  return height;
}

function getWidth(e){
  var width;
  if (e.currentStyle)
    width = e.currentStyle['width'];
  else if (window.getComputedStyle && e && e.nodeType)
    width = window.getComputedStyle(e,null).getPropertyValue('width');

  return width;
}

module.exports = {
  attachHandler:attachHandler,
  isHidden:isHidden,
  getHeight:getHeight,
  getWidth:getWidth,
}
