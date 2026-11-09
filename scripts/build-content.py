#!/usr/bin/env python3
"""Build the Blurts editorial library using only the Python standard library.

Run from any directory. JSON in content/seo is the source of truth for new
articles. Existing article bodies and the homepage design are retained.
"""
import html
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'content/seo'
ORIGIN = 'https://blurts.app'
DATE = '2026-11-09'
E = html.escape

def load(name):
    p = DATA / name
    return json.loads(p.read_text()) if p.exists() else []

comparisons = load('comparisons.json')
all_features = load('features.json')
features = [p for p in all_features if p.get('status', 'current') not in ('preview', 'blocked', 'draft') and p.get('publish', True)]
articles = comparisons + features
for p in comparisons:
    p['category'] = 'Comparison'
for p in features:
    p.setdefault('category', 'Feature guide')

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def href(p):
    return p.get('url', '/blog/' + p['slug'] + '.html')

def md(s):
    s = E(s)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+|/[^\s)]+)\)', lambda m: '<a href="' + m[2] + '">' + m[1] + '</a>', s)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)

LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="var(--orange)"><rect x="4.5" y="14.5" width="5" height="19" rx="2.5"/><rect x="11.5" y="8.5" width="5" height="31" rx="2.5"/><rect x="18.5" y="16.5" width="5" height="15" rx="2.5"/></g><g fill="currentColor"><rect x="28" y="13.5" width="16" height="5" rx="1.1"/><rect x="28" y="21.5" width="14" height="5" rx="1.1"/><rect x="28" y="29.5" width="12" height="5" rx="1.1"/></g></svg>'

def header(current=''):
    links = ''.join(f'<a href="{url}"' + (' aria-current="page"' if current == url else '') + f'>{label}</a>' for url, label in [('/features/', 'Features'), ('/compare/', 'Compare'), ('/blog/', 'Blog')])
    return '<header class="site-header"><nav class="site-nav" aria-label="Primary"><a class="site-brand" href="/" aria-label="Blurts home">' + LOGO + 'blurts</a><div class="site-links">' + links + '<details class="site-menu"><summary>Explore</summary><div class="menu-links"><a href="/use-cases/">Use cases</a><a href="/features/#integrations">Integrations</a><a href="/blog/#guides">Practical guides</a><a href="/#how">How it works</a><a href="/#lang">Languages</a><a href="/#price">Pricing</a><a href="/#qs">Questions</a></div></details></div><a class="site-cta" href="/#start" onclick="gtag(\'event\',\'click\',{event_category:\'Nav\',event_label:\'Get Blurts\'});">Get Blurts</a></nav></header>'

def integration(p):
    return any(t in p['slug'] for t in ('notion', 'google-tasks', 'microsoft-planner'))

GUIDES = []
for f in sorted((ROOT/'blog').glob('*.html')):
    if f.stem == 'index' or f.stem in [p['slug'] for p in articles] or 'data-generated="blurts-content"' in f.read_text():
        continue
    t = f.read_text()
    title = re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)"', t)
    if title:
        GUIDES.append({'slug': f.stem, 'title': html.unescape(re.sub('<[^>]+>', '', title[1])), 'description': html.unescape(desc[1]) if desc else '', 'category': 'Practical guide'})

def footer():
    guide_labels = {'how-to-break-down-tasks-adhd-executive-dysfunction':'Break down an overwhelming task','how-to-build-a-neurodivergent-friendly-productivity-system':'Build a workable task system','how-to-capture-tasks-before-you-forget-them':'Capture before you forget','how-to-finish-tasks-instead-of-leaving-them-almost-done':'Finish the last step','how-to-stay-focused-on-tasks-neurodivergent':'Return your focus to a task'}
    groups = [('Compare', [(href(p), 'vs ' + p['competitor']) for p in comparisons]),
              ('Features', [('/features/', 'All Blurts features')] + [(href(p), p.get('navTitle', p['title'].split(':')[0])) for p in features if not integration(p)][:7]),
              ('Integrations', [('/blog/blurts-vs-apple-reminders.html', 'Apple Reminders')] + [(href(p), p.get('navTitle', p['title'].split(':')[0])) for p in features if integration(p)]),
              ('Use cases & guides', [('/use-cases/', 'Find your workflow')] + [(href(p), guide_labels.get(p['slug'],p['title'])) for p in GUIDES[:5]])]
    cols = ''.join('<div class="footer-column"><h2>' + label + '</h2><ul>' + ''.join(f'<li><a href="{url}">{E(text)}</a></li>' for url,text in links) + '</ul></div>' for label,links in groups)
    return '<footer class="discovery-footer" aria-label="Explore Blurts"><div class="footer-columns">' + cols + '</div><div class="footer-base"><span>© 2026 Blurts · Say it messy. Get it back clean.</span><span><a href="/privacy.html">Privacy</a> · <a href="mailto:support@blurts.app">Support</a></span></div></footer>'

def schema(data):
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>'

def head(title, desc, path, kind='website', extra=''):
    fulltitle = title if title.startswith('Blurts') else title + ' | Blurts'
    fulltitle = {'/features/':'Blurts Features: Voice Tasks, Lens & Integrations', '/compare/':'Compare Blurts: 7 Task & Voice App Comparisons', '/blog/':'Blurts Blog: Task Capture, Comparisons & Feature Guides', '/use-cases/':'Blurts Use Cases: Capture, Plan & Follow Up'}.get(path,fulltitle)
    canonical = ORIGIN + path
    return f'''<!DOCTYPE html>
<html lang="en" data-generated="blurts-content"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{E(fulltitle)}</title><meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canonical}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="{kind}"><meta property="og:site_name" content="Blurts">
<meta property="og:title" content="{E(fulltitle)}"><meta property="og:description" content="{E(desc)}"><meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{E(fulltitle)}"><meta name="twitter:description" content="{E(desc)}">
<link rel="icon" type="image/svg+xml" href="/assets/blurts-mark.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&amp;family=Instrument+Sans:ital,wght@0,400..700;1,400..700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/tokens.css"><link rel="stylesheet" href="/css/content.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9QP1NHP4F2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-9QP1NHP4F2');</script>
{extra}</head><body class="editorial"><a class="site-skip" href="#main">Skip to content</a>{header(path)}'''

def card(p):
    return f'<article class="editorial-card"><span class="card-kicker">{E(p.get("category", "Guide"))}</span><h3><a href="{href(p)}">{E(p["title"])}</a></h3><p>{E(p["description"])}</p><a class="read-link" href="{href(p)}" aria-label="Read {E(p["title"])}">Read the guide →</a></article>'

def cards(items):
    return '<div class="card-grid">' + ''.join(map(card, items)) + '</div>'

def section(id, title, intro, items):
    return f'<section class="index-section" id="{id}"><h2>{E(title)}</h2><p class="section-intro">{E(intro)}</p>{cards(items)}</section>'

def write(path, text):
    p = ROOT / path.lstrip('/')
    if path.endswith('/'):
        p = p/'index.html'
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text.replace('><','>\n<')+'\n')

def collection(path, title, desc, eyebrow, body, items):
    structured = schema({'@context':'https://schema.org','@type':'CollectionPage','name':title,'description':desc,'url':ORIGIN+path,'mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['title'],'url':ORIGIN+href(p)} for i,p in enumerate(items)]}})
    output = head(title,desc,path,extra=structured) + f'<main id="main" class="content-wrap"><div class="library-hero"><span class="eyebrow">{E(eyebrow)}</span><h1>{E(title)}</h1><p class="intro">{E(desc)}</p><div class="library-meta"><span>From the Blurts team</span><span>Reviewed November 9, 2026</span></div></div>' + body + '</main>' + footer() + '</body></html>'
    write(path,output)



def decision_table(p):
    rows = p.get('table', [])
    if not rows:
        return ''
    return '<div class="table-scroll" role="region" aria-label="Comparison overview" tabindex="0"><table><thead><tr><th scope="col">Decision</th><th scope="col">Blurts</th><th scope="col">' + E(p['competitor']) + '</th></tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>'+E(c)+'</td>' for c in row) + '</tr>' for row in rows) + '</tbody></table></div>'

def figure(image):
    layout = 'screenshot screenshot-wide' if image.get('width',1206) > image.get('height',2622) else 'screenshot'
    return f'<figure class="{layout}"><a href="{image["src"]}" aria-label="Open full-size screenshot"><img src="{image["src"]}" alt="{E(image["alt"])}" width="{image.get("width",1206)}" height="{image.get("height",2622)}" loading="lazy" decoding="async"></a><figcaption>{E(image["caption"])}</figcaption></figure>'

def article(p):
    path = href(p)
    # Release state and internal evidence live in the inventory, not consumer copy.
    sections = p['sections']
    toc = [(slug(s['heading']),s['heading']) for s in sections] + [('questions','Common questions')]
    structured = [{'@context':'https://schema.org','@type':'BlogPosting','headline':p['title'],'description':p['description'],'datePublished':DATE+'T12:00:00-05:00','dateModified':DATE+'T12:00:00-05:00','mainEntityOfPage':ORIGIN+path,'author':{'@type':'Organization','name':'Blurts team','url':ORIGIN+'/'},'publisher':{'@type':'Organization','name':'Blurts','url':ORIGIN+'/'},'inLanguage':'en','articleSection':p['category']},
      {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Blog','item':ORIGIN+'/blog/'},{'@type':'ListItem','position':3,'name':p['title'],'item':ORIGIN+path}]}]
    faqs = p.get('faqs',[])
    if faqs:
        structured.append({'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':f['q'],'acceptedAnswer':{'@type':'Answer','text':f['a']}} for f in faqs]})
    wordcount = len(re.findall(r'\S+',json.dumps(sections)))
    output = head(p.get('seoTitle',p['title']),p['description'],path,'article',''.join(map(schema,structured)))
    output += '<main id="main" class="content-wrap"><div class="breadcrumbs"><a href="/">Home</a> / <a href="/blog/">Blog</a> / '+E(p['category'])+'</div>'
    output += '<article><header class="article-head"><span class="eyebrow">'+E(p['category'])+'</span><h1>'+E(p['title'])+'</h1><p class="intro">'+E(p['description'])+'</p><div class="article-meta"><span>By the Blurts team</span><time datetime="'+DATE+'">November 9, 2026</time><span>'+str(max(3,round(wordcount/210)))+' min read</span></div></header><div class="article-layout"><div class="article-body">'
    if p.get('notice'):
        output += '<aside class="availability-note">'+md(p['notice'])+'</aside>'
    if p.get('competitor'):
        output += decision_table(p)
    for i,s in enumerate(sections):
        output += '<section aria-labelledby="'+slug(s['heading'])+'"><h2 id="'+slug(s['heading'])+'">'+E(s['heading'])+'</h2>'
        output += ''.join('<p>'+md(t)+'</p>' for t in s.get('paragraphs',[]))
        if s.get('bullets'):
            output += '<ul>'+''.join('<li>'+md(t)+'</li>' for t in s['bullets'])+'</ul>'
        output += '</section>'
        for img in p.get('images',[]):
            if img.get('afterSection',1)==i:
                output += figure(img)
    output += '<section class="faq" aria-labelledby="questions"><h2 id="questions">Common questions</h2>'+''.join('<h3>'+E(f['q'])+'</h3><p>'+md(f['a'])+'</p>' for f in faqs)+'</section>'
    if p.get('sources'):
        output += '<section class="sources"><h2>Sources & further reading</h2><p>Reviewed November 9, 2026. Product plans and availability can change.</p><ul>'+''.join('<li><a href="'+E(s['url'])+'">'+E(s['label'])+'</a></li>' for s in p['sources'] if s['url'].startswith(('https://','/')))+'</ul></section>'
    if p.get('competitor'):
        output += '<p class="sources">Written by the Blurts team. Competitor details come from the official sources above; the examples are evaluation suggestions, not benchmark results.</p>'
    output += '<div class="article-cta"><h2>Try one real thought.</h2><p>Start with something you actually need to do. Review the result and decide whether the workflow fits your day.</p><a href="/#start">Get Blurts</a></div></div><aside class="article-toc" aria-label="On this page"><strong>On this page</strong><ol>'+''.join('<li><a href="#'+i+'">'+E(t)+'</a></li>' for i,t in toc)+'</ol></aside></div></article>'
    related_map = {
      'notion-integration':['blurts-vs-notion','voice-to-tasks'],
      'google-tasks-integration':['blurts-vs-google-tasks','natural-language-due-dates'],
      'microsoft-planner-integration':['blurts-vs-microsoft-to-do','edit-complete-tasks'],
      'lens-task-filters':['automatic-task-organization','natural-language-due-dates'],
      'voice-to-tasks':['edit-complete-tasks','multilingual-task-capture'],
      'multilingual-task-capture':['voice-to-tasks','live-transcription'],
      'home-screen-widgets':['voice-to-tasks','daily-task-reminder'],
      'task-archive':['home-screen-widgets','lens-task-filters'],
      'daily-task-reminder':['natural-language-due-dates','task-archive'],
      'blurts-vs-notion':['notion-integration','voice-to-tasks'],
      'blurts-vs-google-tasks':['google-tasks-integration','natural-language-due-dates'],
      'blurts-vs-microsoft-to-do':['microsoft-planner-integration','voice-to-tasks']}
    wanted = related_map.get(p['slug'],['voice-to-tasks','lens-task-filters','edit-complete-tasks'])
    related = [x for k in wanted for x in articles if x['slug']==k and x['slug']!=p['slug']][:2]
    output += '<section class="related"><h2>Keep exploring</h2>'+cards(related)+'</section></main>'+footer()+'</body></html>'
    write(path,output)

def shared_existing(file, home=False):
    t = file.read_text()
    # Shared elements are marked, so rebuilding never duplicates navigation.
    nav = '<!-- discovery-header:start -->'+header()+'<!-- discovery-header:end -->'
    foot = '<!-- discovery-footer:start -->'+footer()+'<!-- discovery-footer:end -->'
    if '<!-- discovery-header:start -->' in t:
        t = re.sub(r'<!-- discovery-header:start -->.*?<!-- discovery-header:end -->',lambda _:nav,t,flags=re.S)
    elif home:
        t = re.sub(r'<nav>.*?</nav>',lambda _:nav,t,count=1,flags=re.S)
    else:
        t = re.sub(r'<header class="header">.*?</header>',lambda _:nav,t,count=1,flags=re.S)
    if '<!-- discovery-footer:start -->' in t:
        t = re.sub(r'<!-- discovery-footer:start -->.*?<!-- discovery-footer:end -->',lambda _:foot,t,flags=re.S)
    else:
        t = re.sub(r'<footer\b[^>]*>.*?</footer>',lambda _:foot,t,count=1,flags=re.S)
    if 'href="/css/content.css"' not in t:
        tokens = '' if 'css/tokens.css' in t else '<link rel="stylesheet" href="/css/tokens.css">'
        t = t.replace('</head>',tokens+'<link rel="stylesheet" href="/css/content.css"></head>')
    canonical = ORIGIN + ('/' if home else '/blog/'+file.name)
    if 'rel="canonical"' not in t:
        t = t.replace('</head>',f'<link rel="canonical" href="{canonical}"></head>')
    if home:
        t = t.replace('Apple Reminders, Apple Calendar, Google Tasks, Google Calendar or Notion','Apple Reminders, Notion, Google Tasks or Microsoft Planner')
        t = t.replace('Apple Reminders, Apple Calendar, Google Tasks, Google Calendar','Google Tasks or Microsoft Planner')
        t = t.replace('Notion, Google Tasks or Microsoft Planner —','Apple Reminders, Notion, Google Tasks or Microsoft Planner —')
        t = t.replace('Apple Reminders, Apple Reminders,','Apple Reminders,')
        t = t.replace('Personal &middot; reminder set','Personal &middot; date captured')
        t = t.replace('Personal &middot; date captured','Task &middot; date captured')
        t = t.replace('<li>Lands in <b style="color:var(--ink);font-weight:600">Google Tasks or Microsoft Planner</b> or <b style="color:var(--ink);font-weight:600">Notion</b></li>','<li>Connect one destination: Notion or Google Tasks</li>')
        t = t.replace('As many Notion databases as you like, not just one','Connect multiple supported destinations')
        t = t.replace('Connect multiple supported destinations','Connect multiple destinations, including Microsoft Planner')
        t = t.replace('Syncs on its own, in the background','Send captured tasks to your connected tools')
        # New header/footer sit inside the existing bounded .wrap.
        if 'discovery-home-layout' not in t:
            t = t.replace('</head>','<style id="discovery-home-layout">.wrap>.site-header{padding:0}.wrap>.discovery-footer{padding-left:0;padding-right:0;display:block}.wrap>.discovery-footer .footer-columns{width:100%}</style></head>')
    file.write_text(t)

def main():
    for p in articles:
        article(p)
    collection('/features/','A thought, then a task.', 'Explore Blurts features for voice capture, task review, daily planning, and the tools where your work already lives.', 'Blurts features',
      '<div class="jump-links"><a href="#capture">Capture & organize</a><a href="#integrations">Integrations</a><a href="#daily">Your daily workflow</a></div>'
      + section('capture','Capture it while it is still on your mind.','Speak naturally, review the result, and keep the useful details.',[p for p in features if not integration(p) and not any(t in p['slug'] for t in ('archive','widget','notification','reminder'))])
      + section('integrations','Keep your existing destination.','Supported destinations include Apple Reminders, Notion, Google Tasks, and Microsoft Planner. Explore the workflow that fits the tool you already use.',[p for p in features if integration(p)]) + '<p class="section-intro"><a href="/blog/blurts-vs-apple-reminders.html">Explore Blurts with Apple Reminders and Siri →</a></p>'
      + section('daily','Return to the things that matter.','A smaller view of your commitments, with clear limits on reminders and history.',[p for p in features if any(t in p['slug'] for t in ('archive','widget','notification','reminder'))]),features)
    collection('/compare/','Choose the workflow you will use.','Seven detailed Blurts comparisons, with competitor strengths, practical trade-offs, and a way to test each choice in your own day.','Compare task capture',
      '<section class="index-section"><h2>Start with the app you already use.</h2><p class="section-intro">Voice capture is available in several of these products. The useful question is what happens to the task after you speak.</p>'+cards(comparisons)+'</section>',comparisons)
    collection('/blog/','Less to carry in your head.','Practical guides to capturing thoughts, choosing a task workflow, and getting more from Blurts.','The Blurts library',
      '<div class="jump-links"><a href="#comparisons">Comparisons</a><a href="#features">Feature guides</a><a href="#guides">Practical guides</a></div>'
      +section('comparisons','Make an informed choice.','Honest comparisons of capture, planning, and the work of switching.',comparisons)
      +section('features','Know what happens next.','Detailed walkthroughs of Blurts features and supported integrations.',features)
      +section('guides','Make room for the next thing.','Ideas for capturing commitments and making tasks easier to return to.',GUIDES), articles+GUIDES)
    cases = [
      ('between-meetings','After a conversation, before the next one.','Capture your own follow-ups in a short recording. Review each action, date, and destination before treating the conversation as handled.',[p for p in features if 'voice' in p['slug'] or 'planner' in p['slug']][:3]),
      ('existing-system','Your task system already works. Capture does not.','Keep your existing Notion database or Google Tasks list and improve the step that happens before a task reaches it.',[p for p in features if integration(p)]),
      ('mixed-languages','Your thought crosses languages.','Say the task in the language it arrives in. Review names and dates in the result, especially when switching languages in the same recording.',[p for p in features if any(t in p['slug'] for t in ('language','transcript','edit'))]),
      ('daily-review','You captured it. Now find what needs you.','Use dates, organization, and Lens to focus the list. Remember that a due date and a due-time alarm are different things.',[p for p in features if any(t in p['slug'] for t in ('lens','date','organiz','reminder'))])]
    collection('/use-cases/','Find your way back to the task.','Start with the moment that keeps getting in your way, then explore the Blurts features that support it.','Use cases', ''.join(section(*c) for c in cases),features)
    shared_existing(ROOT/'index.html',True)
    for p in GUIDES:
        shared_existing(ROOT/'blog'/f'{p["slug"]}.html')
    # Keep all existing URLs and lastmod values; add current public content only.
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('',ns)
    tree = ET.parse(ROOT/'sitemap.xml')
    urls = {el.find('{'+ns+'}loc').text:el for el in tree.getroot()}
    for path in ['/','/blog/','/features/','/compare/','/use-cases/']+[href(p) for p in articles]:
        url = ORIGIN+path
        el = urls.get(url)
        if el is None:
            el = ET.SubElement(tree.getroot(),'{'+ns+'}url')
            ET.SubElement(el,'{'+ns+'}loc').text=url
        mod = el.find('{'+ns+'}lastmod')
        if mod is None:
            mod = ET.SubElement(el,'{'+ns+'}lastmod')
        mod.text=DATE
    ET.indent(tree,space='  ')
    tree.write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
    (DATA/'generated-paths.json').write_text(json.dumps(['/','/blog/','/features/','/compare/','/use-cases/']+[href(p) for p in articles],indent=2)+'\n')
    print(f'Built {len(comparisons)} comparisons, {len(features)} feature guides, and 4 indexes; updated {len(GUIDES)} existing guides.')

if __name__=='__main__':
    main()
