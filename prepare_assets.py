from pathlib import Path
from PIL import Image, ImageOps
import json, shutil

root=Path(r'C:\Users\heman\Documents\Sathvik GAD\website-20261021T184325Z-1-001\website')
out=Path(__file__).parent/'dist'/'assets'
out.mkdir(exist_ok=True,parents=True)
projects=[
('sakura','Sakura Teahouse','Game art','3d models/sakura teahouse','A quiet world after dark.','A Japanese-inspired environment with timber architecture, warm lanterns and flowering trees. The supplied work includes a final render, modelling views and a short camera animation.', 'satvik_karnati-0250'),
('tractor','Little tractor, big character','Game art','3d models/low poly tractor','A study in playful proportions.','A stylised yellow tractor explored through clay renders, turnaround views and material breakdowns. The broad forms and contrasting wheels give the vehicle its character.','Low-Poly Yellow and Black Tractor'),
('sword','Cyan Core','Game art','3d models/sword','An energy sword with a luminous edge.','A futuristic prop study combining a cyan energy core with a dark mechanical hilt. The presentation includes material breakdowns and multiple views.','Futuristic Cyan Core Energy Sword'),
('forge','FORGE','UI / UX','UIUX design/mobile application (app)/gym app','Fitness, focus and momentum.','A mobile app concept that brings workout planning, exercise guidance, nutrition and coaching into one focused experience. The design explores a clear loop: plan, train, fuel and review.','Forge Fitness App Promotional Collage'),
('europa','Europa Europa','Branding','brand identatifaction','An identity made for the night.','An electronic music festival identity expressed through cosmic imagery, typography, passes, posters and environmental applications.','Europa Europa Electronic Music Festival'),
('taj','Taj Mahal Tea House','Packaging','product-package design/product (taj tea)/output images','Three places. One collection.','A personal packaging redesign exploring premium tea tins inspired by Jaipur, Kashmir and Mumbai. The concept uses regional imagery to give each variant a distinct character.','Heritage Tea House Collection'),
('lumiere','Lumière','UI / UX','UIUX design/web appliaction/furniture website','A considered space for considered purchases.','A furniture e-commerce interface exploring discovery, collections, product detail, cart and checkout. The accompanying case study reviews clarity, confidence and the shopping journey.','Lumière Workspace_ Curated Rest'),
('apparel','Wear your world','Visual design','t-shirt design','Graphic stories, off the screen.','A collection of apparel graphics and presentation mockups, including anime-inspired hoodies and expressive animal illustrations.','Neon Tiger SAKES Apparel Showcase'),
('flippy','Flippy AI','UI / UX','UIUX design/web appliaction/flipcart ai chatbox','Making comparison easier.','A concept for an AI-assisted shopping experience, exploring conversational discovery, product comparisons and alternatives within a Flipkart-inspired interface.','Flipkart AI Smartphone Showdown'),
('havenly','Havenly','UI / UX','UIUX design/mobile application (app)/(HAVENlY)furniture app','A home for your next home.','A furniture shopping app concept with home discovery, product browsing, product details and cart screens, presented through mobile interface designs and mockups.','Havenly Home Decor App Showcase'),
('nexus','Nexus Admin','UI / UX','UIUX design/dashboard design','Everyday operations, organised.','An administration dashboard study covering overview metrics, inventory, order tracking and customer profiles.','Nexus Admin - Dashboard Overview'),
('mediglass','MediGlass','UI / UX','UIUX design/web appliaction/medical website','Clarity across a shopping journey.','A medical-commerce interface study with a homepage, catalogue, cart, checkout and provider dashboard.','MediGlass _ Home Redesign'),
('archive','ARCHIVE','UI / UX','UIUX design/web appliaction/thrift&co','An editorial approach to fashion.','A dark fashion-commerce interface with collection browsing, product detail, cart and account screens.','MacBook Air (2022)342'),
('aira','Aira Studio','Branding','logo design/aira studio','A mark with an orbit of its own.','A geometric identity study, from the construction of the A-shaped mark to its applications in studio signage and merchandise.','Aira Studio Galactic Brand Showcase'),
('kaltika','Kaltika','Branding','logo design/kaltuka','A sharp identity for a game studio.','A game-studio branding exploration featuring an angular monogram, wordmark construction and branded applications.','KALTIKA Game Studio Branding Showcase (1)'),
('coffee','Iced Coffee Collection','Packaging','product-package design/product( coffee)','A fresh look for a familiar ritual.','A personal Nestlé iced-coffee packaging redesign exploring five flavour variants, label layouts and product presentation.','Nestlé Iced Coffee Flavor Collection-1'),
('chocos','Chocos Fills','Packaging','product-package design/kellogg_s repackage desing','Playful packaging, clear information.','A personal Kellogg’s Chocos Fills packaging redesign exploring mascot-led storytelling, shelf visibility and front-to-back information hierarchy.','Kellogg’s Chocos Fills Packaging Collage'),
('graphics','Visual notes','Visual design','Graphic design','Posters, promotions and playful details.','A selection of graphic-design work including promotional posts, an event menu and a certificate layout.','Kids’ Fair Menu and Prize Wheel'),
]
data=[]
for slug,title,cat,folder,tag,desc,cover in projects:
    paths=[p for p in (root/folder).rglob('*') if p.suffix.lower() in ['.png','.jpg','.webp']]
    if slug=='graphics': paths=[p for p in paths if not any(t in p.name for t in ['Tractor','Sakura'])]
    if slug=='sakura': paths.extend((root/'Graphic design').glob('Sakura*'))
    if slug=='europa': paths.extend((root/'logo design'/'Europa').glob('*Logo Design Process*'))
    paths.sort(key=lambda p:(p.stem!=cover,p.name))
    item=dict(id=slug,title=title,category=cat,tagline=tag,description=desc,images=[])
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGB'); w,h=im.size
        im.thumbnail((2000,20000)); name=f'{slug}-{i}.webp'; im.save(out/name,'WEBP',quality=86)
        label=p.stem.replace('_',' ').strip()
        if slug=='sakura' and p.suffix=='.webp': label='Final environment render' if '0250' in p.stem else ('Model construction view' if '115158' in p.stem else 'Material assignment view')
        if len(label)<8 or label.startswith(('ChatGPT Image','@','satvik','ssss')): label=f'{title} — artwork {i+1:02}'
        item['images'].append(dict(src='assets/'+name,label=label,width=w,height=h))
        if i==0:
            thumb=ImageOps.fit(Image.open(p).convert('RGB'),(960,720),method=Image.Resampling.LANCZOS)
            thumb.save(out/f'{slug}-cover.webp','WEBP',quality=85)
            item['cover']=f'assets/{slug}-cover.webp'
    pdfs=list((root/folder).rglob('*.pdf'))
    if pdfs:
        shutil.copy2(pdfs[0],out/f'{slug}-case-study.pdf');item['document']=f'assets/{slug}-case-study.pdf'
    if slug=='sakura':
        shutil.copy2(root/folder/'final-output.mp4',out/'sakura-film.mp4');item['video']='assets/sakura-film.mp4'
    data.append(item)
(out.parent/'projects.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Prepared {len(data)} projects, {sum(len(p["images"]) for p in data)} images; {sum(p.stat().st_size for p in out.iterdir())/1048576:.1f} MB total, loaded on demand.')
