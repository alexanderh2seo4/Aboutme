#!/usr/bin/env python3
"""Generate static project pages and the canonical sitemap. No dependencies."""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://alexanderh2seo4.github.io/Aboutme/"
UPDATED = "2026-11-05"  # Change only after a substantive content update.
PERSON = BASE + "#alexander-kluge"
PROJECTS = json.loads((ROOT / "content/projects.json").read_text())
PRESS = json.loads((ROOT / "content/press.json").read_text())


def head(title, description, path, structured):
    asset_prefix = "../../" if path.startswith("projects/") and path != "projects/" else "../" if path else ""
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(description, quote=True)}">
<meta name="author" content="Alexander Kluge">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0b0c0e">
<link rel="canonical" href="{BASE + path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alexander Kluge">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(description, quote=True)}">
<meta property="og:url" content="{BASE + path}">
<meta property="og:image" content="{BASE}assets/social-preview.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Alexander Kluge — software, drones and chemistry projects">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title, quote=True)}">
<meta name="twitter:description" content="{escape(description, quote=True)}">
<meta name="twitter:image" content="{BASE}assets/social-preview.png">
<meta name="twitter:image:alt" content="Alexander Kluge — software, drones and chemistry projects">
<link rel="icon" href="{asset_prefix}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{asset_prefix}style.css?v=4">
<link rel="sitemap" type="application/xml" href="{BASE}sitemap.xml">
<script type="application/ld+json">{json.dumps(structured, ensure_ascii=False).replace('<', chr(92) + 'u003c')}</script>
</head>
<body>
<canvas id="sky" aria-hidden="true"></canvas>
<a class="skip-link" href="#main">Skip to content</a>
<main class="wrap project-page" id="main">
'''


def footer(prefix):
    return f'''  <footer>
    <a href="{prefix}">About Alexander</a> <span class="dot">·</span>
    <a href="{prefix}projects/">All projects</a> <span class="dot">·</span>
    <a href="{prefix}press/">Press</a> <span class="dot">·</span>
    <a href="{prefix}sitemap.xml">Sitemap</a><br>
    <a href="{prefix}impressum.html">Legal notice</a> <span class="dot">·</span>
    <a href="{prefix}datenschutz.html">Privacy</a>
  </footer>
</main>
<script src="{prefix}stars.js?v=3" defer></script>
</body>
</html>
'''


def link_list(links):
    if not links:
        return ""
    return '<ul class="project-links">\n' + "\n".join(
        f'  <li><a href="{escape(url, quote=True)}">{escape(label)}</a></li>'
        for label, url in links
    ) + "\n</ul>\n"


def breadcrumbs(path, name=None):
    items = [
        {"@type": "ListItem", "position": 1, "name": "Alexander Kluge", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": "Projects", "item": BASE + "projects/"},
    ]
    if name:
        items.append({"@type": "ListItem", "position": 3, "name": name, "item": BASE + path})
    return {"@type": "BreadcrumbList", "itemListElement": items}


def build():
    projects_by_slug = {p["slug"]: p for p in PROJECTS}
    for p in PROJECTS:
        path = f'projects/{p["slug"]}/'
        page_url = BASE + path
        graph = {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "WebPage", "@id": page_url + "#page", "url": page_url,
                 "name": p["title"], "description": p["description"], "inLanguage": "en",
                 "isPartOf": {"@id": BASE + "#website"}, "author": {"@id": PERSON},
                 "mainEntity": {"@id": page_url + "#project"}},
                {"@type": "CreativeWork", "@id": page_url + "#project", "url": page_url,
                 "name": p["name"], "description": p["summary"],
                 "contributor": {"@id": PERSON},
                 "subjectOf": [{"@type": "WebPage", "url": url, "name": label}
                               for s in p["sections"] for label, url in s.get("links", [])]},
                {"@type": "Person", "@id": PERSON, "name": "Alexander Kluge", "url": BASE},
                breadcrumbs(path, p["name"]),
            ],
        }
        output = head(p["title"], p["description"], path, graph)
        output += f'''  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="../../">Alexander Kluge</a> / <a href="../">Projects</a> / <span aria-current="page">{escape(p['name'])}</span>
  </nav>
  <header>
    <p class="eyebrow">{escape(p['category'])}</p>
    <h1>{escape(p['name'])}</h1>
    <p class="project-lead">{escape(p['summary'])}</p>
  </header>
'''
        for s in p["sections"]:
            anchor = f' id="{escape(s["id"], quote=True)}"' if s.get("id") else ""
            output += f'  <section{anchor}>\n    <h2>{escape(s["heading"])}</h2>\n'
            output += "".join(f'    <p>{escape(paragraph)}</p>\n' for paragraph in s["paragraphs"])
            output += link_list(s.get("links", [])) + "  </section>\n"
        references = [r for r in PRESS if r["project"] == p["slug"]]
        if references:
            output += '  <section>\n    <h2>Press &amp; official references</h2>\n'
            output += link_list([(r["publisher"] + ": " + r["label"], r["url"]) for r in references])
            output += '    <p><a href="../../press/">Browse all press coverage and references</a>.</p>\n  </section>\n'
        output += '  <section>\n    <h2>Related projects</h2>\n'
        output += link_list([(projects_by_slug[slug]["name"], f"../{slug}/") for slug in p["related"]])
        output += '    <p><a href="../../#contact">Contact Alexander Kluge</a> about this work.</p>\n  </section>\n'
        output += footer("../../")
        directory = ROOT / path
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "index.html").write_text(output)

    title = "Projects by Alexander Kluge — Software, Drones & Chemistry"
    description = "Explore Alexander Kluge's current and past projects: JAR Medical, TriARge, ems-voice, MEDICRAFT, Storm Patrol, ReqFlow, AFS, Super Slides and InnovAlloy."
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": BASE + "projects/#page", "url": BASE + "projects/",
         "name": title, "description": description, "inLanguage": "en",
         "isPartOf": {"@id": BASE + "#website"}, "about": {"@id": PERSON},
         "mainEntity": {"@type": "ItemList", "itemListElement": [
             {"@type": "ListItem", "position": i, "name": p["name"], "url": BASE + f'projects/{p["slug"]}/'}
             for i, p in enumerate(PROJECTS, 1)]}},
        {"@type": "Person", "@id": PERSON, "name": "Alexander Kluge", "url": BASE},
        breadcrumbs("projects/"),
    ]}
    output = head(title, description, "projects/", graph)
    output += '''  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../">Alexander Kluge</a> / <span aria-current="page">Projects</span></nav>
  <header>
    <p class="eyebrow">Current work &amp; past projects</p>
    <h1>Software, drones &amp; chemistry projects</h1>
    <p class="project-lead">I’m Alexander Kluge, based in Neubiberg near Munich. My work ranges from emergency software and speech AI to drone systems, volunteer tools and materials research. This directory connects the projects with their public websites, demos, code and coverage.</p>
  </header>
  <section aria-labelledby="directory-title">
    <h2 id="directory-title">Explore the projects</h2>
'''
    for p in PROJECTS:
        output += f'''    <article class="item">
      <h3><a href="{p['slug']}/">{escape(p['name'])}</a></h3>
      <p>{escape(p['summary'])}</p>
      <span class="meta">{escape(p['category'])}</span>
    </article>
'''
    output += '  </section>\n' + footer("../")
    (ROOT / "projects/index.html").write_text(output)
    title = "Press & Project Coverage — Alexander Kluge"
    description = "Newspaper coverage and official references for Alexander Kluge's JAR Medical and InnovAlloy projects, including Süddeutsche Zeitung, Merkur and Jugend forscht."
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": BASE + "press/#page", "url": BASE + "press/",
         "name": title, "description": description, "inLanguage": "en", "about": {"@id": PERSON},
         "isPartOf": {"@id": BASE + "#website"}, "mainEntity": {
             "@type": "ItemList", "itemListElement": [
                 {"@type": "ListItem", "position": i, "name": r["label"], "url": r["url"]}
                 for i, r in enumerate(PRESS, 1)]}},
        {"@type": "Person", "@id": PERSON, "name": "Alexander Kluge", "url": BASE},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Alexander Kluge", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Press", "item": BASE + "press/"}]},
    ]}
    output = head(title, description, "press/", graph)
    output += '''  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../">Alexander Kluge</a> / <span aria-current="page">Press</span></nav>
  <header>
    <p class="eyebrow">Press &amp; public references</p>
    <h1>Project coverage &amp; official references</h1>
    <p class="project-lead">Newspaper articles about my projects, alongside project profiles and award announcements from the organizations involved. Each reference links back to the relevant project. Articles remain on their publishers’ websites; some may require a subscription.</p>
  </header>
'''
    for category, kinds in [("Newspaper coverage", {"Newspaper coverage"}),
                            ("Official announcements & project references", {"Official press release", "Official project reference", "Official award reference"})]:
        output += f'  <section>\n    <h2>{escape(category)}</h2>\n'
        for r in PRESS:
            if r["kind"] not in kinds:
                continue
            project = projects_by_slug[r["project"]]
            output += f'''    <article class="item">
      <h3><a href="{escape(r['url'], quote=True)}">{escape(r['label'])}</a></h3>
      <p>{escape(r['publisher'])} · {escape(r['date'])}</p>
      <p><a href="../projects/{r['project']}/">{escape(project['name'])}</a></p>
      <span class="meta">{escape(r['kind'])}</span>
    </article>
'''
        output += '  </section>\n'
    output += footer("../")
    (ROOT / "press").mkdir(exist_ok=True)
    (ROOT / "press/index.html").write_text(output)
    paths = ["", "projects/", "press/"] + [f'projects/{p["slug"]}/' for p in PROJECTS]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "".join(f'  <url><loc>{BASE + path}</loc><lastmod>{UPDATED}</lastmod></url>\n' for path in paths)
    sitemap += "</urlset>\n"
    (ROOT / "sitemap.xml").write_text(sitemap)
    print(f"Built {len(PROJECTS) + 1} project pages, a press page and a sitemap with {len(paths)} URLs.")


if __name__ == "__main__":
    build()
