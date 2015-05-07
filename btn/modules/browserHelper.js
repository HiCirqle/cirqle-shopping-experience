var cqjq = require('jquery');
var findIntersector = require('findIntersector');

function attachHandler(element, event, handler, bubble) {
  if(!bubble){
    bubble = false;
  }

  if(element.addEventListener){
    element.addEventListener(event, handler, bubble);
  } else if(element.attachEvent){
    element.attachEvent('on'+event, handler, bubble);
  }
}

function detachHandler(element, event, handler, bubble) {
  if(!bubble){
    bubble = false;
  }

  if(element.removeEventListener){
    element.removeEventListener(event, handler, bubble);
  } else if(element.attachEvent){
    element.detachEvent('on'+event, handler, bubble);
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

function arr_diff(a1, a2){
  var a=[], diff=[];

  for(var i=0;i<a1.length;i++)
    a[a1[i]]=true;

  for(var i=0;i<a2.length;i++)
    if(a[a2[i]]) delete a[a2[i]];
    else a[a2[i]]=true;

  for(var k in a)
    diff.push(k);

  return diff;
}

function iframeRef( frameRef ) {
  return frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument;
}

function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
}

function getScrollPositionXY(){
  var xscroll = (document.all ? document.scrollLeft : window.pageXOffset);
  var yscroll = (document.all ? document.scrollTop : window.pageYOffset);

  return [xscroll, yscroll];
}

function isElementInViewport(el){

  //special bonus for those using cqjq
  if (el instanceof cqjq) {
    el = el[0];
  }

  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}

// https://github.com/brandonaaron/jquery-overlaps/blob/master/jquery.overlaps.js
function getDims(elems) {
    var dims = [], i = 0, offset, elem;

    while ((elem = elems[i++])) {
        offset = cqjq(elem).offset();
        dims.push([
            offset.top,
            offset.left,
            elem.offsetWidth,
            elem.offsetHeight,
            elem
        ]);
    }

    return dims;
}
function checkIsWithin(dims1, dims2){
    var x1 = dims1[1], y1 = dims1[0],
        w1 = dims1[2], h1 = dims1[3],
        x2 = dims2[1], y2 = dims2[0],
        w2 = dims2[2], h2 = dims2[3];

    // if(dims2[4].className === "container") console.log(dims1, dims2);
    return (x1 >= x2 && y1 >= y2 && x1+w1 <= x2+w2 && y1+h1 <= y2+h2);
}

function checkIsDescendant(dims1, dims2){
    var e1 = dims1[4], e2 = dims2[4];

    return cqjq.contains(e2, e1);
}

function checkOverlap(dims1, dims2) {
    var x1 = dims1[1], y1 = dims1[0],
        w1 = dims1[2], h1 = dims1[3],
        x2 = dims2[1], y2 = dims2[0],
        w2 = dims2[2], h2 = dims2[3];
    return !(y2 + h2 <= y1 || y1 + h1 <= y2 || x2 + w2 <= x1 || x1 + w1 <= x2);
}

function isCovered(el){
  var dim1 = getDims(cqjq(el))[0], dim2,
      allElementDims = getDims(cqjq('body *').not('[class^="cirqle"],[class^="cq-shopwindow"],svg,path,[data-cq-uuid]')),
      isCover = false, isOverLap = false, isWithin = false, isDescendant = false;

  for(var i=0; i<allElementDims.length; i++){
    dim2 = allElementDims[i];
    // skip same element comparison
    if(dim1[4] === dim2[4]){
      // console.log(dim1[4], dim2[4], isDescendant);
      continue;
    }
    isDescendant = checkIsDescendant(dim1, dim2)
    isOverLap = checkOverlap(dim1, dim2);
    isWithin = checkIsWithin(dim1, dim2);
    // if(dim2[4].className) console.log(dim2[4].className);
    if(isOverLap && !isDescendant) console.log(isOverLap, isDescendant, dim1[4], dim2[4]);
    // if(isOverLap && !isWithin || isOverLap && isWithin && !isDescendant) break;
    if(isOverLap && !isDescendant) break;
  }
  return isOverLap;
}

module.exports = {
  attachHandler:attachHandler,
  detachHandler:detachHandler,
  isHidden:isHidden,
  getHeight:getHeight,
  getWidth:getWidth,
  arr_diff:arr_diff,
  iframeRef:iframeRef,
  isElement:isElement,
  getScrollPositionXY:getScrollPositionXY,
  isElementInViewport:isElementInViewport,
  isCovered:isCovered
}
