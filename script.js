var app = angular.module('app', []);

app.controller('MainController', ['$interval', function($interval){

  this.Timer = function(duration, alarms){
    this.initduration = duration;
    this.duration = duration;
    this.now = duration;
    this.alarmno = 0;
    if(alarms){
      this.alarms = alarms;
    } else {
      this.alarms = [];
    }
    updateProgressbar(this.initduration, this.duration, this.alarms);
    $('#settings').removeAttr('disabled');
  }

  this.Timer.prototype.play = function(){
    if(this.now < this.duration) this.duration = this.now;

    this.start = new Date().getTime();

    var that = this;

    this.interval = $interval(function() {
      that.now = that.duration-(new Date().getTime()-that.start);
      if(that.now <= that.alarms[that.alarmno]){
        ding();
        that.alarmno++;
      }
      if(that.now <= 0) updateFlashing(that.now, that.alarms);
      updateProgressbar(that.initduration, that.now, that.alarms);
    },1);
  }

  this.Timer.prototype.pause = function(){
    $interval.cancel(this.interval);
  }

  this.Timer.prototype.reset = function(){
    $('.progress-bar').css('width', '0');
    $interval.cancel(this.interval);
    this.duration = this.initduration;
    this.alarmno = 0;
    this.now = this.duration;
    updateFlashing(this.now, this.alarms);
    changePlayPause('play');
    $('#settings').removeAttr('disabled');
  }

  this.timer = new this.Timer(5 * 60 * 1000, [4 * 60 * 1000, 1 * 60 * 1000, 0, -15 * 1000]);
}]);

app.filter('minutes', function(){
  return function(input){
    if(input > 0) return Math.floor(Math.ceil(input/1000)/60);
    else return Math.floor(input/-60000);
  }
});

app.filter('seconds', function(){
  return function(input){
    if(input > 0) return ('0' + (Math.ceil(input/1000) % 60)).slice(-2);
    else return ('0' + (Math.floor(input/-1000) % 60)).slice(-2);
  }
});

app.controller('ButtonsController', function(){

  this.play = function(main){
    if($('#play-pause').attr('title') == 'Play'){
      main.timer.play();
      changePlayPause('pause');
      $('#settings').attr('disabled', 'disabled');
    } else {
      main.timer.pause();
      changePlayPause('play');
    }
  }

  this.reset = function(main){
    main.timer.reset();
  }

  this.bell = function(){
    ding();
  }

  this.mute = function(){
    if($('#mute').attr('title') == 'Mute'){
      $('audio').attr('muted', 'muted');
      $('#mute').attr('title', 'Unmute');
      $('#mute').button('toggle');
      $('#test-bell').attr('disabled', 'disabled');
    } else {
      $('audio').removeAttr('muted');
      $('#mute').attr('title', 'Mute');
      $('#mute').button('toggle');
      $('#test-bell').removeAttr('disabled');
    }
  }

  this.fullscreen = function(){
    if($('#fullscreen').attr('title') == 'Fullscreen'){
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
  }

});

app.controller("SettingsController", function(){
  this.set = function(main){
    $('#motion').text($('#motion-input').val());
    var duration = Math.floor(parseInt($('#timer-minutes-input').val(), 10) * 60 + parseInt($('#timer-seconds-input').val() ,10)) * 1000;
    var protectedLength = Math.floor(parseInt($('#protected-minutes-input').val(), 10) * 60 + parseInt($('#protected-seconds-input').val() ,10)) * 1000;
    var grace = -1 * Math.floor(parseInt($('#grace-minutes-input').val(), 10) * 60 + parseInt($('#grace-seconds-input').val() ,10)) * 1000;
    var alarms = [duration - protectedLength, protectedLength, 0, grace];
    main.timer = new main.Timer(duration, alarms);
  }
});

function centre(){
  var margin = ($(window).height() - $('.progress').outerHeight())/2 + $('.container').offset().top - $('.progress').offset().top;
  if(margin < 0) margin = 0;
  $('.container').css('margin-top', margin);
  $('#minutes').css('padding-left', $('.unit:last').outerWidth() + 20);
}

$(window).resize(centre);
$(function(){ centre(); });

function updateProgressbar(duration, timeleft, alarms){
  if(timeleft > 0){
    if(timeleft > alarms[0]) $('#first-protected-progress').css('width', (duration - timeleft)*100/duration + '%');
    else if(timeleft <= alarms[1]) $('#last-protected-progress').css('width', (alarms[1] - timeleft)*100/duration + '%');
    else $('#main-progress').css('width', (alarms[0] - timeleft)*100/duration +  '%');
  } else if(timeleft > alarms[3]) {
    $('#finished-progress-striped').css('width', timeleft/(alarms[3]/100) + '%');
    $('#finished-progress').css('width', 100 - timeleft/(alarms[3]/100) + '%');
  } else {
    if($('#finished-progress-striped').get(0).style.width !== '100%') $('#finished-progress-striped').css('width', '100%');
  }
}

function updateFlashing(timeleft, alarms){
  if(timeleft <= alarms[3] && $('body').css('animation-name') !== 'backgroundpulse'){
    $('body').css('animation-name', 'backgroundpulse');
    $('#fullscreen-container').css('animation-name', 'backgroundpulse');
  } else if(timeleft > alarms[3] && $('body').css('animation-name') == 'backgroundpulse'){
    $('body').css('animation-name', 'none');
    $('#fullscreen-container').css('animation-name', 'none');
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

/*var socket = io('http://'+window.location.hostname);
socket.on('play-pause', function(){
  $('#play-pause').click();
});
socket.on('reset', function(){
  $('#reset').click();
});*/
