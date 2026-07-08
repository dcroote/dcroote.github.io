# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **Jekyll static-site blog** (GitHub Pages, `github-pages` gem)
that builds to `_site/`. There is a single service: the Jekyll dev server.

- **Ruby/gems**: Gems install into `vendor/bundle` via a project-local bundle path
  (`.bundle/config`). Both `vendor/` and `.bundle/` are gitignored. `Gemfile.lock`
  is also gitignored, so `bundle install` re-resolves on each run. Run all Jekyll
  commands through `bundle exec`.
- **Build**: `bundle exec jekyll build` (outputs to `_site/`).
- **Run dev server**: `bundle exec jekyll serve -H 0.0.0.0 -P 4000 --livereload`.
  Serves on port 4000; live-reload uses port 35729. Auto-regeneration picks up
  edits to posts/pages without restarting.
- **Lint**: `bundle exec htmlproofer ./_site --disable-external` (html-proofer is in
  the Gemfile). Use `--disable-external` to skip network link checks. Note the repo
  currently has a few pre-existing html-proofer failures in existing posts (a
  non-HTTPS link and images without `src`); these are content issues, not env issues.
- **New posts**: `./new_post.sh <slug>` scaffolds `_posts/<date>-<slug>.md`.
- **Supabase**: The post-likes feature (`scripts/likes.js`, `supabase/`) is an
  optional external integration. Public `supabase_url` / `supabase_publishable_key`
  are already set in `_config.yml`; no local Supabase service is needed to run the site.
- **Docker**: The `Dockerfile` is an alternative way to run the site and is excluded
  from the Jekyll build; it is not required in this environment.
