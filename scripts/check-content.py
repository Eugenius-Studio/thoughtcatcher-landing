#!/usr/bin/env python3
"""Validate generated SEO content, links, assets, structured data and sitemap."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.images=[]; self.meta={}; self.canon=[]
        self.h1=0; self.title=''; self.json=[]; self._capture=None; self._text=''
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','script','link'):
            u=a.get('src') or (a.get('href') if tag=='link' and a.get('rel') in ('stylesheet','icon') else None)
            if u: self.links.append(u)
        if tag=='img': self.images.append(a)
        if tag=='meta': self.meta[a.get('name') or a.get('property')]=a.get('content')
        if tag=='link' and a.get('rel')=='canonical': self.canon.append(a.get('href'))
        if tag=='title' or (tag=='script' and a.get('type')=='application/ld+json'):
            self._capture=tag; self._text=''
    def handle_data(self,data):
        if self._capture: self._text+=data
    def handle_endtag(self,tag):
        if self._capture==tag:
            if tag=='title': self.title=self._text
            else: self.json.append(json.loads(self._text))
            self._capture=None

def local(path):
    p=ROOT/path.lstrip('/')
    if path.endswith('/') or p.is_dir(): p=p/'index.html'
    return p

paths=json.loads((ROOT/'content/seo/generated-paths.json').read_text())
paths+=['/blog/'+p.name for p in (ROOT/'blog').glob('*.html') if '/blog/'+p.name not in paths and p.name!='index.html']
pages={}; errors=[]; titles={}; descriptions={}; links_checked=0
for path in paths:
    f=local(path)
    if not f.exists(): errors.append(f'Missing page {path}'); continue
    text=f.read_text()
    try: page=Page(text)
    except Exception as e: errors.append(f'{path}: parse error {e}'); continue
    pages[path]=page
    if page.h1!=1: errors.append(f'{path}: {page.h1} h1 headings')
    if len(page.ids)!=len(set(page.ids)): errors.append(f'{path}: duplicate IDs')
    if len(page.canon)!=1 or page.canon[0]!='https://blurts.app'+path: errors.append(f'{path}: canonical mismatch')
    if '{{' in text or 'BLURTS_VERIFIED' in text: errors.append(f'{path}: unresolved template')
    if page.title in titles: errors.append(f'{path}: duplicate title with {titles[page.title]}')
    titles[page.title]=path
    desc=page.meta.get('description')
    if not desc: errors.append(f'{path}: missing description')
    if desc in descriptions: errors.append(f'{path}: duplicate description')
    descriptions[desc]=path
    if 'data-generated="blurts-content"' in text:
        for m in ('og:title','og:description','og:url','twitter:card'):
            if not page.meta.get(m): errors.append(f'{path}: missing {m}')
        if not page.json: errors.append(f'{path}: missing structured data')
        if path.startswith('/blog/') and path!='/blog/':
            types={j['@type'] for j in page.json}
            if not {'BlogPosting','BreadcrumbList','FAQPage'}.issubset(types): errors.append(f'{path}: missing article schemas')
    for img in page.images:
        if not img.get('alt') or not img.get('width') or not img.get('height'): errors.append(f'{path}: image metadata missing')

for path,page in pages.items():
    for url in page.links:
        parsed=urlsplit(url)
        if parsed.scheme in ('data','mailto','tel'): continue
        if parsed.netloc and parsed.netloc!='blurts.app': continue
        dest=parsed.path
        if not dest: dest=path
        elif not dest.startswith('/'): dest=str(Path(path).parent/dest)
        f=local(unquote(dest))
        links_checked+=1
        if not f.exists(): errors.append(f'{path}: broken link {url}'); continue
        if parsed.fragment and f.suffix=='.html':
            target=pages.get(dest) or Page(f.read_text())
            if unquote(parsed.fragment) not in target.ids: errors.append(f'{path}: missing anchor {url}')

sitemap=ET.parse(ROOT/'sitemap.xml')
urls=[n.text for n in sitemap.getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if len(urls)!=len(set(urls)): errors.append('Duplicate sitemap URLs')
for path in paths:
    if 'https://blurts.app'+path not in urls: errors.append(f'{path}: absent from sitemap')
for p in json.loads((ROOT/'content/seo/features.json').read_text()):
    if p.get('status') in ('preview','blocked','draft'):
        url='https://blurts.app/blog/'+p['slug']+'.html'
        if url in urls: errors.append(f'Unreleased article in sitemap: {url}')

report={'pages':len(pages),'internal_links_and_assets_checked':links_checked,'sitemap_urls':len(urls),'errors':errors}
print(json.dumps(report,indent=2))
sys.exit(bool(errors))
