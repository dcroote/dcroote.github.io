---
layout: post
title: Stubborn Repairs Ep 4 - Invalid code
image: images/stubborn_repairs/ep4_time.png
image-alt: Clock with the time 00:04
description: "A story of time and two-factor authentication."
comments: false
---

<div class="story-intro">
Stories where I solve problems, often with an attempt at humor.
</div>

"Invalid code." Wait what?? We just scanned the QR code and entered the six digit time-based one-time password (TOTP) from the service's "approved" authenticator app.

I was trying to help a colleague with their two-factor authentication (2FA) and my expectations of a quick fix had suddenly vanished.

We tried the next code. Same result.

I try logging out and logging into the same service with my account, also using a TOTP. It worked fine, meaning the service’s 2FA flow was operational.

We try the entire cycle again, being particularly slow and deliberate. Yes the email is correct, yes that's the authenticator app, yes that's the code for this service. Same result, except an unexpected wrinkle: now in the authenticator app there were two copies for the service, each with a different code. I would have expected the older to have been overridden…

We try a couple of additional variations without success.

Then, my colleague mentions they traveled recently.

Hmm.

Knowing that these are TIME based codes, I look at the time on their phone. It's not on a different time zone so that can't be-

WAIT.

I look at my phone. I look back at their phone. Their phone was 4 minutes off!!!

<img src="/images/stubborn_repairs/ep4_time.png" width="200" height="104" alt="Clock with the time 00:04" class="centered_img" />

We discover in their phone's settings that somehow, for reasons unknown, their phone was no longer set to automatically update the date and time. Apparently, in the relatively short time since their travel, their phone's clock had diverged from the true time and, in doing so, generated codes that could never match the corresponding code on the service's servers.

We update the time by enabling the above setting, repeat the 2FA signup flow, and success!

This one was pretty wild- if not for that incidental travel comment, I genuinely wonder how long this would have taken to solve.
