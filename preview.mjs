import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg','.mp4':'video/mp4','.pdf':'application/pdf','.svg':'image/svg+xml'};
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);});}).listen(4176,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4176'));
