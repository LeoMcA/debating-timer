function centreVertically(){
  var margin = ($(window).height() - $('.progress').outerHeight())/2 + $('.container').offset().top - $('.progress').offset().top;
  if(margin < 0) margin = 0;
  $('.container').css('margin-top', margin);
}
centreVertically();

$(window).resize(centreVertically);

function centreHorizontally(){
  $('#minutes').css('padding-left', $('.unit:last').outerWidth() + 20);
}
centreHorizontally();

$(window).resize(centreHorizontally);

function updateTimer(timeleft, negative){
  var minutes = Math.floor(timeleft/60);
  var seconds = timeleft % 60;

  if(negative) $('#timer').css('color', '#c00');
  else $('#timer').css('color', '#333');

  $('#minutes').text(minutes);
  $('#seconds').text(('0' + seconds).slice(-2));
}

function updateProgressbar(duration, timeleft, alarms){
  if(timeleft >= 0){
    if(timeleft >= alarms[0]*1000) $('#first-protected-progress').css('width', (duration - timeleft)*100/duration + '%');
    else if(timeleft <= alarms[1]*1000) $('#last-protected-progress').css('width', (alarms[1]*1000 - timeleft)*100/duration + '%');
    else $('#main-progress').css('width', (alarms[0]*1000 - timeleft)*100/duration +  '%');
  } else {
    $('#finished-progress').css('width', '100%');
  }
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

function ding(){
  if(!$('audio').attr('muted')) {
    $('audio').get(0).pause();
    $('audio').get(0).fastSeek(0);
    $('audio').get(0).play();
  }
}

function Timer(duration, alarms){
  this.initduration = duration;
  this.initdurationms = duration * 1000;
  this.duration = duration;
  this.durationms = duration * 1000;
  this.alarmno = 0;
  if(alarms){
    this.alarms = alarms;
  } else {
    this.alarms = [];
  }
  updateTimer(this.duration);
  updateProgressbar(this.initdurationms, this.durationms, this.alarms);
  $('#settings').removeAttr('disabled');
}

var timer = new Timer(5 * 60, [4 * 60, 1 * 60, 0]);

Timer.prototype.play = function(){
  if(this.nowms == 'reset'){
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
      ding();
      that.alarmno++;
    }
    if(that.nowms <= 0) {
      updateTimer(that.now * -1, true);
      updateProgressbar(that.initdurationms, that.nowms, that.alarms);
    }
    else {
      updateTimer(that.now);
      updateProgressbar(that.initdurationms, that.nowms, that.alarms);
    }
  },1);
}

Timer.prototype.pause = function(){
  window.clearInterval(this.interval);
}

Timer.prototype.reset = function(){
  $('.progress-bar').css('width', '0');
  window.clearInterval(this.interval);
  updateTimer(this.initduration);
  this.nowms = 'reset';
  changePlayPause('play');
  $('#settings').removeAttr('disabled');
}

$('#play-pause').click(function(){
  if($(this).attr('title') == 'Play'){
    timer.play();
    changePlayPause('pause');
    $('#settings').attr('disabled', 'disabled');
  } else {
    timer.pause();
    changePlayPause('play');
  }
});

$('#reset').click(function(){
  timer.reset();
});

$('#test-bell').click(function(){
  ding();
});

$('#mute').click(function(){
  if($(this).attr('title') == 'Mute'){
    $('audio').attr('muted', 'muted');
    $(this).attr('title', 'Unmute');
    $(this).button('toggle');
    $('#test-bell').attr('disabled', 'disabled');
  } else {
    $('audio').removeAttr('muted');
    $(this).attr('title', 'Mute');
    $(this).button('toggle');
    $('#test-bell').removeAttr('disabled');
  }
});

$('#settings-modal').on('hide.bs.modal', function(){
  $('#motion').text($('#motion-input').val());
  var duration = Math.floor(parseInt($('#timer-minutes-input').val(), 10) * 60 + parseInt($('#timer-seconds-input').val() ,10));
  var protectedLength = Math.floor(parseInt($('#protected-minutes-input').val(), 10) * 60 + parseInt($('#protected-seconds-input').val() ,10));
  var alarms = [duration - protectedLength, protectedLength, 0];
  timer = new Timer(duration, alarms);
  centreVertically();
});

$('#fullscreen').click(function(){
  if($(this).attr('title') == 'Fullscreen'){
    $(this).button('toggle');
    $(this).attr('title', 'Exit Fullscreen');
    var elem = $('#fullscreen-container').get(0);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    $(this).button('toggle');
    $(this).attr('title', 'Fullscreen');
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

var socket = io('http://'+window.location.hostname);
socket.on('play-pause', function(){
  $('#play-pause').click();
});
socket.on('reset', function(){
  $('#reset').click();
});
