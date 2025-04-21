---
layout: post
title: Build and Host a Custom Domain Static Website for Free
image: /images/quick_website/hugo_profile_theme_screenshot.png
image-alt: Hugo Profile theme screenshot
comments: false
description: Build and host a custom domain website for free using Hugo, GitHub, and Render. This step-by-step guide walks through creating a professional static website with zero hosting costs.
---

Free hosting of custom domain websites? Many companies advertise "free website hosting" and it can be frustrating to finally find, buried in a FAQ, that custom domain hosting is an additional charge.

This abbreviated tutorial describes the set of tools and services that allows you to build and host a custom domain website for free (beyond the cost of the domain name itself).
I applied this flow to quickly launch a website for my wife, but note that it does assume some familiarity with `git`, `docker`, and web development owing to use of the following services:

- Custom domain: [Namecheap](https://namecheap.com).
- Static site generator: [Hugo](https://gohugo.io) and [Docker](https://docker.com)
- Site template: [Hugo Themes](https://themes.gohugo.io)
- Code hosting: [GitHub](https://github.com)
- Website hosting: [Render](https://render.com)

A big thanks to all of the open source developers and the overall ecosystem of services that make this sort of thing possible, it really is incredible.

## 1. Buy a custom domain on [Namecheap](https://namecheap.com)

This is the only step that costs money. Of course it doesn't have to be Namecheap, but [as I've said before](/2021/12/24/github-pages-custom-domain.html), I like their product and they have good default privacy.

## 2. Use the Hugo docker image to create a new site

Installations can be a pain, which makes the existence of pre-built Docker images so great. Thanks [@klakegg](https://github.com/klakegg). Note the commands below assume you're using a Unix-like OS and you've installed Docker or Docker Desktop. Also, you may want to use a more up-to-date version of the Docker image depending on when you're reading this.

For creating a new site:

<pre><code class="language-bash">docker run --rm -it \
-v $(pwd):/src \
klakegg/hugo:0.111.2 new site name-of-my-awesome-site -f=yaml
</code></pre>

## 3. Find a suitable Hugo template

There are a lot of great options at [Hugo Themes](https://themes.gohugo.io). Follow the [creating a site instructions](https://gohugo.io/getting-started/quick-start/#create-a-site) from Hugo for commands to add your theme. I ended up using the [Hugo Profile](https://themes.gohugo.io/hugo-profile/) theme by [@gurusabarish](https://github.com/gurusabarish).

## 4. Customize the site based on the template

Depending on the chosen theme and the modifications you'd like to make, this can require some web development expertise. One modification I wanted was to open links to external websites in new tabs/windows. For that I followed the blog post [Hugo - Open External Links in a New Tab](https://digitaldrummerj.me/hugo-links-to-other-pages/) by [@digitaldrummerj](https://github.com/digitaldrummerj).

For building the site and testing it locally on localhost port `1313`, again use Docker:

<pre><code class="language-bash">docker run --rm -it \
-v $(pwd):/src \
-p 1313:1313 \
klakegg/hugo:0.111.2 server
</code></pre>

Note there is also an option to build the site without launching a local server, but that won't be necessary since Render will build the site for us later.

## 5. Push the site to GitHub

- Create a new repo on GitHub. While GitHub Pages requires the repo be public, Render does not and therefore this can be a private repo.
- Use the `.gitignore` file [from Hugo](https://github.com/github/gitignore/blob/main/community/Golang/Hugo.gitignore) to avoid pushing unnecessary files. At the time of this writing, it consisted of:

<pre><code class="language-bash"># Generated files by hugo
/public/
/resources/\_gen/
/assets/jsconfig.json
hugo_stats.json

# Executable may be added to repository
hugo.exe
hugo.darwin
hugo.linux

# Temporary lock file while building
/.hugo_build.lock
</code></pre>

- Commit the files and push to GitHub

## 6. Create a Render account and link to GitHub

This process is simplest if you sign up using your GitHub account since you'll need to link Render to your GitHub repo anyway. I recommend limiting permissions to the repo you'll be using for your website.

For the build command, use `hugo --gc --minify` and for the publish directory, use `public` per the [instructions here](https://render.com/docs/deploy-hugo).

## 7. Add the custom domain to Render

The [Render instructions](https://render.com/docs/custom-domains) are very straightforward and even include a dedicated [Namecheap DNS configuration guide](https://render.com/docs/configure-namecheap-dns).

## 8. Wait a bit, and then you're done!

You now have a live website with a custom domain for only the cost of the domain itself.

Perhaps it was some lingering awe over the speed at which an idea became a reality, but something about the process reminded me of the first website I built nearly twenty years ago. Who knows, maybe in twenty more years an AI will build the site directly from electrical signals streamed from a helmet reading my brain waves as I imagine the perfect site.

## Bonus #1: Contact form (free with no backend!)

[Formspree.io](https://formspree.io) allows you to add a contact form to your website without any backend code. It's a great option if you don't expect many submissions because their "free forever" plan allows for up to 50 submissions per month.

## Bonus #2: Free favicon

[RealFaviconGenerator](https://realfavicongenerator.net/) turned out to be a free, straightforward, and comprehensive way to generate a favicon (several in fact, for different devices and browsers). Thanks [@ph_bernard](https://github.com/phbernard/) (I made a small donation).
