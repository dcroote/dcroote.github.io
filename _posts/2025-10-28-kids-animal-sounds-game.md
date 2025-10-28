---
layout: post
title: Kids Animal Sounds Game
image: images/kids-animal-sounds-game/kids-animal-sounds-game.png
image-alt: Interactive kids animal sounds game
description: 'The beauty here is not that AI could build a kids game, though a mere 6 years ago this would have been unimaginable, but rather that AI increasingly moves us from "yes, I could build this, but I don''t really want to spend the time" to the existence of something new and useful.'
comments: false
---

My daughter likes to play an online animal sounds game, but she gets frustrated by a few aspects of its implementation: there are too many animals on a given screen and any touch that isn't perfectly on an animal causes the screen to haphazardly scroll horizontally and/or vertically. It also isn't great on mobile because if she holds the phone with one hand and her thumb accidentally touches the screen, it either scrolls or prevents correct clicks from being recognized.

I thought it would be fun to make a version better suited to her, so I vibe coded<sup>1</sup> one with AI. The specifics aren't particularly important as I'm confident any decent contemporary large language model (LLM) could do it, but for completeness I used Claude 4.5 Sonnet in Cursor. Combining the relatively low effort starting prompt below with free <a href="https://pixabay.com/sound-effects/search/eagle/" target="_blank">pixabay</a> and <a href="https://mixkit.co/free-sound-effects/animals/" target="_blank">mixkit.co</a> animal sounds, I had a working prototype comprising a single HTML file and some javascript in about a half hour. I didn't even need images for the animals as emojis sufficed.

<div class="ai-text-block" markdown="1">
I would like to build a very simple kids web app game that works on a mobile web browser. The challenge is that kids often hold a phone with their thumb pressing the screen, so I'd like all touches outside the target and exit (discussed below) to be ignored. Further, if a thumb is held on the side of the screen, the app should still recognize correct presses of the target. Scrolling should also be disabled. As for the game itself, it is very simple. There is a picture of an animal and below it, a large circular button (this is the target). When the button is pressed, a sound corresponding to that animal is played. After that, the animal disappears and a randomly selected new one appears, indefinitely. To exit the game, there is a small button in the upper right hand corner that has to be pressed TWICE quickly in a row. This is necessary for if fullscreen is used. I don't want a complicated tech stack if possible. HTML and javascript would be ideal
</div>

After a round of "user testing," the final version of the <a href="https://www.derekcroote.com/kids-animal-sounds-game.html">kids animal sounds game</a> features a single screen of 3 animals, a small shuffle button in the corner, and a color effect accompanying the sound for when an animal is clicked. Importantly, any click (or thumb hold) outside of the animal icon is ignored and doesn't prevent recognition of an animal being appropriately clicked.

<a href="/kids-animal-sounds-game.html"><img src="/images/kids-animal-sounds-game/kids-animal-sounds-game.png" width="1200" height="630" alt="Interactive kids animal sounds game" /></a>

It's worth mentioning a few characteristics that make this a great vibe coding project:

<ol>
<li>Code quality isn't a priority since this is a fun project rather than serious production software</li>
<li>It's very simple, so the model won't need to make any architectural decisions and there is minimal surface area to introduce vulnerabilities</li>
<li>We can expect the model to do well because the code is basic HTML and javascript, which has enormous coverage in the training data given the ubiquity of HTML and javascript on the internet</li>
</ol>

The beauty here is not that AI could build a kids game, though a mere 6 years ago this would have been unimaginable, but rather that AI increasingly moves us from "yes, I could build this, but I don't really want to spend the time" to the existence of something new and useful. My <a href="/2023/12/10/childrens-book.html">children's book</a> is another example, and I look forward to countless more.

### Footnotes

<ol style="font-size: 0.9em">
<li>A new paradigm of programming where you don't read the code, just instruct the LLM and test the outputs. Despite the temptation, do not do this for any code of value. To quote <a href="https://x.com/karpathy/status/1886192184808149383" target="_blank">Andrej Karpathy on Twitter</a>: "There's a new kind of coding I call 'vibe coding'... I just see stuff, say stuff, run stuff, and copy paste stuff, and it mostly works." </li>
</ol>
