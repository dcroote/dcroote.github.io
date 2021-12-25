---
layout: post
title: Quickly configure a custom Namecheap domain for GitHub Pages
image: images/custom-domain/derekcroote-domain.png
image-alt: www.derekcroote.com
comments: false
---

I recently transitioned my site from GitHub's freely hosted github.io domain to [https://www.derekcroote.com](https://www.derekcroote.com) after seeing how quick and inexpensive it was for my sister to create a <a href="https://www.denisecroote.com" target="_blank">beautiful portfolio website</a>.
This short post walks through the process.

## 1. Purchase your Namecheap domain name.

I used Namecheap because of the price and default privacy settings.

## 2. Configure Namecheap DNS settings for GitHub Pages

Within the Namecheap Dashboard, select `Manage` next to the domain, then `Advanced DNS`.
Under `HOST RECORDS`, adjust the `CNAME Record` to point your GitHub Pages domain (`dcroote.github.io` in this case).
Note that the `Host` should be `www` if you're intending on using the `www` subdomain.

Next, create `A` records, with `@` for the `Host`, pointing to [GitHub Pages servers](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain). At the time of this writing, the `A` record `Values` were:

{% highlight  bash %}
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
{% endhighlight %}

## 3. Configure the custom domain on GitHub

To use a custom domain, navigate to your GitHub Pages repo's `Settings` then to `Pages`. Enter the domain in the `Custom domain` field and hit `Save`. This will trigger GitHub's DNS check and TLS certificate provisioning, which can take up to an hour. Once complete, I suggest checking the `Enforce HTTPS` box.

That's it!
