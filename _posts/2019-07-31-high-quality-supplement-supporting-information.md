---
layout: post
title: High quality vector graphics in Microsoft Word for Supplementary / Supporting Information
image: images/vector_vs_raster.svg
comments: true
---

## Background
To maintain quality, integrity, and aesthetics, vector graphic formats such as PDF or EPS are generally preferred for artwork and data visualizations over raster (pixel-based) formats such as png, gif, or jpeg. The reason becomes especially apparent at high magnification. As shown in the extreme example below, vector formats maintain smooth curves (left), while raster formats become pixelated (right).

<img class="centered_img" src="/images/vector_vs_raster.svg" alt="[img] Vector graphic compared to raster graphic" />

There are many reasons to want high quality graphics embedded in a document; my issue was that unlike the main article of a peer-reviewed scientific publication, the Supplementary / Supporting Information is often not edited for style or typeset by the journal. This leaves the author responsible for incorporating supplementary figures as high quality graphics. 
## Challenge
Unlike LaTeX, Microsoft Word does not allow PDF or ([as of April 11, 2017](https://support.office.com/en-us/article/support-for-eps-images-has-been-turned-off-in-office-a069d664-4bcf-415e-a1b5-cbb0c334a840)) EPS files to be embedded in a document.

## Solution
Saving / exporting graphics in the Enhanced MetaFile `.emf` format using Adobe Illustrator or Inkscape enables them to be Inserted as Pictures in Word. When the Word document is then saved as a PDF, the graphics are rendered appropriately in a high-quality, vector format. 

