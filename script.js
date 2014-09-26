function updateTimer(timeleft, negative) {
  var minutes = Math.floor(timeleft/60);
  var seconds = timeleft % 60;

  if(negative) $('#timer').css('color', '#c00');
  else $('#timer').css('color', '#333');

  $('#minutes').text(minutes);
  $('#seconds').text(('0' + seconds).slice(-2));
}

function restartAnimation(){
  $('.progress-bar').replaceWith($('.progress-bar').clone());
}

function changePlayPause(to){
  if(to == 'play'){
    $('#play-pause').attr('title', 'Play');
    $('#play-pause .glyphicon-pause').css('display', 'none');
    $('#play-pause .glyphicon-play').css('display', 'inline-block');
  } else if(to == 'pause'){
    $('#play-pause').attr('title', 'Pause');
    $('#play-pause .glyphicon-play').css('display', 'none');
    $('#play-pause .glyphicon-pause').css('display', 'inline-block');
  }
}

function Timer(duration, alarms){
  this.initduration = duration;
  this.duration = duration;
  this.durationms = duration * 1000;
  this.alarmno = 0;
  if(alarms){
    this.alarms = alarms;
  } else {
    this.alarms = [];
  }
  $('.progress-bar').css('animation-duration', duration + 's');
  updateTimer(this.duration);
}

var timer = new Timer(5 * 60, [4 * 60, 1 * 60]);

Timer.prototype.play = function(){
  if(this.nowms == 'reset'){
    restartAnimation();
    this.duration = this.initduration;
    this.durationms = this.duration * 1000;
    this.alarmno = 0;
  } else if(this.nowms < this.durationms) {
    this.duration = this.now;
    this.durationms = this.nowms;
  }

  this.start = new Date().getTime();

  var that = this;

  this.interval = setInterval(function() {
    that.nowms = that.durationms-(new Date().getTime()-that.start);
    that.now = Math.ceil(that.nowms/1000);
    if(that.nowms <= that.alarms[that.alarmno] * 1000){
      //alert("alarm, yo");
      // TODO: do something to signify the alarm, like play a sound
      that.alarmno++;
    }
    if(that.nowms <= 0) {
      updateTimer(that.now * -1, true);
      $('.progress-bar').css('animation-play-state', 'paused');
    }
    else {
      updateTimer(that.now);
    }
  },1);
}

Timer.prototype.pause = function(){
  window.clearInterval(this.interval);
}

Timer.prototype.reset = function(){
  restartAnimation();
  window.clearInterval(this.interval);
  updateTimer(this.initduration);
  this.nowms = 'reset';
  $('.progress-bar').css('animation-play-state', 'paused');
  changePlayPause('play');
}

$('#play-pause').click(function(){
  if($(this).attr('title') == 'Play'){
    timer.play();
    $('.progress-bar').css('animation-play-state', 'running');
    changePlayPause('pause');
  } else {
    timer.pause();
    $('.progress-bar').css('animation-play-state', 'paused');
    changePlayPause('play');
  }
});

$('#reset').click(function(){
  timer.reset();
});

$('#set-timer').click(function(){
  timer = new Timer(Math.floor(window.prompt('Enter a duration in seconds:')));
});

$('#set-motion').click(function(){
  $('#motion').text(window.prompt('Enter a motion:'));
});

var socket = io('http://'+window.location.hostname);
socket.on('play-pause', function(){
  $('#play-pause').click();
});
socket.on('reset', function(){
  $('#reset').click();
});
