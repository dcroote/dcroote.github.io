---
layout: post
title: Rating energy gels and drink mixes
image: images/energy-gel-drink-mix-ratings/endurance-energy-gels-drink-mixes.png
image-alt: Endurance energy gels and drink mixes
comments: false
description: Why is a ratings table of endurance energy gels and drink mixes needed? These products are sugar. Sugar tastes good. Surely it's hard to mess up? Surprisingly, gels and mixes can be bad. Flavors can have you questioning how a human, absent extreme duress, approved of its manufacture.
tags: [sports]
discuss_on_twitter: 
---

Why is a ratings table of endurance energy gels and drink mixes needed? These products are sugar. Sugar tastes good. Humans evolved to seek it. Endurance exercise elicits a strong desire for it. Surely it's hard to mess up?

Surprisingly, gels and mixes can be bad. Flavors can have you questioning how a human, absent extreme duress, approved of its manufacture. In fact, I once had a lemon flavored drink mix so terrible that I had to pull off to the side of the trail and vomit. I will be petty and ascribe some blame to this mix for my second place finish (in my age group) at the 2024 Downieville Classic cross-country mountain bike race. Was it my fault for trying a new drink mix for the first time on a 95°F day? Was my suspension also improperly tuned? Did I overexert myself on the 8 mile, 3000 ft climb? Should I have crashed fewer times? Yes, yes, yes, and yes, but it's agreed that in sport blame first belongs to equipment, weather, other external factors, day of the week, and only lastly, if at all, to the athlete.

As you will notice from the table below, I am a fan of a several Hammer Nutrition gels. Hammer also makes a gel flask that is great for carrying the equivalent of multiple gels, avoiding sticky used gel packets in your pockets, and lowering the average per-serving cost of gels through bulk gel bottle purchases. If you'd like a discount, here is a <a href="https://www.hammernutrition.com/DEREK42410">Hammer Nutrition referral link</a>.

{% include energy-gel-ratings-tables.html %}

<script src="/scripts/energy-gel-ratings-tables.js" defer></script>

<style>
  .energy-gel-type-section {
    margin-bottom: 2.5rem;
  }

  .energy-gel-type-section h2 {
    margin-bottom: 0.75rem;
  }

  .energy-gel-ratings-table {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
  }

  .energy-gel-ratings-table th,
  .energy-gel-ratings-table td {
    border: 1px solid #ccc;
    padding: 0.5rem 0.65rem;
    text-align: left;
    vertical-align: top;
    font-weight: normal;
  }

  .energy-gel-ratings-table thead th {
    font-weight: bold;
  }

  .energy-gel-sortable {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .energy-gel-sortable:hover,
  .energy-gel-sortable:focus-visible {
    text-decoration: underline;
  }

  .energy-gel-sort-indicator {
    font-size: 0.75em;
    opacity: 0.85;
  }

  .energy-gel-table-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    font-size: 0.95em;
  }

  .energy-gel-search-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .energy-gel-search-input {
    min-width: 14em;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0.35rem 0.5rem;
    font: inherit;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    color: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .energy-gel-search-input:focus {
    outline: 2px solid #4a9eff;
    outline-offset: 1px;
    border-color: #4a9eff;
  }

  html:not(.dark-mode) .energy-gel-ratings-table tbody tr:nth-child(even) {
    background-color: #f6f6f6;
  }

  .energy-gel-empty {
    text-align: center;
    font-style: italic;
  }

  html.dark-mode .energy-gel-ratings-table {
    color: #f0f0f0;
  }

  html.dark-mode .energy-gel-ratings-table th,
  html.dark-mode .energy-gel-ratings-table td {
    border-color: #555;
  }

  html.dark-mode .energy-gel-ratings-table tbody tr:nth-child(odd) {
    background-color: #2d2d2d;
  }

  html.dark-mode .energy-gel-ratings-table tbody tr:nth-child(even) {
    background-color: #3a3a3a;
  }

  html.dark-mode .energy-gel-search-input {
    background-color: #3a3a3a;
    color: #f0f0f0;
    border-color: #555;
  }
</style>

<p style="font-size: 0.9em">
Data lives in <a href="https://github.com/dcroote/dcroote.github.io/blob/master/_data/energy_gel_ratings.csv">_data/energy_gel_ratings.csv</a> on GitHub.
</p>