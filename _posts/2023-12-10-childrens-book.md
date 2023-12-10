---
layout: post
title: Froggy's Grand Adventure - A Children's Book
image: /images/childrens_book/FroggyChildrensBook.webp
image-alt: First two pages of the children's book Froggy's Grand Adventure by Derek Croote.
comments: false
---
<script src="/scripts/page-flip.browser.js"></script>
A father's way of connecting with his daughter, wrapped in a story of a frog's unexpected adventure.

I hope she can one day appreciate it as a story that is uniquely hers.

You can flip through the book (best viewed in landscape on mobile) by clicking your mouse or swiping with your finger:

<div id="book" style="margin: 10px 0 40px 0">
<div class="page" data-density="hard"><img src="/images/childrens_book/0.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/cover.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/1.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/2.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/3.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/4.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/5.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/6.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/7.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/8.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/9.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/10.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/11.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/12.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/13.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/14.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/15.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/16.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/17.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/18.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/19.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/20.png"></div>
<div class="page" data-density="hard"><img src="/images/childrens_book/back.png"></div>
</div>

### Behind the scenes

This was a fun and meaningful project enabled by technologies that materialized in an extraordinarily short time; slowly, then all of a sudden, as they say. The one challenge I had, and to the astute reader, didn't completely surmount, was character consistency. Not for lack of trying! I attempted several approaches with limited success: extremely descriptive Froggy prompts, uploads of previous Froggy scenes, follow-up prompts requesting modifications to Froggy's appearance when it was off, as well as forcing chatGPT to pass the prompt to DALL·E without modification. Ultimately, I requested variation after variation until it was close enough. At the rate of progress we've seen perhaps this issue will be solved soon, and honestly on the timescale of days or weeks wouldn't even surprise me. Cheers to that.

Credit to OpenAI's DALL·E for illustrations, Shutterfly for printing the physical board book, and <a href="https://github.com/Nodlik" target="_blank">@Nodlik</a> for the flipbook animation code.

<script type="application/javascript">
const pageWidth = document.getElementById('book').offsetWidth / 2;
const pageFlip = new St.PageFlip(document.getElementById('book'),
    {
        size: 'stretch',
        width: pageWidth,
        height: pageWidth,
        showCover: false,
        drawShadow: false,
        usePortrait: false,
        flippingTime: 800
    }
);

pageFlip.loadFromHTML(document.querySelectorAll('.page'));
</script>
