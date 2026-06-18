# jfmartin67.github.io

My official GitHub home page → **[githome.numericcitizen.me](https://githome.numericcitizen.me)**

A Jekyll site with a dark "mission-control" aesthetic that catalogs my
repositories with a short description for each. Private repos are listed by
name + description only — they are intentionally **not** linked.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The page — header, quote, toolbar, and the repository feed (loops over the data file). |
| `_data/repositories.yml` | The repository catalog. **Edit this to add/update repos or descriptions.** |
| `_layouts/default.html` | HTML shell: fonts, theme bootstrap, background layers. |
| `assets/css/style.css` | All styling (dark + light themes via CSS variables). |
| `assets/js/main.js` | Matrix rain, live clock, relative times, collapsibles, theme toggle, filter. |
| `CNAME` | Custom domain (`githome.numericcitizen.me`). |

## Editing the repo list

Everything visible comes from `_data/repositories.yml`. Each entry:

```yaml
- name: my-repo
  desc: One-line description.
  lang: TypeScript        # drives the colored language dot; use ~ for none
  private: true           # true → "Private" badge, false → "Public"
  updated: 2026-06-17T10:44:24Z   # last push; rendered as "x ago"
```

Descriptions marked `# inferred` in the data file had no GitHub description and
were written by hand — adjust them as you like.

## Local preview (optional)

```sh
bundle install
bundle exec jekyll serve
```

GitHub Pages builds and deploys automatically on push to `master`.
