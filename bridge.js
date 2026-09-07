/* Browser-only host services; all drawing and driving simulation are Rust. */
(() => {
 'use strict';
 const q = new URLSearchParams(location.search);
 const allowed = new Set(['fps','seed','sound','muted','fullscreen','windowed','time','freeze','radio','help']);
 const flag = n => q.has(n) && !['0','false'].includes(q.get(n));
 let fps=30, seed=1701, time=0;
 try {
  for(const k of q.keys()) if(!allowed.has(k)) throw Error('Unknown option: '+k);
  const integer=(name,def,min,max)=>{if(!q.has(name))return def;const v=q.get(name);if(!/^\d+$/.test(v))throw Error(name+' requires an integer');const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(name+' outside '+min+'..'+max);return n;};
  fps=integer('fps',30,15,60);seed=integer('seed',1701,0,Number.MAX_SAFE_INTEGER);
  time=q.has('time')?Number(q.get('time')):0;
  if(!Number.isFinite(time)||time<0||time>86400||q.get('time')==='')throw Error('time must be finite, 0..86400');
  if(q.has('help'))throw Error('Options: ?fps=30&seed=1701&muted=1&fullscreen=1&radio=1 · QA: time=21&freeze=1. Space boosts, R opens radio, M toggles sound, Up/Down adjust volume, Esc stops.');
 } catch(e) {window.ndConfigError=true;document.querySelector('#entry').hidden=true;document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=e.message;return;}
 const opts=[fps,seed,(!q.has('sound')||flag('sound'))&&!flag('muted')?1:0,flag('fullscreen')&&!flag('windowed')?1:0,time,flag('freeze')?1:0,flag('radio')?1:0];
 // rAF-driven pacing, no busy wait and no render/swap on skipped refreshes.
 const raf=window.requestAnimationFrame.bind(window);let previous=-Infinity;
 window.requestAnimationFrame=cb=>raf(function gate(now){
  if(window.neonDrive?.stopped)return;
  if(document.hidden){previous=now;raf(gate);return;}
  if(now-previous+0.5>=1000/fps){previous=now-((now-previous)%(1000/fps)||0);if(!Number.isFinite(previous))previous=now;cb(now);}else raf(gate);
 });
 const audio=new Audio('assets/song.ogg');audio.preload='none';audio.loop=false;audio.volume=0.7;
 let launched=false,started=false,ended=false,missing=false,wanted=!!opts[2],stopped=false,pending=false,blocked=false;
 const note=document.querySelector('#notice');
 const unlock=document.querySelector('#audio-unlock');
 const syncOutput=()=>{audio.muted=!wanted||document.hidden||stopped||missing;if(stopped)audio.pause();};
 const updateNote=()=>{unlock.hidden=!(blocked&&wanted&&!stopped&&!missing);note.textContent=launched&&!window.neonDrive?'Loading city…':'';};
 audio.addEventListener('error',()=>{missing=true;syncOutput();updateNote();});
 audio.addEventListener('ended',()=>{ended=true;updateNote();});
 function play(){
  if(!launched||started||ended||missing||pending||stopped||!wanted||document.hidden||audio.volume===0)return;
  pending=true;syncOutput();
  audio.play().then(()=>{started=true;blocked=false;syncOutput();}).catch(()=>{blocked=true;}).finally(()=>{pending=false;updateNote();});
 }
 unlock.addEventListener('click',()=>{play();document.querySelector('canvas').focus();});
 window.ndStart=loadScene=>{
  if(launched)return;
  launched=true;
  // Invoke play BEFORE any async loading: this call owns the trusted gesture.
  play();
  if(opts[3]&&!document.fullscreenElement){document.documentElement.requestFullscreen().catch(()=>{});opts[3]=0;}
  document.querySelector('#entry').hidden=true;updateNote();
  loadScene();document.querySelector('canvas').focus();
 };
 document.querySelector('#start').textContent=opts[2]?'Start drive':'Start muted';
 window.addEventListener('keydown',e=>{
  if(['Space','KeyM','KeyR','ArrowUp','ArrowDown','Escape'].includes(e.code)&&launched)e.preventDefault();
  if(e.repeat||!launched||!window.neonDrive||stopped||document.hidden)return;
  // Rust applies the same M toggle on its next frame. Unlock cold audio here,
  // while the key event still carries browser user activation, not a frame later.
  if(e.code==='KeyM'&&!missing){wanted=!wanted;syncOutput();if(wanted)play();}
 });
 let lastTick=null;
 document.addEventListener('visibilitychange',()=>{lastTick=null;syncOutput();});
 window.ndAudio=audio;
 window.ndRegister=imports=>{
  imports.env.nd_option=id=>opts[id]||0;
  imports.env.nd_hidden=()=>document.hidden?1:0;
  imports.env.nd_delta=()=>{const now=performance.now();const dt=lastTick===null?0:(now-lastTick)/1000;lastTick=now;return dt;};
  imports.env.nd_audio=(action,volume)=>{
   wanted=action===1;if(action===3)stopped=true;
   audio.volume=Math.max(0,Math.min(1,volume));syncOutput();
   if(wanted&&!blocked)play();updateNote();return missing?-1:ended?2:started?1:0;
  };
  imports.env.nd_state=(age,speed,travel,muted,halted,volume,radio)=>{window.neonDrive={age,phase:age<12?'initializer':age<30?'approach':'city',speed,travel,muted:!!muted,stopped:!!halted,volume,radio:!!radio,frames:(window.neonDrive?.frames||0)+1,fps,seed,audio:{started,ended,missing,blocked,time:audio.currentTime}};updateNote();};
 };
})();
