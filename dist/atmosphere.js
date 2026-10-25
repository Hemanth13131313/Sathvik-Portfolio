// Lightweight animated scenery. Shared geometry, instancing and unlit glow sprites
// keep the world expressive without a post-processing pipeline or many lights.
export function makeAtmosphere(T,{scene,world,locations,projects,rand,waterMat}){
 const dynamic=new T.Group();world.add(dynamic);const hitTargets=[],ideas=[];
 const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;const ctx=glowCanvas.getContext('2d');const grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'#fff');grad.addColorStop(.15,'rgba(255,255,255,.65)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);const glowTexture=new T.CanvasTexture(glowCanvas);
 const basic=c=>new T.MeshBasicMaterial({color:c});const solid=c=>new T.MeshStandardMaterial({color:c,roughness:.75});
 function add(geo,material,parent=dynamic){const m=new T.Mesh(geo,material);parent.add(m);return m;}
 function glow(color,size,parent=dynamic){const m=new T.Sprite(new T.SpriteMaterial({map:glowTexture,color,transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending}));m.scale.setScalar(size);parent.add(m);return m;}
 // Small distant islands frame the main garden, with stratified rock below it.
 const rockGeo=new T.IcosahedronGeometry(1,0),rockMat=solid('#6a6b91');const rocks=new T.InstancedMesh(rockGeo,rockMat,25);dynamic.add(rocks);const d=new T.Object3D();
 for(let i=0;i<25;i++){const a=i/25*Math.PI*2,r=13+rand()*2;d.position.set(Math.cos(a)*r,-2-rand()*2.4,Math.sin(a)*r);d.scale.set(3+rand()*2,1.5+rand()*3,3+rand()*2);d.rotation.set(rand(),rand(),rand());d.updateMatrix();rocks.setMatrixAt(i,d.matrix);}
 const satellites=[];
 for(const [x,y,z,s]of [[-28,2,-15,3.3],[29,6,-24,3],[-24,9,-34,2],[31,-1,12,2.4]]){
  const g=new T.Group();g.position.set(x,y,z);dynamic.add(g);const rock=add(new T.ConeGeometry(s,s*1.6,7),rockMat,g);rock.rotation.z=Math.PI;rock.position.y=-s*.6;const top=add(new T.CylinderGeometry(s,s*.9,.4,9),solid('#819e9c'),g);const stem=add(new T.CylinderGeometry(.12,.2,2.6,6),solid('#7a5069'),g);stem.position.y=1.3;const crown=add(new T.IcosahedronGeometry(s*.65,1),solid('#c784b4'),g);crown.position.y=2.9;crown.scale.y=.65;glow('#f9b1c9',6,g).position.y=2.5;satellites.push({g,y});
 }
 const moon=add(new T.SphereGeometry(3.5,24,16),basic('#fff0d7'));moon.position.set(-23,28,-43);const moonGlow=glow('#bfb8ff',20);moonGlow.position.copy(moon.position);
 const starGeo=new T.BufferGeometry(),starPositions=[];for(let i=0;i<280;i++){const a=rand()*6.28,r=60+rand()*90;starPositions.push(Math.cos(a)*r,15+rand()*60,Math.sin(a)*r);}starGeo.setAttribute('position',new T.Float32BufferAttribute(starPositions,3));const stars=new T.Points(starGeo,new T.PointsMaterial({color:'#e5dbff',size:.22,transparent:true,opacity:.8,depthWrite:false}));scene.add(stars);
 // Every project district has a rotating, clickable beacon and breathing ground ring.
 const beacons=locations.map((loc,i)=>{const g=new T.Group();g.position.set(loc.pos[0],i===0?10:5,loc.pos[2]);dynamic.add(g);const crystal=add(new T.OctahedronGeometry(.42),new T.MeshStandardMaterial({color:loc.color,emissive:loc.color,emissiveIntensity:.65,metalness:.35,roughness:.2}),g);crystal.userData.district=i;hitTargets.push(crystal);const halo=add(new T.TorusGeometry(.7,.025,5,36),basic(loc.color),g);halo.rotation.x=Math.PI/2;const aura=glow(loc.color,2.8,g);const ground=add(new T.TorusGeometry(i===0?3.8:2.8,.035,5,64),new T.MeshBasicMaterial({color:loc.color,transparent:true,opacity:.5}));ground.rotation.x=Math.PI/2;ground.position.set(loc.pos[0],.32,loc.pos[2]);return{g,crystal,halo,aura,ground,y:g.position.y};});
 // Distinct kinetic exhibits, built from the designer's real portfolio artwork.
 const exhibits=[],loader=new T.TextureLoader();
 // A small achievement monument in the plaza, connected to the real certificates.
 const trophy=new T.Group();trophy.position.set(0,.35,3);dynamic.add(trophy);const gold=new T.MeshStandardMaterial({color:'#edc174',metalness:.65,roughness:.25,emissive:'#ae7227',emissiveIntensity:.15});const pedestal=add(new T.CylinderGeometry(.55,.65,.4,12),solid('#68647d'),trophy);pedestal.position.y=.2;const stem=add(new T.CylinderGeometry(.09,.16,.5,10),gold,trophy);stem.position.y=.65;const cup=add(new T.CylinderGeometry(.42,.16,.5,12,1,true),gold,trophy);cup.position.y=1.1;const trophyStar=add(new T.OctahedronGeometry(.24),basic('#ffe1a1'),trophy);trophyStar.position.y=1.65;glow('#ffe1a1',2,trophy).position.y=1.2;
 for(const side of [-1,1]){const handle=add(new T.TorusGeometry(.22,.04,6,16),gold,trophy);handle.position.set(side*.38,1.12,0);}
 trophy.traverse(o=>{if(o.isMesh){o.userData.achievement=true;hitTargets.push(o);}});
 for(const [id,x,z,w,h,district]of [['sword',-13,1,2.8,1.7,1],['forge',5,-3,1.5,2.4,2],['lumiere',10.8,-3,1.5,2.4,2],['taj',11,7,2,1.5,3],['apparel',-3.5,10,2,1.5,4],['europa',5,-10,2.8,2.1,5]]){
  const p=projects.find(p=>p.id===id);if(!p)continue;const g=new T.Group();g.position.set(x,3.4,z);dynamic.add(g);
  const frame=add(new T.BoxGeometry(w+.16,h+.16,.09),solid('#30354e'),g);const material=new T.MeshBasicMaterial({color:'#fff'});const art=add(new T.PlaneGeometry(w,h),material,g);art.position.z=.051;art.userData.project=id;hitTargets.push(art);
  loader.load(p.cover,t=>{t.colorSpace=T.SRGBColorSpace;material.map=t;material.needsUpdate=true;},undefined,()=>{});
  const lineMat=basic(locations[district].color);for(const side of [-1,1]){const line=add(new T.BoxGeometry(.025,h*.8,.02),lineMat,g);line.position.set(side*(w/2+.16),0,.05);}const base=add(new T.TorusGeometry(w*.55,.025,4,40),lineMat);base.rotation.x=Math.PI/2;base.position.set(x,.4,z);
  exhibits.push({g,y:3.4,district});
 }
 const identityOrbit=new T.Group();identityOrbit.position.set(5,3.4,-10);dynamic.add(identityOrbit);for(let i=0;i<3;i++){const r=add(new T.TorusGeometry(2,.025,5,60),basic('#d8edb7'),identityOrbit);r.rotation.set(i*.7,i*1.1,0);}const identityGem=add(new T.IcosahedronGeometry(.45),new T.MeshStandardMaterial({color:'#b8d89c',metalness:.6,roughness:.25}),identityOrbit);
 const windmill=new T.Group();windmill.position.set(-12,4.8,0);dynamic.add(windmill);for(let i=0;i<4;i++){const blade=add(new T.BoxGeometry(.22,1.7,.08),solid('#dba56c'),windmill);blade.position.set(Math.sin(i*Math.PI/2)*.75,Math.cos(i*Math.PI/2)*.75,0);blade.rotation.z=-i*Math.PI/2;}add(new T.SphereGeometry(.17,8,6),basic('#ffdcaa'),windmill).position.z=.1;
 // Buoyant sky lanterns and warm pools around the paths.
 const lanternGeo=new T.CylinderGeometry(.23,.18,.43,6),lanternMat=new T.MeshStandardMaterial({color:'#ffd69c',emissive:'#ffb451',emissiveIntensity:1.4,roughness:.7});const skyLanterns=new T.InstancedMesh(lanternGeo,lanternMat,24);dynamic.add(skyLanterns);const lanternData=Array.from({length:24},()=>({x:(rand()-.5)*46,z:(rand()-.5)*35-8,y:rand()*18,s:rand()*6.28}));
 const pools=[];for(const [x,z]of [[-2,8],[2,8],[-2,0],[2,0],[-8,4],[-12,3],[6,4],[10,4],[-5,-3],[1,-3],[-4,10]]){const s=glow('#ffbb65',2.3);s.position.set(x,1.65,z);pools.push(s);}
 // Fireflies use a single buffer, with a shared soft texture.
 const flyGeo=new T.BufferGeometry(),flyData=Array.from({length:75},()=>({x:(rand()-.5)*32,z:(rand()-.5)*28,y:.5+rand()*4,s:rand()*8}));const flyArray=new Float32Array(flyData.length*3);flyGeo.setAttribute('position',new T.BufferAttribute(flyArray,3));const flies=new T.Points(flyGeo,new T.PointsMaterial({color:'#ffe2a5',map:glowTexture,size:.3,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));dynamic.add(flies);
 // Water ripples in the vertex shader; the original mesh stays a single draw call.
 const waterTime={value:0};waterMat.onBeforeCompile=shader=>{shader.uniforms.worldTime=waterTime;shader.vertexShader='uniform float worldTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.y += (sin(position.x*1.4+worldTime)*cos(position.z*.8+worldTime*.6))*.045;');};waterMat.needsUpdate=true;
 const ripples=[];for(let i=0;i<5;i++){const m=add(new T.TorusGeometry(18.4+i*.65,.018,4,100),new T.MeshBasicMaterial({color:'#a7d6e8',transparent:true,opacity:.3}));m.rotation.x=Math.PI/2;m.position.y=-1.72;ripples.push(m);}
 // Koi swim around the outer water, each assembled from a shared low-poly form.
 const fish=[];for(let i=0;i<7;i++){const g=new T.Group();dynamic.add(g);const body=add(new T.SphereGeometry(.22,8,6),basic(i%2?'#ffd3a1':'#f1a3b8'),g);body.scale.set(.75,.45,2.3);const tail=add(new T.ConeGeometry(.22,.4,3),body.material,g);tail.rotation.x=Math.PI/2;tail.position.z=-.55;fish.push({g,tail,phase:i*.9,r:19+rand()*2});}
 const gemMat=new T.MeshStandardMaterial({color:'#a8fff0',emissive:'#7debd7',emissiveIntensity:1,metalness:.3,roughness:.2});
 for(const [x,z]of [[0,8],[-5,4],[4,4],[-10,-5],[6,-9]]){const m=add(new T.OctahedronGeometry(.33),gemMat);m.position.set(x,1,z);const halo=glow('#a8fff0',1.5,m);m.userData.baseY=1;m.userData.collected=false;ideas.push(m);}
 const burstGeo=new T.BufferGeometry(),burstArray=new Float32Array(90*3);burstGeo.setAttribute('position',new T.BufferAttribute(burstArray,3));const burstPoints=new T.Points(burstGeo,new T.PointsMaterial({color:'#c0fff1',size:.12,transparent:true,depthWrite:false}));dynamic.add(burstPoints);burstPoints.visible=false;let burstAge=9,burstOrigin=new T.Vector3(),selected=-1,hovered;
 let initialized=false;
 return{hitTargets,ideas,select(i){selected=i;},hover(object){hovered=object;},burst(p){burstOrigin.copy(p);burstAge=0;burstPoints.visible=true;},update(time,dt,night,motion){
  stars.material.opacity=night*.8;moon.material.color.set(night>.5?'#fff0d7':'#ffe5a6');moonGlow.material.opacity=.15+night*.4;flies.material.opacity=night;waterMat.color.set(night>.5?'#567b9e':'#8ab7c2');pools.forEach(p=>p.material.opacity=.12+night*.65);
  if(!motion&&initialized)return;initialized=true;waterTime.value=time;
  satellites.forEach(({g,y},i)=>{g.position.y=y+Math.sin(time*.35+i)*.35;});
  exhibits.forEach(({g,y,district},i)=>{g.position.y=y+Math.sin(time*.9+i)*.15;g.rotation.y=Math.sin(time*.3+i)*.12;});identityOrbit.rotation.y=time*.2;identityGem.rotation.x=time*.5;windmill.rotation.z=-time*.5;trophyStar.rotation.y=time*.7;trophyStar.position.y=1.65+Math.sin(time*2)*.08;
  beacons.forEach((b,i)=>{b.g.position.y=b.y+Math.sin(time*1.4+i)*.14;b.crystal.rotation.y=time*.5;b.halo.rotation.z=time*.4;b.g.scale.setScalar(selected===i||hovered===b.crystal?1.3:1);b.ground.material.opacity=(selected===i?.8:.3)+Math.sin(time*2+i)*.12;b.aura.material.opacity=.4+Math.sin(time*2+i)*.1;});
  lanternData.forEach((p,i)=>{d.position.set(p.x+Math.sin(time*.15+p.s),3+(p.y+time*.25)%20,p.z+Math.cos(time*.1+p.s));d.rotation.set(Math.sin(time+p.s)*.1,p.s,.1*Math.cos(time+p.s));d.scale.setScalar(.7+(i%3)*.2);d.updateMatrix();skyLanterns.setMatrixAt(i,d.matrix);});skyLanterns.instanceMatrix.needsUpdate=true;
  flyData.forEach((p,i)=>{flyArray[i*3]=p.x+Math.sin(time*.6+p.s)*.7;flyArray[i*3+1]=p.y+Math.cos(time*.9+p.s)*.35;flyArray[i*3+2]=p.z+Math.cos(time*.6+p.s)*.6;});flyGeo.attributes.position.needsUpdate=true;
  ripples.forEach((r,i)=>{r.material.opacity=.12+Math.sin(time*.8+i)*.09;r.scale.setScalar(1+Math.sin(time*.5+i)*.005);});
  fish.forEach(({g,tail,phase,r})=>{const a=time*.1+phase;g.position.set(Math.sin(a)*r,-1.68,Math.cos(a)*r);g.rotation.y=a+Math.PI/2;tail.rotation.z=Math.sin(time*6+phase)*.3;});
  ideas.forEach((m,i)=>{m.rotation.y=time;m.rotation.z=Math.sin(time+i)*.2;m.position.y=1+Math.sin(time*2+i)*.18;});
  if(burstAge<1.5){burstAge+=dt;for(let i=0;i<90;i++){const a=i*2.4,v=.6+(i%7)*.3;burstArray[i*3]=burstOrigin.x+Math.cos(a)*burstAge*v;burstArray[i*3+1]=burstOrigin.y+1+Math.sin(i*1.7)*burstAge*2+burstAge*2-burstAge*burstAge;burstArray[i*3+2]=burstOrigin.z+Math.sin(a)*burstAge*v;}burstGeo.attributes.position.needsUpdate=true;burstPoints.material.opacity=1-burstAge/1.5;}else burstPoints.visible=false;
 }};
}
