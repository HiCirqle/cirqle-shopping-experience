var cqjq = require('jquery');

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

module.exports = getNodePosition;
