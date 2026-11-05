# Alexander Kluge — personal website

Live: [alexanderh2seo4.github.io/Aboutme](https://alexanderh2seo4.github.io/Aboutme/)

A static portfolio connecting my software, drone and chemistry projects with
public demos, source code and press coverage. English content, system fonts,
no tracking, cookies, external font requests or runtime dependencies. The
optional canvas starfield respects reduced-motion preferences.

- [Project directory](https://alexanderh2seo4.github.io/Aboutme/projects/)
- [JAR Medical projects and public tools](https://alexanderh2seo4.github.io/Aboutme/projects/jar-medical/)
- [Press and official references](https://alexanderh2seo4.github.io/Aboutme/press/)
- [XML sitemap](https://alexanderh2seo4.github.io/Aboutme/sitemap.xml)

## Edit and preview

`index.html` is the hand-maintained profile. Edit project content in
`content/projects.json` and verified press references in `content/press.json`.
Keep newspaper coverage distinct from official announcements and project
references. Add only verified public links; never link private repositories or
publish personal source datasets. Private implementation details are not part
of this site. Generated HTML is committed so GitHub Pages needs no build step.

```sh
python3 scripts/build_projects.py
python3 scripts/check_site.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Project content, navigation and metadata work
without JavaScript. Shared styles live in `style.css`; bump its `?v=` parameter
in the homepage, legal pages and generator after changing it. `stars.js` is the
only runtime script. Keep its version parameter aligned if it changes.

The checker validates titles, descriptions, canonical URLs, social metadata,
structured JSON, sitemap membership, local assets, internal links and anchors,
and that every page is reachable from the homepage. CI also rebuilds the
project/press pages and rejects stale generated output.

## Search and sharing

The site includes unique page titles and descriptions, self-referencing
canonical URLs, ProfilePage/Person/WebSite structured data, project references,
breadcrumbs and a 1200 × 630 social preview image. The XML sitemap contains
only the ten canonical indexable pages. Legal and privacy pages retain
`noindex, follow` and are excluded from the sitemap.

For a substantive content update, update `UPDATED` in the generator before
rebuilding; do not refresh sitemap dates for cosmetic edits. Update the
homepage ProfilePage date when its content changes. Google documents these
practices in its [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
and [sitemap guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

To monitor actual search performance, use the Search Console URL-prefix
property `https://alexanderh2seo4.github.io/Aboutme/` and submit
`https://alexanderh2seo4.github.io/Aboutme/sitemap.xml`. Submission and indexing
are not performed by the build. Use URL Inspection to check the homepage,
project directory and JAR Medical page after deployment. Google decides when
to crawl/index pages; metadata and structured data do not guarantee rankings
or a rich result.

This is a GitHub Pages *project* site. A file at `/Aboutme/robots.txt` would not
control crawlers for this host; the applicable robots file is at
`https://alexanderh2seo4.github.io/robots.txt`. Do not add a misleading project-
level robots file or include other domains' URLs in this sitemap. JAR Medical
maintains its own sitemap.

## Public link audit — 5 November 2026

Project websites, public repositories, JAR Medical tools, the transcription
service's `/health` endpoint, Merkur and official award pages returned HTTP
200. LinkedIn blocks automated requests (999), and the two Süddeutsche
Zeitung articles return bot-access restrictions (403). Those newspaper links
were independently verified through indexed publisher results. AFS's working
public map is at `https://alexanderh2seo4.github.io/AFS/`. Super Slides links to
its repository because its guessed Pages address returned 404.

## Publish

GitHub Pages serves branch `claude/personal-portfolio-site-ga5lsq`, directory
`/`, of `alexanderh2seo4/Aboutme`. A normal push to that branch deploys the site;
check the Pages build and the live files afterward. `.nojekyll` preserves the
static files. Do not change repository visibility or hosting settings as part
of routine content work.

The legal notice and privacy policy deliberately list only town/postcode
(85579 Neubiberg), with no street address. Keep that existing choice intact.
