function $ (selector) {
  return document.querySelector(selector);
}

function updateTimer(timeleft, negative) {
  var minutes = Math.floor(timeleft/60);
  var seconds = timeleft % 60;

  if(negative) $('#timer').style.color = 'red';
  else $('#timer').style.color = 'black';

  $('#minutes').textContent = minutes;
  $('#seconds').textContent = ('0' + seconds).slice(-2);
}

/*
  var alarms = [20000, 10000];
    if(nowms <= alarms[0]) {
      navigator.vibrate(1000);
      alarms.shift();
    } */

function restartAnimation(){
  var elm = $('#progress');
  var newone = elm.cloneNode(true);
  elm.parentNode.replaceChild(newone, elm);
}

function Timer(duration){
  this.initduration = duration;
  this.duration = duration;
  this.durationms = duration * 1000;
  $('#progress').style.animationDuration = duration + 's';
  updateTimer(this.duration);
}

var timer = new Timer(5 * 60);

Timer.prototype.play = function(){
  if(this.nowms == 'reset'){
    restartAnimation();
    this.duration = this.initduration;
    this.durationms = this.duration * 1000;
  } else if(this.nowms < this.durationms) {
    this.duration = this.now;
    this.durationms = this.nowms;
  }

  this.start = new Date().getTime();

  var that = this;

  this.interval = setInterval(function() {
    that.nowms = that.durationms-(new Date().getTime()-that.start);
    that.now = Math.ceil(that.nowms/1000);
    if(that.nowms <= 0) {
      updateTimer(that.now * -1, true);
      $('#progress').style.animationPlayState = 'paused';
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
  $('#progress').style.animationPlayState = 'paused';
  $('#play-pause').textContent = 'Play';
}

$('#play-pause').onclick = function(){
  if(this.textContent == 'Play'){
    timer.play();
    $('#progress').style.animationPlayState = 'running';
    this.textContent = 'Pause';
  } else {
    timer.pause();
    $('#progress').style.animationPlayState = 'paused';
    this.textContent = 'Play';
  }
}

$('#reset').onclick = function(){
  timer.reset();
}

$('#set-timer').onclick = function(){
  timer = new Timer(Math.floor(window.prompt('Enter a duration in seconds:')));
}

$('#set-motion').onclick = function(){
  $('#motion').textContent = window.prompt('Enter a motion:');
}

var socket = new WebSocket('ws://'+window.location.hostname+':8882', 'timer-protocol');
socket.onmessage = function(e){
  if(e.data == 'play-pause') $('#play-pause').click();
  else if(e.data == 'reset') $('#reset').click();
}
