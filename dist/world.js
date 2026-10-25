import * as THREE from './vendor/three.module.js';
import {makeAtmosphere} from './atmosphere.js';

export async function createWorld(projects,openProject,openAchievement){
 const host=document.querySelector('#scene'),hero=document.querySelector('.hero'),labelHost=document.querySelector('#world-labels');
 const mobile=()=>innerWidth<900;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let motion=!reduced.matches,paused=false,visible=true,exploring=false,low=mobile(),qualityMode=0;
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,low?1.25:1.75));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Garden view. Drag to orbit; in exploration mode use arrow keys or WASD to walk.');
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#151a31',90,230);
 const camera=new THREE.PerspectiveCamera(35,host.clientWidth/host.clientHeight,.1,650);
 const target=new THREE.Vector3(0,1.5,0);let angle=.62,elevation=.53,distance=54;const desired=new THREE.Vector3();
 const hemi=new THREE.HemisphereLight('#fff2df','#7d7199',2.4);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#ffe3bb',3.7);sun.position.set(-16,27,13);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:1,far:85});sun.shadow.bias=-.0007;sun.shadow.normalBias=.04;scene.add(sun);
 const fill=new THREE.DirectionalLight('#c9c2ff',1.3);fill.position.set(12,12,-17);scene.add(fill);
 const world=new THREE.Group();scene.add(world);
 const mats={};function mat(c,roughness=.85){const key=c+roughness;return mats[key]||(mats[key]=new THREE.MeshStandardMaterial({color:c,roughness}));}
 const colors={stone:'#afa5bd',soil:'#8584a5',grass:'#a2b5a5',wood:'#64414b',woodLight:'#b97b65',cream:'#efe0c4',roof:'#664f70',trim:'#96758d',pink:'#d997b4',pinkLight:'#f1bfca',pinkDark:'#b777a3',water:'#8ab7c2',gold:'#d8ab66'};
 function mesh(geo,material,parent=world){const m=new THREE.Mesh(geo,typeof material==='string'?mat(material):material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,c,x=0,y=0,z=0,parent=world){const m=mesh(new THREE.BoxGeometry(w,h,d),c,parent);m.position.set(x,y,z);return m;}
 function cylinder(r1,r2,h,c,x=0,y=0,z=0,parent=world,n=12){const m=mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,parent);m.position.set(x,y,z);return m;}
 function sphere(r,c,x,y,z,parent=world,detail=1){const m=mesh(new THREE.IcosahedronGeometry(r,detail),c,parent);m.position.set(x,y,z);return m;}
 function beam(a,b,r,c,parent=world){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const m=mesh(new THREE.CylinderGeometry(r*.8,r,start.distanceTo(end),7),c,parent);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;}
 // A small diorama island: soft terraces and a quiet surrounding pond.
 cylinder(17.8,16.1,1.35,colors.soil,0,-1.1,0,world,72);
 cylinder(17.9,17.8,.35,colors.stone,0,-.27,0,world,72);
 cylinder(17.45,17.8,.22,colors.grass,0,0,0,world,72);
 const waterMat=new THREE.MeshStandardMaterial({color:colors.water,roughness:.38,metalness:.15,transparent:true,opacity:.75});
 const water=cylinder(22.2,22.2,.06,waterMat,0,-1.8,0,world,96);water.receiveShadow=true;
 cylinder(22.5,22.5,.16,'#b9b0c4',0,-1.92,0,world,96);
 const ring=mesh(new THREE.TorusGeometry(21.5,.025,4,96),mat('#d5d4d7'));ring.rotation.x=Math.PI/2;ring.position.y=-1.74;
 // Stone paths connect every district.
 function path(a,b){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),len=A.distanceTo(B);for(let i=0;i<len;i+=.84){const p=A.clone().lerp(B,i/len);const s=box(1.6,.11,.68,i%2?'#d6cfcb':'#c8c1c5',p.x,.18,p.z);s.rotation.y=Math.atan2(B.x-A.x,B.z-A.z)+(Math.sin(i)*.05);}}
 path([0,0,13],[0,0,-9]);path([-12,0,4],[11,0,4]);path([-10,0,-5],[8,0,-5]);path([-10,0,4],[-10,0,-5]);path([9,0,4],[9,0,-6]);
 cylinder(3.1,3.1,.13,'#c9bec5',0,.2,3,world,40);cylinder(2.75,2.75,.14,'#dfd5cc',0,.23,3,world,40);
 const plazaRing=mesh(new THREE.TorusGeometry(2.35,.025,4,64),colors.gold);plazaRing.rotation.x=Math.PI/2;plazaRing.position.set(0,.32,3);
 // Curved eaves are modelled as layered strips, giving the teahouse its silhouette.
 function roof(width,depth,y,parent,color=colors.roof){
  const shape=new THREE.Shape();shape.moveTo(-width/2,-.08);shape.lineTo(-width/2,.22);shape.quadraticCurveTo(-width*.35,.1,0,1.7);shape.quadraticCurveTo(width*.35,.1,width/2,.22);shape.lineTo(width/2,-.08);shape.quadraticCurveTo(width*.28,.15,0,1.42);shape.quadraticCurveTo(-width*.28,.15,-width/2,-.08);
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:10});geo.translate(0,0,-depth/2);const r=mesh(geo,color,parent);r.position.y=y;
  for(let i=0;i<=depth/.3;i++){const z=-depth/2+i*.3;for(const side of [-1,1]){const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector3(side*width/2*t,y+1.71*(1-t)**1.5+.06,z));}const curve=new THREE.CatmullRomCurve3(pts);mesh(new THREE.TubeGeometry(curve,12,.023,4,false),colors.trim,parent);}}
  cylinder(.07,.07,depth+.3,colors.gold,0,y+1.76,0,parent,8).rotation.x=Math.PI/2;
  return r;
 }
 const windowMat=new THREE.MeshStandardMaterial({color:'#ffe1a2',emissive:'#e5a45a',emissiveIntensity:.48,roughness:.6});
 function building(x,z,w,d,h,kind='house'){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  box(w+.7,.35,d+.7,'#a7a0ac',0,.3,0,g);box(w+.4,.22,d+.4,colors.wood,.0,.56,0,g);box(w,h,d,colors.cream,0,h/2+.7,0,g);
  for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(.17,h+.3,.17,colors.wood,xx,h/2+.7,zz,g);
  for(let xx=-w/2+.55;xx<w/2;xx+=.75){box(.5,h*.55,.035,windowMat,xx,h*.52+.65,d/2+.025,g);box(.04,h*.65,.05,colors.wood,xx,h*.5+.65,d/2+.06,g);}
  for(let yy=.9;yy<h;yy+=.55)box(w,.045,.07,colors.wood,0,yy,d/2+.08,g);
  box(.8,1.6,.08,colors.wood,0,1.5,d/2+.12,g);box(.58,1.3,.05,windowMat,0,1.56,d/2+.17,g);
  for(let j=0;j<3;j++)box(1.6,.14, .6,colors.stone,0,.12+j*.14,d/2+.4+(2-j)*.35,g);
  roof(w+1.4,d+1.2,h+.75,g);
  return g;
 }
 const tea=building(-2,-5,5.2,4.5,2.7);
 box(5.7,.2,5,colors.wood,0,3.9,0,tea);box(4.2,2.3,3.8,colors.cream,0,5.05,0,tea);
 for(let x=-2.1;x<=2.2;x+=.7){box(.12,2.4,.12,colors.wood,x,5.05,1.98,tea);box(.48,1.35,.03,windowMat,x+.3,5.05,1.92,tea);}
 for(const x of [-2.1,2.1])box(.18,2.5,3.9,colors.wood,x,5.05,0,tea);
 roof(6.1,4.9,6.3,tea);box(1.8,.1,1.3,colors.wood,0,8.02,0,tea);roof(2.2,1.5,8.08,tea);
 // Balcony and handrails.
 box(6,.15,1,colors.wood,0,4.1,2.4,tea);
 for(let x=-2.9;x<=3;x+=.36)box(.065,.7,.065,colors.wood,x,4.5,2.85,tea);
 box(6,.09,.09,colors.woodLight,0,4.85,2.85,tea);
 const workshop=building(-10,1,3.4,3,2.1);const arcade=building(8,-4,4,3.4,2.4);const market=building(8,6,3.5,2.7,2);const studio=building(-7,9,3.2,2.5,2);
 // Banner cloth and a red gate near the entrance.
 const gate=new THREE.Group();gate.position.set(.5,0,11);world.add(gate);
 for(const x of [-2,2]){cylinder(.18,.23,3.2,'#af665f',x,1.7,0,gate);box(.6,.15,.6,colors.stone,x,.2,0,gate);}
 box(5.2,.3,.35,'#97545c',0,3.25,0,gate);box(4.5,.2,.27,'#b46a63',0,2.7,0,gate);const gateRoof=box(5.5,.15,.65,colors.roof,0,3.48,0,gate);box(.5,.5,.12,colors.gold,0,2.97,.2,gate);
 // A bridge crossing a narrow garden stream.
 const stream=box(3,.04,7,waterMat,3.1,.16,7.1);stream.castShadow=false;
 for(let i=-4;i<=4;i++)box(.48,.12,2.3,colors.woodLight,3.1+i*.48,.48+Math.cos(i/5)*.35,7.5);
 for(const z of [6.35,8.65]){for(let i=-4;i<=4;i+=2)box(.09,.8,.09,colors.wood,3.1+i*.48,1.1+Math.cos(i/5)*.2,z);beam([1.1,1.35,z],[5.1,1.35,z],.06,colors.wood);}
 // Trees use shared low-poly crown geometry and materials.
 const crownGeo=new THREE.IcosahedronGeometry(1,1);let seed=47;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
 function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,.2,z);g.scale.setScalar(s);world.add(g);beam([0,0,0],[.1,2.3,0],.16,colors.wood,g);beam([0,1.2,0],[-.9,2.7,.3],.1,colors.wood,g);beam([0,1.6,0],[.95,2.9,-.2],.1,colors.wood,g);
  for(let i=0;i<12;i++){const m=mesh(crownGeo,[colors.pink,colors.pinkLight,colors.pinkDark][i%3],g);m.position.set((rand()-.5)*2.6,2.6+rand()*1.3,(rand()-.5)*2);m.scale.set( .65+rand()*.6,.55+rand()*.5,.7+rand()*.5);}
  for(let i=0;i<5;i++){const m=sphere(.09,colors.pinkLight,(rand()-.5)*2.8,.12,(rand()-.5)*2.8,g,0);m.scale.y=.2;}
 }
 [[-7,-7,1.25],[3,-8,1.3],[-12,-5,1.1],[11,-8,1.1],[-13,6,1.15],[12,3,1.2],[5,11,.9],[-5,13,.8],[-6,-11,1],[0,-12,.9],[13,-2,.8]].forEach(t=>tree(...t));
 // Small shrubs, pebbles and planted borders.
 for(let i=0;i<60;i++){const a=rand()*Math.PI*2,r=14+rand()*2.7,x=Math.cos(a)*r,z=Math.sin(a)*r;const m=sphere(.3+rand()*.35,i%3?'#809d91':'#c4b3bd',x,.25,z,world,0);m.scale.y=.65;}
 for(let i=0;i<35;i++){const a=rand()*6.28,r=17.1+rand()*.4;sphere(.22+rand()*.2,'#c7bac8',Math.cos(a)*r,.18,Math.sin(a)*r,world,0);}
 // Lanterns: emissive surfaces suggest warm light without a light per object.
 const lanterns=[];function lantern(x,z,h=1.5){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);box(.14,h,.14,colors.wood,0,h/2,0,g);box(.5,.12,.5,colors.roof,0,h+.52,0,g);box(.35,.45,.35,windowMat,0,h+.25,0,g);for(const xx of [-.18,.18])for(const zz of [-.18,.18])box(.035,.48,.035,colors.wood,xx,h+.25,zz,g);box(.42,.08,.42,colors.wood,0,h,0,g);lanterns.push(g);}
 [[-2,8],[2,8],[-2,0],[2,0],[-8,4],[-12,3],[6,4],[10,4],[-5,-3],[1,-3],[-4,10]].forEach(p=>lantern(...p));
 for(let i=-2;i<=2;i++){const l=cylinder(.17,.17,.4,windowMat,i*.9,3.25,2.8,tea,12);cylinder(.18,.18,.06,colors.wood,i*.9,3.48,2.8,tea,12);}
 // Project billboards use actual artwork rather than decorative placeholder images.
 const loader=new THREE.TextureLoader();const textureLoads=[];
 function board(id,x,z,w=2.2,h=1.6,rotation=0){const p=projects.find(p=>p.id===id);if(!p)return;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;world.add(g);for(const dx of [-w*.35,w*.35])box(.09,1,.09,colors.wood,dx,.6,0,g);box(w+.18,h+.18,.16,colors.wood,0,1.7,0,g);const m=new THREE.MeshBasicMaterial({color:'#fff4e7'});const panel=mesh(new THREE.PlaneGeometry(w,h),m,g);panel.position.set(0,1.7,.09);textureLoads.push(loader.loadAsync(p.cover).then(t=>{t.colorSpace=THREE.SRGBColorSpace;m.map=t;m.needsUpdate=true;}).catch(()=>{}));}
 board('europa',7,-.9,2,1.5);board('forge',9.1,-1,1.15,1.65);board('taj',8,8.2,1.8,1.35);board('apparel',-7,11,1.6,1.3);board('sword',-10,3,2.25,1.2);board('europa',4,-9,2.5,1.8);
 // A small tractor-inspired sculpture, created for the environment.
 const tractor=new THREE.Group();tractor.position.set(-11.5,.3,-1.8);tractor.rotation.y=.4;world.add(tractor);box(1,.6,1.7,'#e5b657',0,.7,0,tractor);box(.9,.95,.8,'#e5b657',0,1.35,-.45,tractor);box(.72,.6,.03,'#9ec5ce',0,1.48,.0,tractor);box(1.1,.12,1,'#484451',0,1.9,-.45,tractor);box(.12,.8,.12,'#484451',.28,1.3,.55,tractor);
 for(const x of [-.62,.62])for(const z of [-.55,.65]){const r=z<0?.48:.32;const wheel=cylinder(r,r,.28,'#403e4c',x,r,z,tractor,14);wheel.rotation.z=Math.PI/2;const hub=cylinder(r*.48,r*.48,.3,'#f3c460',x,r,z,tractor,14);hub.rotation.z=Math.PI/2;}
 // Minimal friendly explorer.
 const character=new THREE.Group();character.position.set(0,.35,5);world.add(character);const body=box(.48,.6,.3,'#d7c5a9',0,.65,0,character);sphere(.24,'#dcb395',0,1.13,0,character,2);sphere(.25,'#51404e',0,1.25,-.04,character,1).scale.y=.55;box(.37,.4,.13,'#716e91',0,.69,-.2,character);
 const legs=[box(.14,.4,.17,'#61536e',-.13,.18,0,character),box(.14,.4,.17,'#61536e',.13,.18,0,character)];const arms=[box(.13,.45,.16,'#d7c5a9',-.34,.65,0,character),box(.13,.45,.16,'#d7c5a9',.34,.65,0,character)];
 // Falling petals, a single instanced draw call.
 const petalCount=low?55:110,petals=new THREE.InstancedMesh(new THREE.PlaneGeometry(.09,.16),new THREE.MeshBasicMaterial({color:'#f6c4d1',side:THREE.DoubleSide,transparent:true,opacity:.85}),petalCount);world.add(petals);const dummy=new THREE.Object3D(),petalData=Array.from({length:petalCount},()=>({x:(rand()-.5)*30,y:rand()*10,z:(rand()-.5)*26,s:rand()*6}));
 // Merge static scenery by material so hundreds of details use a few draw calls.
 world.updateMatrixWorld(true);const batches=new Map(),originals=[],oldGeometries=new Set();
 world.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let p=o;while(p){if(p===character)return;p=p.parent;}const key=o.material.uuid+o.castShadow+o.receiveShadow;if(!batches.has(key))batches.set(key,{material:o.material,cast:o.castShadow,receive:o.receiveShadow,parts:[]});const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);batches.get(key).parts.push(g);originals.push(o);oldGeometries.add(o.geometry);});
 for(const o of originals)o.removeFromParent();
 for(const batch of batches.values()){const geometry=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const size=name==='uv'?2:3;const count=batch.parts.reduce((n,g)=>n+g.getAttribute('position').count,0);const array=new Float32Array(count*size);let offset=0;for(const g of batch.parts){const attr=g.getAttribute(name);if(attr)array.set(attr.array,offset);offset+=g.getAttribute('position').count*size;}geometry.setAttribute(name,new THREE.BufferAttribute(array,size));}const merged=new THREE.Mesh(geometry,batch.material);merged.castShadow=batch.cast;merged.receiveShadow=batch.receive;world.add(merged);for(const g of batch.parts)g.dispose();}
 for(const g of oldGeometries)g.dispose();
 const locations=[
 {name:'Sakura sanctuary',pos:[-2,2,-5],id:'sakura',category:'Game art',color:'#f5b0ce',description:'Architecture, atmosphere and a quiet world after dark. Step inside the teahouse that inspired this island.'},
 {name:'The maker’s workshop',pos:[-10,1,1],ids:['tractor','sword'],category:'Game art',color:'#ffcc7b',description:'From a working machine to an imagined weapon. Explore form, modelling and the details that give objects character.'},
 {name:'Digital playground',pos:[8,1,-4],category:'UI / UX',color:'#8edbff',description:'Interfaces made for real moments. Explore seven studies in products, interaction and digital experiences.'},
 {name:'The design market',pos:[8,1,6],category:'Packaging',color:'#f6bd7c',description:'Ideas you can hold. A collection of packaging studies in colour, typography and shelf presence.'},
 {name:'Visual atelier',pos:[-7,1,9],category:'Visual design',color:'#c6b8ff',description:'A place to experiment with composition, print, apparel and visual storytelling.'},
 {name:'Identity garden',pos:[5,1,-10],category:'Branding',color:'#bde7a0',description:'Distinctive identities, grown from a clear idea. Discover Europa, Aira and Kaltika.'}
 ];
 const $=s=>document.querySelector(s),keys=new Set(),visited=new Set();
 let dragging=false,pointerId=null,lastX=0,lastY=0,dragTravel=0,dirty=true,lastRender=0,elapsed=0;
 let selected=-1,flight=0,arrival=0,night=1,nightGoal=1,jumpVelocity=0,jumpHeight=0,nearest=-1;
 let cameraDistance=90,cameraElevation=.75,cameraAngle=.95,lookTarget=new THREE.Vector3(-4,1,0);
 const panel=$('#district-panel'),map=$('#island-map'),toast=$('#world-toast');let toastTimer;
 function notify(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);}
 function districtProjects(loc){return projects.filter(p=>loc.id?p.id===loc.id:loc.ids?loc.ids.includes(p.id):p.category===loc.category);}
 const anchors=locations.map((loc,i)=>{
  const b=document.createElement('button');b.className='world-label';b.innerHTML=`<span class="number">0${i+1}</span><span class="label-name">${loc.name}</span><span class="arrow">↗</span>`;b.setAttribute('aria-label',`Explore ${loc.name}`);labelHost.appendChild(b);b.onclick=()=>visit(i);
  const mb=document.createElement('button');mb.innerHTML=`<span>0${i+1}</span>${loc.name}<i>↗</i>`;mb.onclick=()=>visit(i);$('#map-locations').appendChild(mb);
  return{...loc,button:b,mapButton:mb,vector:new THREE.Vector3(loc.pos[0],i===0?9.8:5,loc.pos[2])};
 });
 const trophyButton=document.createElement('button');trophyButton.className='world-label trophy-label';trophyButton.innerHTML='<span class="number">✦</span><span class="label-name">Achievements</span>';trophyButton.setAttribute('aria-label','View achievements');trophyButton.onclick=()=>openAchievement();labelHost.appendChild(trophyButton);const trophyPosition=new THREE.Vector3(0,2.8,3);
 const atmosphere=makeAtmosphere(THREE,{scene,world,locations,projects,rand,waterMat,windowMat});
 function closeMap(){map.hidden=true;$('#map-toggle').setAttribute('aria-expanded','false');}
 $('#map-toggle').onclick=()=>{map.hidden=!map.hidden;$('#map-toggle').setAttribute('aria-expanded',String(!map.hidden));};
 function updateDiscovery(){ $('#discovery-count').textContent=`${visited.size} / 6 discovered`;anchors.forEach((a,i)=>{a.mapButton.classList.toggle('visited',visited.has(i));a.button.classList.toggle('visited',visited.has(i));});}
 function visit(i){
  selected=(i+locations.length)%locations.length;const loc=locations[selected];visited.add(selected);updateDiscovery();keys.clear();exploring=false;flight=motion?1.8:0;arrival=0;
  document.body.classList.remove('exploring');document.body.classList.add('visiting');$('#explore-help').hidden=true;$('#quest').hidden=true;$('#interact').hidden=true;closeMap();
  panel.hidden=false;panel.classList.remove('arrived');if(!motion)panel.classList.add('arrived');$('#district-index').textContent=`0${selected+1} / 06`;$('#district-category').textContent=loc.category+' / DISTRICT';$('#district-title').textContent=loc.name;$('#district-description').textContent=loc.description;
  $('#district-projects').replaceChildren(...districtProjects(loc).map(p=>{const b=document.createElement('button');b.className='district-project';b.dataset.project=p.id;const img=document.createElement('img');img.src=p.cover;img.alt='';const copy=document.createElement('span');const title=document.createElement('strong');title.textContent=p.title;const sub=document.createElement('small');sub.textContent=p.tagline;copy.append(title,sub);b.append(img,copy,document.createTextNode('↗'));return b;}));
  $('#world-state').textContent=loc.name;target.set(loc.pos[0],selected===0?4.3:2.5,loc.pos[2]);distance=mobile()?28:(selected===0?28:23);elevation=.36;angle=[.3,.65,.45,-.3,.6,.7][selected];dirty=true;hero.scrollIntoView({behavior:'instant'});
  anchors.forEach((a,n)=>a.button.classList.toggle('active',n===selected));atmosphere.select(selected);
 }
 $('#district-next').onclick=()=>visit(selected+1);$('#district-prev').onclick=()=>visit(selected-1);
 $('#tour').onclick=()=>visit(0);$('#district-close').onclick=()=>leave();
 function overviewDistance(){return mobile()?Math.max(63,35/(.63*camera.aspect)):62;}
 function updateCamera(dt=.016,snap=false){
  const blend=snap?1:1-Math.exp(-dt*3.2);
  if(exploring){target.lerp(new THREE.Vector3(character.position.x,1.6,character.position.z),1-Math.exp(-dt*3));}
  else if(selected<0){target.set(mobile()?0:-8,mobile()?5:1,0);}
  lookTarget.lerp(target,blend);cameraDistance=THREE.MathUtils.lerp(cameraDistance,distance,blend);cameraElevation=THREE.MathUtils.lerp(cameraElevation,elevation,blend);cameraAngle=THREE.MathUtils.lerp(cameraAngle,angle,blend);
  desired.set(Math.sin(cameraAngle)*Math.cos(cameraElevation)*cameraDistance,Math.sin(cameraElevation)*cameraDistance,Math.cos(cameraAngle)*Math.cos(cameraElevation)*cameraDistance).add(lookTarget);
  // Offset the destination to the right of its editorial panel on wider screens.
  if(selected>=0&&!mobile()){const shift=new THREE.Vector3(-Math.cos(cameraAngle),0,Math.sin(cameraAngle)).multiplyScalar(4);desired.add(shift);camera.position.copy(desired);camera.lookAt(lookTarget.clone().add(shift));}
  else{camera.position.copy(desired);camera.lookAt(lookTarget);}camera.updateMatrixWorld();
 }
 function positionLabels(){const w=host.clientWidth,h=host.clientHeight;for(const [i,a]of anchors.entries()){const p=a.vector.clone().project(camera);a.button.style.left=`${(p.x*.5+.5)*w}px`;a.button.style.top=`${(-p.y*.5+.5)*h}px`;a.button.hidden=selected>=0||p.z>1||p.x<-.94||p.x>.94||p.y>.8||p.y<-.65;}const p=trophyPosition.clone().project(camera);trophyButton.style.left=((p.x*.5+.5)*w)+'px';trophyButton.style.top=((-p.y*.5+.5)*h)+'px';trophyButton.hidden=selected>=0||p.z>1||Math.abs(p.x)>.94||Math.abs(p.y)>.72;}
 function reset(){angle=.62;elevation=.53;distance=overviewDistance();target.set(-6,2,0);dirty=true;}
 function enter(){selected=-1;panel.hidden=true;closeMap();exploring=true;flight=1;document.body.classList.remove('visiting');document.body.classList.add('exploring');$('#explore-help').hidden=false;$('#quest').hidden=false;$('#world-state').textContent='Free roam';distance=mobile()?30:24;angle=.4;elevation=.72;hero.scrollIntoView({behavior:'instant'});atmosphere.select(-1);renderer.domElement.focus({preventScroll:true});dirty=true;}
 function leave(){selected=-1;exploring=false;keys.clear();panel.hidden=true;document.body.classList.remove('exploring','visiting');$('#explore-help').hidden=true;$('#quest').hidden=true;$('#interact').hidden=true;$('#world-state').textContent='A world of ideas';anchors.forEach(a=>a.button.classList.remove('active'));atmosphere.select(-1);reset();dirty=true;}
 $('#explore').onclick=enter;$('#leave-world').onclick=leave;$('#reset').onclick=leave;
 $('#daylight').onclick=()=>{nightGoal=1-nightGoal;document.body.classList.toggle('night',!!nightGoal);$('#daylight').innerHTML=nightGoal?'☀ <span>Daylight</span>':'☾ <span>Nightfall</span>';$('#daylight').setAttribute('aria-pressed',String(!nightGoal));dirty=true;};
 const motionButton=$('#motion');function syncMotion(){motionButton.innerHTML=motion?'Ⅱ <span>Pause motion</span>':'▷ <span>Resume motion</span>';motionButton.setAttribute('aria-pressed',String(!motion));motionButton.title=motion?'Pause ambient animation':'Resume ambient animation';dirty=true;}syncMotion();motionButton.onclick=()=>{motion=!motion;syncMotion();};reduced.addEventListener('change',e=>{motion=!e.matches;syncMotion();});
 $('#quality').onclick=()=>{qualityMode=(qualityMode+1)%3;low=qualityMode===1||(qualityMode===0&&mobile());renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.75));sun.shadow.mapSize.set(low?512:1024,low?512:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}$('#quality').innerHTML=`◈ <span>Quality: ${['Auto','Low','High'][qualityMode]}</span>`;resize();};
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function ray(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(atmosphere.hitTargets,false)[0];}
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!exploring&&selected<0)return;dragging=true;pointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;dragTravel=0;renderer.domElement.setPointerCapture(pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging){const hit=ray(e);renderer.domElement.style.cursor=hit?'pointer':'grab';atmosphere.hover(hit?.object);return;}if(e.pointerId!==pointerId)return;dragTravel+=Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY);angle-=(e.clientX-lastX)*.005;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-lastY)*.003,.18,1.2);lastX=e.clientX;lastY=e.clientY;dirty=true;});
 renderer.domElement.addEventListener('pointerup',e=>{if(dragTravel<7){const hit=ray(e);if(hit?.object.userData.district!==undefined)visit(hit.object.userData.district);else if(hit?.object.userData.project)openProject(hit.object.userData.project);else if(hit?.object.userData.achievement)openAchievement();}dragging=false;pointerId=null;});renderer.domElement.addEventListener('pointercancel',()=>{dragging=false;pointerId=null;});
 renderer.domElement.addEventListener('wheel',e=>{if(!exploring&&selected<0)return;e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.025,12,70);dirty=true;},{passive:false});
 const jump=()=>{if(exploring&&jumpHeight===0){jumpVelocity=5.8;dirty=true;}};$('#jump').onclick=jump;
 $('#interact').onclick=()=>{if(nearest===-2)openAchievement();else if(nearest>=0)visit(nearest);};
 window.addEventListener('keydown',e=>{if(dialogOpen()||e.target.closest('button,a,input,textarea'))return;if(e.key==='Escape'&&(exploring||selected>=0)){leave();return;}if(!exploring)return;if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Shift',' '].includes(e.key)){e.preventDefault();keys.add(e.key);if(e.key===' ')jump();}if(e.key.toLowerCase()==='e'){if(nearest===-2)openAchievement();else if(nearest>=0)visit(nearest);}});window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());
 document.querySelectorAll('[data-direction]').forEach(b=>{const k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[b.dataset.direction];b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(k);};b.onpointerup=b.onpointercancel=()=>keys.delete(k);});
 function dialogOpen(){return $('#project-dialog').open;}
 window.addEventListener('portfolio:pause',()=>{paused=true;keys.clear();});window.addEventListener('portfolio:resume',()=>{paused=false;dirty=true;});document.addEventListener('visibilitychange',()=>{paused=document.hidden||dialogOpen();keys.clear();dirty=true;});
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;dirty=true;},{threshold:0}).observe(hero);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#scene-status').hidden=false;$('#scene-status').innerHTML='The 3D view paused. <a href="#work">Your projects are still available ↗</a>';});renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();if(selected<0&&!exploring)distance=overviewDistance();else if(selected>=0)distance=mobile()?28:(selected===0?28:23);dirty=true;}
 window.addEventListener('resize',resize);new ResizeObserver(resize).observe(host);reset();
 const obstacles=[[-2,-5,3.4,3],[-10,1,2.1,2],[8,-4,2.6,2.3],[8,6,2.2,1.9],[-7,9,2,1.8]];
 const valid=p=>Math.hypot(p.x,p.z)<16&&!obstacles.some(([x,z,w,d])=>Math.abs(p.x-x)<w&&Math.abs(p.z-z)<d);
 let collected=0;const nightColor=new THREE.Color('#151a31'),dayColor=new THREE.Color('#d9cbdc');
 function frame(time){requestAnimationFrame(frame);if(paused||!visible||dialogOpen()){lastRender=time;return;}const dt=Math.min((time-lastRender)/1000,.04);if(time-lastRender<(low?32:16))return;lastRender=time;
  let walking=false;
  if(exploring&&keys.size){let dx=0,dz=0;if(keys.has('w')||keys.has('ArrowUp'))dz-=1;if(keys.has('s')||keys.has('ArrowDown'))dz+=1;if(keys.has('a')||keys.has('ArrowLeft'))dx-=1;if(keys.has('d')||keys.has('ArrowRight'))dx+=1;
   const velocity=new THREE.Vector3(dx,0,dz).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),angle);const speed=keys.has('Shift')?7:4;const next=character.position.clone().addScaledVector(velocity,dt*speed);
   if(valid(next)){character.position.copy(next);walking=dx!==0||dz!==0;}else{const slide=character.position.clone();slide.x=next.x;if(valid(slide)){character.position.x=slide.x;walking=dx!==0;}slide.copy(character.position);slide.z=next.z;if(valid(slide)){character.position.z=slide.z;walking=dz!==0;}}
   if(walking)character.rotation.y=Math.atan2(velocity.x,velocity.z);dirty=true;
  }
  if(jumpHeight>0||jumpVelocity>0){jumpVelocity-=dt*14;jumpHeight=Math.max(0,jumpHeight+jumpVelocity*dt);if(jumpHeight===0)jumpVelocity=0;dirty=true;}
  if(exploring){let best=5.5;nearest=-1;locations.forEach((l,i)=>{const d=Math.hypot(character.position.x-l.pos[0],character.position.z-l.pos[2]);if(d<best){best=d;nearest=i;}});if(Math.hypot(character.position.x,character.position.z-3)<2.2)nearest=-2;$('#interact').hidden=nearest===-1;if(nearest===-2)$('#interact').innerHTML='View achievements <span>E</span>';else if(nearest>=0)$('#interact').innerHTML=`Discover ${locations[nearest].name} <span>E</span>`;
   for(const idea of atmosphere.ideas){if(!idea.userData.collected&&Math.hypot(character.position.x-idea.position.x,character.position.z-idea.position.z)<1.1){idea.userData.collected=true;idea.visible=false;collected++;$('#quest-count').textContent=collected===5?'All 5 ideas found. Keep creating.':`Find the 5 floating ideas · ${collected} / 5`;notify(collected===5?'✦ Every great world starts with curiosity. You found all five ideas!':`✧ Idea ${collected} / 5 discovered`);atmosphere.burst(character.position);}}
  }
  if(motion||walking){elapsed+=dt;for(let i=0;i<petalCount;i++){const p=petalData[i];dummy.position.set(p.x+Math.sin(elapsed*.3+p.s)*.8,((p.y-elapsed*.28)%10+10)%10,p.z+Math.cos(elapsed*.25+p.s)*.4);dummy.rotation.set(elapsed*.4+p.s,elapsed*.3,p.s);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.instanceMatrix.needsUpdate=true;legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(elapsed*12+i*Math.PI)*.65:0);arms.forEach((l,i)=>l.rotation.x=walking?Math.sin(elapsed*12-i*Math.PI)*.45:0);dirty=true;}
  character.position.y=.35+jumpHeight+(walking?Math.abs(Math.sin(elapsed*12))*.06:0);
  night=THREE.MathUtils.lerp(night,nightGoal,motion?1-Math.exp(-dt*2):1);hemi.intensity=THREE.MathUtils.lerp(2.4,1.25,night);sun.intensity=THREE.MathUtils.lerp(3.7,1.4,night);fill.intensity=THREE.MathUtils.lerp(1.3,2.5,night);sun.color.set(night>.5?'#aebeff':'#ffe3bb');windowMat.emissiveIntensity=.48+night*2;scene.fog.color.copy(dayColor).lerp(nightColor,night);renderer.toneMappingExposure=1.2-night*.15;
  if(Math.abs(night-nightGoal)>.001)dirty=true;
  if(flight>0){flight-=dt;dirty=true;}if(selected>=0){arrival+=dt;if(arrival>.45||!motion)panel.classList.add('arrived');}
  atmosphere.update(elapsed,dt,night,motion);
  if(dirty||dragging){updateCamera(dt,!motion);positionLabels();renderer.render(scene,camera);if(!motion&&!walking&&!dragging&&!jumpHeight&&Math.abs(night-nightGoal)<.001)dirty=false;}
 }
 for(let i=0;i<petalCount;i++){dummy.position.set(petalData[i].x,petalData[i].y,petalData[i].z);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.instanceMatrix.needsUpdate=true;
 if(!motion){cameraDistance=distance;cameraAngle=angle;cameraElevation=elevation;}updateCamera();positionLabels();renderer.render(scene,camera);requestAnimationFrame(frame);Promise.all(textureLoads).then(()=>dirty=true);
}
