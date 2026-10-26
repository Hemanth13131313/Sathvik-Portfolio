import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const projects=JSON.parse(readFileSync('dist/projects.json','utf8'));
const refs=projects.flatMap(p=>[p.cover,p.video,p.document,...p.images.map(i=>i.src),...(p.caseStudyPages||[]).map(i=>i.src)]).filter(Boolean);
refs.push('assets/satvik-logo.jpeg','assets/satvik-portrait.jpeg');
refs.push('assets/achievement-bootcamp.jpeg','assets/achievement-hackathon.jpeg','vendor/three.module.js','vendor/three.core.js');
const missing=refs.filter(p=>!existsSync('dist/'+p));assert.deepEqual(missing,[],'Missing portfolio files');
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length,'Duplicate project IDs');
console.log(`${projects.length} unique projects, ${projects.reduce((n,p)=>n+p.images.length,0)} artwork images, 2 certificates; all referenced assets exist.`);
