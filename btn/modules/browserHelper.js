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

module.exports = {
  attachHandler:attachHandler,
  isHidden:isHidden
}
