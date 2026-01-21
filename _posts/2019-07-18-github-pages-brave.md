---
layout: post
title: Verifying Brave Rewards on GitHub Pages using Jekyll
image: images/brave-bat-partnership.svg
image-alt: Brave logo
comments: false
tags: [software]
---

The Brave web browser is an interesting take on providing greater privacy while still rewarding content creators through ads, views, and tips. To explore it a bit more, I thought I would try to verify this GitHub Pages blog.

The [verification process](https://publishers.basicattentiontoken.org/) involves uploading a publicly visible text file to your site, which in this case is the GitHub repository. The issue I ran into was that GitHub builds this blog using the static site generator Jekyll, yet the Brave GitHub Website verification instructions ask you to turn off Jekyll:

> It looks like you are using GitHub. As a GitHub user, you'll need to add an empty file named '.nojekyll' to the root of your repo first.

Instead, based on [this GitHub issue comment](https://github.com/keybase/keybase-issues/issues/366#issuecomment-38749201), I included the `.well-known` directory containing the Brave verification text file `brave-rewards-verification.txt` in the Jekyll build by adding the following line to `_config.yml`:

<pre><code class="language-yaml">include: [".well-known"]</code></pre>

The verification was then successful as the verification file is visible in its [expected location](https://dcroote.github.io/.well-known/brave-rewards-verification.txt).
The full commit showing these changes can be seen [here](https://github.com/dcroote/dcroote.github.io/commit/c8eac2b3c937cb4d0ebf5b3b2b018bfdc8ff3416).
