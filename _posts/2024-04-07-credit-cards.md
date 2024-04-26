---
layout: post
title: Two credit cards
image: images/credit_cards/cc-graphic.svg
image-alt: Vector illustration of the outline of two credit cards
last_modified_at: 2024-04-25 22:12:00 -0700
comments: false
---

The allure of quantitative analysis almost led me into a career in finance instead of biotech, and while I don't regret that road not taken, I still enjoy the occasional foray.

For example, as a teenager I built an Excel retirement savings calculator and portfolio simulator for my parents.
It handled present and future tax rates, social security and pension disbursements, life expectancy, appropriate tax treatment of different retirement vehicles, Monte Carlo simulations of asset returns according to historical data, and more.
Thinking back it would have been interesting to have tried to monetize it since it was quite a bit more sophisticated than other online calculators I could find at the time.

With that introduction you might correctly assume that I am the type that could fall victim to the trap of credit card optimization.
Realizing this myself, I have taken a disciplined approach with the following two rules, in order:

1. Simplicity
2. Profitability <sup>1</sup>

Again, the ordering is important. Simplicity means that the following are disqualifying: rotating categories, complex redemption requirements e.g. through some portal or specific merchant, manual clicking of anything,<sup>2</sup> and linking the card to some other thing e.g. Amazon. I would argue broadly speaking that cards with points, rather than cash back, should be suspect since a point is not necessarily a set fraction of a dollar, and the fact that you probably cannot tell me with a high degree of certainty what one point equals in dollars towards something at any given moment without looking it up,<sup>3</sup> or worse, needing to proceed with purchasing something, is proof enough for me.

Requiring simplicity, thankfully, also limits the number of cards as it would break Rule 1 to have 5 cards and need to remember which one to pull out for each situation and transaction type.

At this point we're reasonably constrained, which is even a relief. In fact, I had the most enjoyable car buying experience for my last car when there was just one new car in the entirety of the Bay Area that fit my requirements (in fact requirement, singular: a manual transmission in a basic car).

Now to maximize profit, spending by category is important; a card with cash back on dining won't help much if you don't eat out frequently. It turns out, after housing, most American families spend a lot on groceries, gas, and travel. I submit that travel is too complicated of a category to optimize for in a **simple** manner given the diversity of airlines, hotels, car rental agencies, booking sites, rewards programs, status tiers, etc. This leaves gas and groceries, which are two of the categories targeted by the Blue Cash cards from American Express. The [Blue Cash Preferred card](https://americanexpress.com/en-us/referral/blue-cash-preferred-credit-card?ref=DEREKC8wSoA&xl=cp15) (affiliate link for transparency, mostly because I'm curious, but there are bonuses involved for all parties, so why not) charges a $95 annual fee for 6% cash back on groceries and streaming services, and 3% back on transit and gas, with some limits. The Blue Cash Everyday card, with no annual fee, offers 3% cash back on groceries, retail, and gas, again with some limits. I had the latter until doing the math (calculator below, and yes, I know, this comes very close to breaking Rule 1, but it was only done once) that demonstrated the former would be more profitable.

Lastly, since not everything is gas or groceries, and not all merchants accept Amex, it's convenient to have a second card like the Citi Double Cash Card, which offers 2% cash back, for all of the rest.
The second card can even favorably impact your credit score: given a fixed total credit card spend, a higher total credit limit means a lower credit utilization ratio.

Done!

<h2>Amex Blue Cash Rewards Calculator (as of 2024-04-25)</h2>
<span style="font-style: italic">This is for informational purposes only. Be sure to do your own research prior to making any financial decisions.</span> If you're curious about the formula, refer to this page's [source](https://github.com/dcroote/dcroote.github.io/blob/master/_posts/2024-04-07-credit-cards.md?plain=1).
<div class="container">
  <div class="column">
    <div style="padding: 10px;">
      <h3>Annual spending:</h3>
      <table>
        <tr>
          <td>Groceries:</td>
          <td><input type="number" id="groceries" placeholder="Enter amount" style="width: 100px;"></td>
        </tr>
        <tr>
          <td>Gas:</td>
          <td><input type="number" id="gas" placeholder="Enter amount" style="width: 100px;"></td>
        </tr>
        <tr>
          <td>Streaming:</td>
          <td><input type="number" id="streaming" placeholder="Enter amount" style="width: 100px;"></td>
        </tr>
        <tr>
          <td>Transit:</td>
          <td><input type="number" id="transit" placeholder="Enter amount" style="width: 100px;"></td>
        </tr>
        <tr>
          <td>Online Retail*:</td>
          <td><input type="number" id="retail" placeholder="Enter amount" style="width: 100px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center"><button onclick="calculate()">Calculate Rewards</button></td>
        </tr>
      </table>
    </div>
  </div>
  <div class="column">
    <div style="padding: 10px;">
      <h3>Rewards:</h3>
      <table id='rewards'>
        <tr>
          <th>Credit Card</th>
          <td><strong>Blue Cash Everyday</strong></td>
          <td><strong>Blue Cash Preferred</strong></td>
        </tr>
        <tr>
          <th>Groceries Cash Back</th>
          <td><span id="groceriesA"></span></td>
          <td><span id="groceriesB"></span></td>
        </tr>
        <tr>
          <th>Gas Cash Back</th>
          <td><span id="gasA"></span></td>
          <td><span id="gasB"></span></td>
        </tr>
        <tr>
          <th>Streaming Cash Back</th>
          <td><span id="streamingA"></span></td>
          <td><span id="streamingB"></span></td>
        </tr>
        <tr>
          <th>Retail Cash Back</th>
          <td><span id="retailA"></span></td>
          <td><span id="retailB"></span></td>
        </tr>
        <tr>
          <th>Transit Cash Back</th>
          <td><span id="transitA"></span></td>
          <td><span id="transitB"></span></td>
        </tr>
        <tr>
          <th>Total Rewards</th>
          <td><span id="totalA"></span></td>
          <td><span id="totalB"></span></td>
        </tr>
        <tr>
          <th>Annual Fee</th>
          <td>$0</td>
          <td>($95)</td>
        </tr>
        <tr>
          <th><strong>Net Rewards</strong></th>
          <td><span id="netA"></span></td>
          <td><span id="netB"></span></td>
        </tr>
      </table>
    </div>
  </div>
</div>

<br />
\*made on a website or a digital app from a U.S. retail merchant that sells physical goods or merchandise directly to consumers

### Footnotes

<ol style="font-size: 0.9em">
<li>It bears mentioning that this is all moot if you carry a balance on your card because the interest will far exceed the cash back.</li>
<li>This article was inspired by how ridiculous it seemed that you need to <a href="https://www.bitsaboutmoney.com/archive/anatomy-of-credit-card-rewards-programs/" target="_blank">tell Chase what groceries are</a>, something I learned about from Patrick McKenzie's brilliant newsletter, Bits about Money.</li>
<li>And for a number I tried looking it up. The website of one I found says "it depends!", lists what redemption categories it depends on, but zero actual numbers. To the credit of this card, and the friend who recommended it (despite owning the card they themselves spent time figuring out what a point was), it does appear quite lucrative for rewards on rent payments should you jump through several hoops.</li>
</ol>

<script>
  function calculate() {
    const groceries = parseFloat(document.getElementById('groceries').value);
    const gas = parseFloat(document.getElementById('gas').value);
    const streaming = parseFloat(document.getElementById('streaming').value);
    const transit = parseFloat(document.getElementById('transit').value);
    const retail = parseFloat(document.getElementById('retail').value);

    // Blue Cash Everyday
    const groceriesA = groceries <= 6000 ? groceries * 0.03 : 6000 * 0.03 + (groceries - 6000) * 0.01;
    const gasA = gas <= 6000 ? gas * 0.03 : 6000 * 0.03 + (gas - 6000) * 0.01;
    const streamingA = streaming * 0.01;
    const retailA = retail <= 6000 ? retail * 0.03 : 6000 * 0.03 + (retail - 6000) * 0.01;
    const transitA = transit * 0.01;
    const totalA = groceriesA + gasA + streamingA + retailA + transitA;
    const netA = totalA;

    // Blue Cash Preferred
    const groceriesB = groceries <= 6000 ? groceries * 0.06 : 6000 * 0.06 + (groceries - 6000) * 0.01;
    const gasB = gas * 0.03;
    const streamingB = streaming * 0.06;
    const retailB = retail * 0.01;
    const transitB = transit * 0.03;
    const totalB = groceriesB + gasB + streamingB + retailB + transitB;
    const netB = totalB - 95;

    document.getElementById('groceriesA').textContent = '$' + groceriesA.toFixed(2);
    document.getElementById('gasA').textContent = '$' + gasA.toFixed(2);
    document.getElementById('streamingA').textContent = '$' + streamingA.toFixed(2);
    document.getElementById('retailA').textContent = '$' + retailA.toFixed(2);
    document.getElementById('transitA').textContent = '$' + transitA.toFixed(2);
    document.getElementById('totalA').textContent = '$' + totalA.toFixed(2);
    document.getElementById('netA').textContent = '$' + netA.toFixed(2);

    document.getElementById('groceriesB').textContent = '$' + groceriesB.toFixed(2);
    document.getElementById('gasB').textContent = '$' + gasB.toFixed(2);
    document.getElementById('streamingB').textContent = '$' + streamingB.toFixed(2);
    document.getElementById('retailB').textContent = '$' + retailB.toFixed(2);
    document.getElementById('transitB').textContent = '$' + transitB.toFixed(2);
    document.getElementById('totalB').textContent = '$' + totalB.toFixed(2);
    document.getElementById('netB').textContent = '$' + netB.toFixed(2);
  }
</script>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
  }

  .column {
    flex-basis: 50%;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
    font-weight: normal;
  }

  #rewards tr:nth-child(even) {
    background-color: #eeeeee;
  }
</style>
