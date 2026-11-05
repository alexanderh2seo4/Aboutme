#!/usr/bin/env python3
"""Check crawlability, metadata, sitemap coverage, assets and internal links."""
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://alexanderh2seo4.github.io/Aboutme/"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.meta, self.ids, self.links = path, {}, [], []
        self.canonical, self.title, self.h1, self.graphs = [], "", 0, []
        self.in_title, self.json_data = False, None
        self.language = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.language = a.get("lang")
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "meta":
            self.meta[a.get("name", a.get("property"))] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href"))
        for attr in ("href", "src"):
            if a.get(attr):
                self.links.append((tag, a[attr]))
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.in_title = True
        if tag == "script" and a.get("type") == "application/ld+json":
            self.json_data = ""

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.json_data is not None:
            self.json_data += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.json_data is not None:
            self.graphs.append(json.loads(self.json_data))
            self.json_data = None


def main():
    errors, titles, descriptions = [], set(), set()
    pages = {p.resolve(): Page(p) for p in ROOT.rglob("*.html") if ".git" not in p.parts}
    sitemap = ET.parse(ROOT / "sitemap.xml")
    locations = [n.text for n in sitemap.findall("{*}url/{*}loc")]
    expected, edges = set(), {}

    def require(condition, message):
        if not condition:
            errors.append(message)

    for path, page in pages.items():
        relative = path.relative_to(ROOT).as_posix()
        url = BASE + (relative[:-10] if relative.endswith("index.html") else relative)
        label = relative + ": "
        require(page.language == "en", label + "missing English language declaration")
        require(page.h1 == 1, label + "expected one primary heading")
        require(page.canonical == [url], label + "canonical URL mismatch")
        require(page.title and page.title not in titles, label + "missing or duplicate title")
        titles.add(page.title)
        description = page.meta.get("description")
        require(description and description not in descriptions, label + "missing or duplicate description")
        descriptions.add(description)
        require(len(page.ids) == len(set(page.ids)), label + "duplicate element IDs")
        indexable = "noindex" not in page.meta.get("robots", "")
        if indexable:
            expected.add(url)
            require(page.graphs, label + "missing structured data")
            require(page.meta.get("og:url") == url, label + "social URL mismatch")
            require(page.meta.get("og:title") == page.title, label + "social title mismatch")
            require(page.meta.get("og:description") == description, label + "social description mismatch")
            require(page.meta.get("og:image", "").startswith(BASE), label + "missing local social image")
            require(page.meta.get("twitter:card") == "summary_large_image", label + "missing sharing card")
            for graph in page.graphs:
                require(graph.get("@context") == "https://schema.org", label + "invalid schema context")
        edges[path] = set()
        for tag, href in page.links:
            resolved = urlsplit(urljoin(url, href))
            if resolved.scheme not in ("http", "https") or resolved.netloc != urlsplit(BASE).netloc:
                continue
            if not resolved.path.startswith(urlsplit(BASE).path):
                require(bool(urlsplit(href).netloc), label + "relative link escapes GitHub Pages project: " + href)
                continue
            target = ROOT / unquote(resolved.path[len(urlsplit(BASE).path):])
            if resolved.path.endswith("/"):
                target /= "index.html"
            target = target.resolve()
            require(target.is_relative_to(ROOT), label + "link escapes checkout: " + href)
            require(target.is_file(), label + "missing local target: " + href)
            if target in pages:
                if tag == "a":
                    edges[path].add(target)
                if resolved.fragment:
                    require(unquote(resolved.fragment) in pages[target].ids, label + "missing anchor: " + href)

    require(len(locations) == len(set(locations)), "duplicate sitemap entries")
    require(set(locations) == expected, "sitemap does not match indexable canonical pages")
    visited, pending = set(), [(ROOT / "index.html").resolve()]
    while pending:
        path = pending.pop()
        if path not in visited:
            visited.add(path)
            pending.extend(edges.get(path, set()) - visited)
    require(set(pages) <= visited, "orphan pages cannot be reached from homepage")
    if errors:
        print("\n".join(errors))
        return 1
    print(f"PASS: {len(pages)} HTML pages, {len(locations)} indexable URLs; metadata, structured JSON, sitemap, assets, internal links and anchors.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
