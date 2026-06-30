# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **Jekyll static site** (Derek Croote's personal blog) built with Ruby/Bundler and deployed via GitHub Pages. There is no Node/`package.json`; the `scripts/*.js` files are client-side browser assets, not build scripts.

### Services
- **Jekyll dev server** (the only service): `bundle exec jekyll serve -H 0.0.0.0 -P 4000` → serves on `http://localhost:4000`. This is the entire product.
- **Supabase** (optional, hosted cloud): powers only the per-post "like" button via the URL/key in `_config.yml`. There is no local Supabase/DB to run; the site builds and renders fully without it.

### Non-obvious gotchas
- Gems are installed **outside the repo** at `~/.jekyll-bundle` via a global bundler `path` config. This is intentional: `_config.yml` defines a custom `exclude:` list which **overrides Jekyll's default excludes**, so a repo-local `vendor/bundle` would get scanned by Jekyll and break the build (it tries to parse the Jekyll gem's `site_template` posts and fails on an invalid date). Keep gems out of the repo tree.
- Do not edit `_config.yml` to add `vendor` to `exclude` as a workaround unless intended — installing gems outside the repo is the cleaner fix.
- `Gemfile.lock` is gitignored; running `bundle install` regenerates it locally.

### Lint/test
- `bundle exec htmlproofer ./_site --disable-external` validates built HTML/links (run after `jekyll build`/`serve`). Note: it currently reports pre-existing content failures (http-vs-https external links, dev-server URLs); these are not environment issues and there is no CI test command configured in the repo.
