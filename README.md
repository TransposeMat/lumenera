# Lumenera

Finished static Lumenera storefront. This branch publishes through GitHub Pages from the root.

Website: https://transposemat.github.io/lumenera/

The transparent corner printer follows page scrolling, with a circular close button and click-through artwork. The mobile illustration shares the WhatsApp bar. Motion respects reduced-motion preferences and stops after settling; continuous-scroll tracking uses cached geometry and no animation library.

The scroll controller follows new positions immediately and settles within approximately 120ms after scrolling ends. Its additional compressed payload is 4.4KB. Continuous 60Hz and 120Hz scroll tracking, reversal, resize, reduced motion and dismissal were checked before release.

All twelve original models, creator images and WhatsApp ordering links are preserved. Model and image credits are in ASSET_CREDITS.md and credits.html.
