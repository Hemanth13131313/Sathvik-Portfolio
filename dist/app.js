const grid=document.querySelector('#project-grid');
const filters=document.querySelector('#filters');
const dialog=document.querySelector('#project-dialog');
const detail=document.querySelector('#project-detail');
let projects=[],category='All work',lastFocus=null,lastScrollY=0;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const selected=projects.filter(p=>category==='All work'||p.category===category);
 document.querySelector('#project-count').textContent=`${String(selected.length).padStart(2,'0')} projects`;
 grid.innerHTML=selected.map((p,i)=>`<button class="project-card" data-project="${p.id}" aria-label="View ${escape(p.title)} — ${p.category}"><div class="project-image"><img src="${p.cover}" width="960" height="720" loading="lazy" decoding="async" alt="${escape(p.title)} — ${escape(p.tagline)}"><span class="card-arrow" aria-hidden="true">↗</span></div><div class="project-meta"><h3>${escape(p.title)}</h3><span>${p.category}</span></div><p>${escape(p.tagline)}</p></button>`).join('');
 filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.textContent===category));
}
function openProject(id,update=true){
 const p=projects.find(x=>x.id===id);if(!p)return;
 if(!dialog.open){lastFocus=document.activeElement;lastScrollY=window.scrollY;}
 const next=projects[(projects.indexOf(p)+1)%projects.length];
 detail.innerHTML=`<div class="detail-header"><div class="eyebrow">${p.category.toUpperCase()} / PORTFOLIO PROJECT</div><h2 id="detail-title">${escape(p.title)}</h2><p>${escape(p.description)}</p><div class="detail-tags"><span>Designer: Satvik Karnati</span><span>${p.images.length} images</span>${p.document?`<a href="${p.document}" target="_blank" rel="noopener">Read the case study ↗</a>`:''}</div></div>${p.caseStudyPages?.length?`<section class="case-study" aria-label="${escape(p.title)} case study"><div class="case-study-heading"><div><p class="eyebrow">01 / CASE STUDY</p><h3>The thinking behind the design.</h3></div><a href="${p.document}" target="_blank" rel="noopener">Open original PDF ↗</a></div><div class="case-study-pages">${p.caseStudyPages.map((page,i)=>`<figure><img src="${page.src}" width="${page.width}" height="${page.height}" alt="${escape(page.label)}" loading="${i===0?'eager':'lazy'}" decoding="async"><figcaption>${String(i+1).padStart(2,'0')} / ${p.caseStudyPages.length} — ${escape(p.title)} case study</figcaption></figure>`).join('')}</div></section><div class="artwork-heading"><p class="eyebrow">02 / PROJECT GALLERY</p><h3>Explore the final work.</h3></div>`:''}<div class="detail-gallery">${p.video?`<video controls playsinline preload="none" poster="${p.images[0].src}" aria-label="Sakura Teahouse camera animation"><source src="${p.video}" type="video/mp4"></video>`:''}${p.images.map((im,i)=>`<figure><img src="${im.src}" alt="${escape(im.label)}" width="${im.width}" height="${im.height}" loading="${i===0?'eager':'lazy'}" decoding="async" tabindex="0" role="button" aria-label="Expand ${escape(im.label)}" aria-expanded="false"><figcaption>${String(i+1).padStart(2,'0')} / ${escape(im.label)}</figcaption></figure>`).join('')}</div><p class="detail-note">${['Packaging','UI / UX'].includes(p.category)?'Portfolio concept / design study. Brand names identify the subject of the work; no brand affiliation or measured business outcome is claimed.':'Original portfolio images supplied by Satvik Karnati.'} The interactive garden is a recreated presentation environment, separate from the project artwork.</p><div class="detail-next"><span>Keep exploring</span><button data-project="${next.id}">${escape(next.title)} ↗</button></div>`;
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';window.dispatchEvent(new Event('portfolio:pause'));
 if(update)history.pushState({project:id},'',`#project/${id}`);
}
function closeProject(){if(dialog.open)dialog.close();}
function openAchievement(update=true){
 if(!dialog.open){lastFocus=document.activeElement;lastScrollY=window.scrollY;}
 detail.innerHTML=`<div class="detail-header"><p class="eyebrow">ACHIEVEMENTS / CONTINUING TO LEARN</p><h2 id="detail-title">UI/UX Mastery Bootcamp</h2><p>Participation in the UI/UX Mastery Bootcamp with Techgyan Technologies at BITS Pilani, Hyderabad, on 3 January 2026. These two supplied certificates document workshop and hackathon participation for the same event.</p><div class="detail-tags"><span>Satvik Karnati</span><span>3 January 2026</span><span>Workshop certificate: W39-095</span></div></div><div class="certificate-gallery">${[['bootcamp','Workshop participation certificate'],['hackathon','Hackathon participation certificate']].map(([id,title])=>`<figure><div class="certificate-landscape"><img src="assets/achievement-${id}.jpeg" alt="${title} issued to Satvik Karnati for the UI/UX Mastery Bootcamp on 3 January 2026" width="1061" height="1500"></div><figcaption>${title}<a href="assets/achievement-${id}.jpeg" target="_blank" rel="noopener">Open original ↗</a></figcaption></figure>`).join('')}</div>`;
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';window.dispatchEvent(new Event('portfolio:pause'));
 if(update)history.pushState({achievement:true},'','#achievement/uiux-2026');
}
document.querySelectorAll('[data-achievement]').forEach(b=>b.addEventListener('click',()=>openAchievement()));
document.querySelector('#close-dialog').addEventListener('click',closeProject);
dialog.addEventListener('close',()=>{document.body.style.overflow='';detail.querySelectorAll('video').forEach(v=>v.pause());window.dispatchEvent(new Event('portfolio:resume'));if(location.hash.startsWith('#project/'))history.replaceState(null,'','#work');if(location.hash.startsWith('#achievement/'))history.replaceState(null,'','#achievements');lastFocus?.focus({preventScroll:true});requestAnimationFrame(()=>window.scrollTo({top:lastScrollY,behavior:'instant'}));});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();}});
function expandImage(img){img.parentElement.classList.toggle('image-full');img.setAttribute('aria-expanded',img.parentElement.classList.contains('image-full'));}
detail.addEventListener('click',e=>{if(e.target.matches('.detail-gallery img'))expandImage(e.target);});
detail.addEventListener('keydown',e=>{if(e.target.matches('.detail-gallery img')&&['Enter',' '].includes(e.key)){e.preventDefault();expandImage(e.target);}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(b)openProject(b.dataset.project);});
function hashRoute(){if(location.hash.startsWith('#project/'))openProject(location.hash.slice(9),false);else if(location.hash==='#achievement/uiux-2026')openAchievement(false);else if(dialog.open)closeProject();}
window.addEventListener('hashchange',hashRoute);
window.addEventListener('popstate',hashRoute);
window.addEventListener('portfolio:category',e=>{category=e.detail;render();document.querySelector('#work').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
try{
 const response=await fetch('projects.json');if(!response.ok)throw new Error('Project data unavailable');projects=await response.json();
 filters.innerHTML=['All work','Game art','UI / UX','Branding','Packaging','Visual design'].map(c=>`<button aria-pressed="${c===category}">${c}</button>`).join('');
 filters.addEventListener('click',e=>{if(e.target.matches('button')){category=e.target.textContent;render();}});render();hashRoute();
}catch(e){document.querySelector('#gallery-error').hidden=false;}
const sceneStatus=document.querySelector('#scene-status');
try{const {createWorld}=await import('./world.js');await createWorld(projects,openProject,openAchievement);document.querySelectorAll('[data-world-control]').forEach(b=>b.disabled=false);sceneStatus.hidden=true;}
catch(e){console.error('3D garden unavailable',e);document.body.classList.add('scene-off');sceneStatus.innerHTML='The garden is resting on this device. All projects are available below. <a href="#work">View the portfolio ↗</a>';document.querySelector('#explore').disabled=false;document.querySelector('#explore').onclick=()=>document.querySelector('#work').scrollIntoView();document.querySelector('.world-tools').hidden=true;}
