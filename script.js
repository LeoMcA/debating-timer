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

  if(negative && !($('#timer').css('color') == '#c00' || $('#timer').css('color') == '#cc0000' || $('#timer').css('color') == 'rgb(204, 0, 0)')) $('#timer').css('color', '#c00');
  else if(!negative && !($('#timer').css('color') == '#333' || $('#timer').css('color') == '#333333' || $('#timer').css('color') == 'rgb(51, 51, 51)')) $('#timer').css('color', '#333');

  $('#minutes').text(minutes);
  $('#seconds').text(('0' + seconds).slice(-2));
}

function updateProgressbar(duration, timeleft, alarms){
  if(timeleft >= 0){
    if(timeleft >= alarms[0]*1000) $('#first-protected-progress').css('width', (duration - timeleft)*100/duration + '%');
    else if(timeleft <= alarms[1]*1000) $('#last-protected-progress').css('width', (alarms[1]*1000 - timeleft)*100/duration + '%');
    else $('#main-progress').css('width', (alarms[0]*1000 - timeleft)*100/duration +  '%');
  } else if(timeleft > alarms[3]*1000) {
    $('#finished-progress-striped').css('width', timeleft/(alarms[3]*10) + '%');
    $('#finished-progress').css('width', 100 - timeleft/(alarms[3]*10) + '%');
  } else {
    if($('#finished-progress-striped').get(0).style.width !== '100%') $('#finished-progress-striped').css('width', '100%');
  }
}

function updateFlashing(timeleft, alarms){
  if(timeleft < alarms[3]*1000 && $('body').css('animation-iteration-count') !== 'infinite'){
    $('body').css('animation-iteration-count', 'infinite');
    $('#fullscreen-container').css('animation-iteration-count', 'infinite');
  } else if(timeleft == 'reset' && $('body').css('animation-iteration-count') == 'infinite'){
    $('body').css('animation-iteration-count', 0);
    $('#fullscreen-container').css('animation-iteration-count', 0);
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
    $('audio').get(0).currentTime = 0;
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

var timer = new Timer(5 * 60, [4 * 60, 1 * 60, 0, -15]);

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
      updateFlashing(that.nowms, that.alarms);
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
  updateFlashing(this.nowms, this.alarms);
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
  var grace = -1 * Math.floor(parseInt($('#grace-minutes-input').val(), 10) * 60 + parseInt($('#grace-seconds-input').val() ,10))
  var alarms = [duration - protectedLength, protectedLength, 0, grace];
  timer = new Timer(duration, alarms);
  centreVertically();
});

$('#fullscreen').click(function(){
  if($(this).attr('title') == 'Fullscreen'){
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

document.addEventListener('fullscreenchange', function(){
  if(document.fullscreenElement){
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Exit Fullscreen');
  } else if(!document.fullscreenElement) {
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Fullscreen');
  }
});

document.addEventListener('MSFullscreenChange', function(){
  if(document.msFullscreenElement){
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Exit Fullscreen');
  } else if(!document.msFullscreenElement) {
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Fullscreen');
  }
});

document.addEventListener('mozfullscreenchange', function(){
  if(document.mozFullScreenElement){
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Exit Fullscreen');
  } else if(!document.mozFullScreenElement) {
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Fullscreen');
  }
});

document.addEventListener('webkitfullscreenchange', function(){
  if(document.webkitFullscreenElement){
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Exit Fullscreen');
  } else if(!document.webkitFullscreenElement) {
    $('#fullscreen').button('toggle');
    $('#fullscreen').attr('title', 'Fullscreen');
  }
});

var socket = io('http://'+window.location.hostname);
socket.on('play-pause', function(){
  $('#play-pause').click();
});
socket.on('reset', function(){
  $('#reset').click();
});
