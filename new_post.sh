#!/usr/bin/env bash

set -euo pipefail

slug="${1:-TODO}"
post_file="_posts/$(date +%F)-${slug}.md"

if [[ -e "$post_file" ]]; then
  echo "Post already exists: $post_file" >&2
  exit 1
fi

cat > "$post_file" <<'EOF'
---
layout: post
title: 
image: images/
image-alt: 
comments: false
description: 
tags: []
discuss_on_twitter: 
---

<img src="/images/" alt="" class="centered_img" width="" height="" />

### Footnotes

<ol style="font-size: 0.9em">
<li></li>
</ol>
EOF

echo "Created $post_file"
