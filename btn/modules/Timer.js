// small timer object
function Timer(){
  this.start = function(){
    this.startTime = new Date();
  };
  this.end = function(cb){
    if(!(this.startTime && this.startTime instanceof Date)){cb(false)};

    var end = new Date();
    cb(end.getTime() - this.startTime.getTime());
  };
}

module.exports = Timer;
