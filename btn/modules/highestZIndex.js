var cqjq = require('jquery');
var findIntersector = require('findIntersector');

function highestZIndex(defaultIndex, btn){
  var highest = defaultIndex;
  if(!highest){highest = 8;} // becasue blogger image slider is 10

  highest = Math.max.apply(null,cqjq.map(cqjq('body *'), function(e,n){
      var current = cqjq(e).css("z-index");
      current = parseInt(Number(current), 10);

      var position = cqjq(e).css("position");
      var isVisible = cqjq(e).is(":visible");
      var className = cqjq(e).attr("class");
      var id = cqjq(e).attr("id");
      // console.log(cqjq(e));
      if(current && !isNaN(current) && position && position != "static" && isVisible && className != "cirqle-outer-button" && id != "cq-shopwindow"){
        if (!btn) {
          return current;
        }
        cqjq(btn).hide();
        var intersect = findIntersector(e, btn);
        cqjq(btn).show();
        if(intersect.length > 0){
            // console.log("highestZIndex",current);
            return current;
        }
        else{
            // console.log("highestZIndex",defaultIndex);
            return defaultIndex;
        }
      }else{
          // console.log("highestZIndex",defaultIndex);
          return defaultIndex;
      }
  }));

  return highest;
}

module.exports = highestZIndex;
