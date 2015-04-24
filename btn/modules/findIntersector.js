var cqjq = require('jquery');

function findIntersector(targetSelector, intersectorsSelector) {
  var intersectors = [];

  var $target = cqjq(targetSelector);
  var tAxis = $target.offset();
  var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
  var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

  cqjq(intersectorsSelector).each(function() {
        var $this = cqjq(this);
        var thisPos = $this.offset();
        var i_x = [thisPos.left, thisPos.left + $this.outerWidth()];
        var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

        if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
             t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
            intersectors.push($this);
        }

  });
  return intersectors;
}

module.exports = findIntersector;
