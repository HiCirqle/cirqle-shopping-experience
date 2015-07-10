// small timer object
function Timer(){
  this.start = function(){
    this.startTime = new Date();
  };
  this.end = function(cb){
    if(!(this.startTime && this.startTime instanceof Date)){cb(false)};

    var end = new Date();
    var diff = 0;
    try {
      diff = end.getTime() - this.startTime.getTime();
    } catch (e) {} finally {
      cb(diff);
    }
  };
}

module.exports = Timer;
