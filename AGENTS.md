# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **Jekyll static site** (Derek Croote's personal blog) built with Ruby/Bundler and deployed via GitHub Pages. There is no Node/`package.json`; the `scripts/*.js` files are client-side browser assets, not build scripts.

### Services
- **Jekyll dev server** (the only service): `bundle config set --local path vendor/bundle` (once), then `bundle exec jekyll serve` → serves on `http://localhost:4000`. This is the entire product.
- **Supabase** (optional, hosted cloud): powers only the per-post "like" button via the URL/key in `_config.yml`. There is no local Supabase/DB to run; the site builds and renders fully without it.

### Non-obvious gotchas
- Gems install into the standard `vendor/bundle` (gitignored). `_config.yml`'s `exclude:` list intentionally includes `Gemfile`, `Gemfile.lock`, and `vendor` because a custom `exclude:` **replaces** Jekyll's default excludes rather than extending them — without these entries Jekyll scans `vendor/bundle` (breaking the build) and publishes `Gemfile`/`Gemfile.lock` into `_site`. If you add new entries to `exclude:`, keep these defaults.
- `Gemfile.lock` is gitignored; `bundle install` regenerates it locally.

### Lint/test
- `bundle exec htmlproofer ./_site --disable-external` validates built HTML/links (run after `jekyll build`/`serve`). Note: it currently reports pre-existing content failures (http-vs-https external links, dev-server URLs); these are not environment issues and there is no CI test command configured in the repo.
