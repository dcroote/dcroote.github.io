---
layout: post
title: Quickly configure a Namecheap domain for GitHub Pages
image: images/custom-domain/derekcroote-domain.png
image-alt: www.derekcroote.com
description: "Simple tutorial on using a Namecheap domain with GitHub Pages."
comments: false
last_modified_at: 2025-10-13 10:05:00 -0700
tags: [software]
---

I recently transitioned this site from GitHub's freely hosted github.io domain to [https://www.derekcroote.com](https://www.derekcroote.com), purchased on Namecheap, after seeing how quick and inexpensive it was for my sister to create a <a href="https://www.denisecroote.com" target="_blank">beautiful portfolio website</a>.
This short post walks through the process of using a Namecheap domain with GitHub Pages.

**Update**: I now have a separate blog post on [building and hosting a custom domain static website for free](/2023/08/18/website-cheaply.html) that uses Render for hosting rather than GitHub Pages because Render allows you more choice in the web app framework you use for static site generation, while still being free.

## 1. Purchase your Namecheap domain name.

I used Namecheap because of the price and default privacy settings.

## 2. Configure Namecheap DNS settings for GitHub Pages

Within the Namecheap Dashboard, select `Manage` next to the domain, then `Advanced DNS`.
Under `HOST RECORDS`, adjust the `CNAME Record` to point your GitHub Pages domain (`dcroote.github.io` in this case).
Note that the `Host` should be `www` if you're intending on using the `www` subdomain.

Next, create `A` records, with `@` for the `Host`, pointing to [GitHub Pages servers](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain). At the time of this writing, the `A` record `Values` were:

<pre><code class="language-bash">185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
</code></pre>

## 3. Configure the custom domain on GitHub

To use a custom domain, navigate to your GitHub Pages repo's `Settings` then to `Pages`. Enter the domain in the `Custom domain` field and hit `Save`. This will trigger GitHub's DNS check and TLS certificate provisioning, which can take up to an hour. Once complete, I suggest checking the `Enforce HTTPS` box.

That's it!
