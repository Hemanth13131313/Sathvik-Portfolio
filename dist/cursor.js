// A small perspective-rendered crystal. One 96px 2D canvas, no extra WebGL context.
const fine=matchMedia('(hover: hover) and (pointer: fine)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const root=document.createElement('div');root.className='crystal-cursor';root.setAttribute('aria-hidden','true');root.inert=true;
const canvas=document.createElement('canvas');root.append(canvas);document.body.append(root);
const context=canvas.getContext('2d');
const toggle=document.querySelector('#cursor-toggle');
let enabled=true;try{enabled=localStorage.getItem('satvik-cursor')!=='system';}catch{}
let visible=false,frame=0,lastTime=0,phase=0,hovering=false,pressed=false;
let x=0,y=0,vx=0,vy=0,lastX=0,lastY=0,scale=1,tiltX=.25,tiltY=.3;
const vertices=[[0,-14,0],[0,14,0],[-10,0,-8],[10,0,-8],[10,0,8],[-10,0,8]];
const faces=[[0,2,3],[0,3,4],[0,4,5],[0,5,2],[1,3,2],[1,4,3],[1,5,4],[1,2,5]];
const topLayer=typeof root.showPopover==='function';if(topLayer)root.popover='manual';
function allowed(){return enabled&&fine.matches&&!reduced.matches&&!!context;}
function paused(){return document.querySelector('#motion')?.getAttribute('aria-pressed')==='true';}
function size(){const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=96*ratio;canvas.height=96*ratio;context?.setTransform(ratio,0,0,ratio,0,0);}
size();
function hide(){visible=false;document.documentElement.classList.remove('crystal-cursor-active');root.classList.remove('is-visible');if(topLayer&&root.matches(':popover-open'))root.hidePopover();cancelAnimationFrame(frame);frame=0;}
function lift(){if(!visible)return;if(topLayer){if(root.matches(':popover-open'))root.hidePopover();root.showPopover();}else{const dialog=document.querySelector('dialog[open]');(dialog||document.body).append(root);}}
function sync(){if(toggle){toggle.hidden=!fine.matches||reduced.matches;toggle.setAttribute('aria-pressed',String(enabled));toggle.title=enabled?'Use the standard cursor':'Use the animated crystal cursor';toggle.innerHTML=enabled?'✧ <span>Cursor: Crystal</span>':'↖ <span>Cursor: System</span>';}if(!allowed())hide();}
if(toggle)toggle.onclick=()=>{enabled=!enabled;try{localStorage.setItem('satvik-cursor',enabled?'crystal':'system');}catch{}sync();};
fine.addEventListener('change',sync);reduced.addEventListener('change',sync);sync();
function rotate([px,py,pz],ax,ay){const yy=py*Math.cos(ax)-pz*Math.sin(ax),zz=py*Math.sin(ax)+pz*Math.cos(ax);return[px*Math.cos(ay)+zz*Math.sin(ay),yy,-px*Math.sin(ay)+zz*Math.cos(ay)];}
function draw(time){frame=0;if(!visible||!allowed()||document.hidden)return;
 const still=paused(),dt=Math.min((time-lastTime)/1000||.016,.05);lastTime=time;if(!still)phase+=dt;
 const blend=still?1:1-Math.exp(-dt*12);scale+=( (pressed?.78:hovering?1.24:1)-scale)*blend;tiltX+=(.35+Math.max(-.6,Math.min(.6,vy*.018))-tiltX)*blend;tiltY+=(Math.max(-.7,Math.min(.7,vx*.018))-tiltY)*blend;
 vx*=.85;vy*=.85;context.clearRect(0,0,96,96);
 // The precise pointer sits at the canvas centre. The crystal floats beside it.
 root.style.transform=`translate3d(${x-48}px,${y-48}px,0)`;
 context.fillStyle=hovering?'#f3cd8e':'#ad8ac0';context.beginPath();context.arc(48,48,2,0,Math.PI*2);context.fill();context.strokeStyle='#fff';context.lineWidth=.8;context.stroke();
 const cx=64-Math.max(-4,Math.min(4,vx*.12)),cy=64-Math.max(-4,Math.min(4,vy*.12));
 const glow=context.createRadialGradient(cx,cy,0,cx,cy,27);glow.addColorStop(0,hovering?'rgba(244,191,102,.3)':'rgba(170,128,226,.23)');glow.addColorStop(1,'rgba(170,128,226,0)');context.fillStyle=glow;context.fillRect(cx-27,cy-27,54,54);
 context.save();context.translate(cx,cy);context.scale(scale,scale);context.rotate(Math.sin(phase*.7)*.12);
 context.strokeStyle=hovering?'rgba(226,169,76,.8)':'rgba(164,137,204,.8)';context.lineWidth=.9;context.beginPath();context.ellipse(0,0,22,7,-.5+Math.sin(phase*.35)*.15,0,Math.PI*2);context.stroke();
 const points=vertices.map(v=>rotate(v,tiltX,phase*.85+tiltY));
 const sorted=faces.map(f=>({f,z:f.reduce((s,i)=>s+points[i][2],0)/3})).sort((a,b)=>b.z-a.z);
 for(const {f,z}of sorted){context.beginPath();f.forEach((i,n)=>{const p=points[i],perspective=75/(75+p[2]);const px=p[0]*perspective,py=p[1]*perspective;n?context.lineTo(px,py):context.moveTo(px,py);});context.closePath();const light=Math.max(34,Math.min(83,61-z*2+points[f[0]][0]*.7));context.fillStyle=`hsl(${hovering?37:268} ${hovering?68:46}% ${light}%)`;context.fill();context.strokeStyle=hovering?'rgba(255,240,196,.8)':'rgba(245,234,255,.65)';context.lineWidth=.65;context.stroke();}
 const orbit=phase*1.8;context.fillStyle=hovering?'#fff0be':'#e6d8ff';context.beginPath();context.arc(Math.cos(orbit)*21,Math.sin(orbit)*7,1.6,0,Math.PI*2);context.fill();context.restore();
 if(!still)frame=requestAnimationFrame(draw);
}
function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
document.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!allowed()){hide();return;}const target=event.target;
 if(target.closest('input,textarea,select,[contenteditable="true"],iframe,video')||getSelection()?.toString()){hide();return;}
 hovering=!!target.closest('a,button,summary,[role="button"]');vx=visible?event.clientX-lastX:0;vy=visible?event.clientY-lastY:0;x=lastX=event.clientX;y=lastY=event.clientY;
 if(!visible){visible=true;lastTime=performance.now();scale=1;lift();root.classList.add('is-visible');document.documentElement.classList.add('crystal-cursor-active');}schedule();
},{passive:true});
document.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'){pressed=true;if(visible)schedule();}});
document.addEventListener('pointerup',()=>{pressed=false;if(visible)schedule();});
document.addEventListener('pointercancel',hide);document.documentElement.addEventListener('pointerleave',hide);window.addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});document.addEventListener('keydown',hide);window.addEventListener('resize',()=>{size();if(visible)schedule();});
const dialog=document.querySelector('#project-dialog');if(dialog)new MutationObserver(()=>{lift();if(visible)schedule();}).observe(dialog,{attributes:true,attributeFilter:['open']});
const motion=document.querySelector('#motion');if(motion)new MutationObserver(()=>{if(visible)schedule();}).observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
