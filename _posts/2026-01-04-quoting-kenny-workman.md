---
layout: post
title: Quoting Kenny Workman on Harness Design
image: images/quoting-kenny-workman/harness-comparison.jpeg
image-alt: A chart depicting the impact of harness design on SpatialBench benchmark scores.
description: The impact of harness design on spatial biology benchmark scores is striking and suggests we're early in optimizing AI model performance on biological tasks.
comments: false
---

Describing results from their manuscript "SpatialBench: Can Agents Analyze Real-World Spatial Biology Data?" (<a href="https://arxiv.org/abs/2512.21907" target="_blank">arxiv</a>), Kenny Workman <a href="https://x.com/kenbwork/status/2004573985355571478" target="_blank">writes</a>:

<blockquote>
The most actionable result: harness design should be a first class object for engineering and benchmarking. While largely considered “glue code”, tools, prompts, control flow, etc. can change the outcome as much as swapping the base models.
</blockquote>

What is meant by "harness"? From the manuscript:

<blockquote>
a harness denotes the full execution wrapper around a base model: the system prompt, available tools, control flow (planning and retry policies), answer schema enforcement, and the runtime environment used to execute code. All harnesses provide an interactive compute setting with access to common scientific Python tooling and the local workspace containing the problem’s data snapshot. Harnesses differ primarily in their prompting strategy, tool routing, and how they structure multi-step work (e.g., whether they enforce intermediate checks, how they respond to errors, and how they decide when to stop).
</blockquote>

The results:

<img src="/images/quoting-kenny-workman/harness-comparison.jpeg" alt="A chart depicting the impact of harness design on SpatialBench benchmark scores." class="centered_img" width="1456" height="834" />

I find it striking how impactful harness design is on benchmark performance and it suggests we're still very early in the optimization of AI models for biological tasks.

The SpatialBench repo can be found on <a href="https://github.com/latchbio/spatialbench" target="_blank">GitHub</a>.
