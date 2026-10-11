# Lumenera

Finished static Lumenera storefront. This branch publishes through GitHub Pages from the root.

Website: https://transposemat.github.io/lumenera/

The transparent corner printer follows page scrolling, with a circular close button and draggable artwork. The same transparent corner printer appears on mobile, with no bottom bar or caption. Motion respects reduced-motion preferences and stops after settling; continuous-scroll tracking uses cached geometry and no animation library.

The scroll controller follows new positions immediately and settles within approximately 120ms after scrolling ends. Its additional compressed payload is 4.4KB. Continuous 60Hz and 120Hz scroll tracking, reversal, resize, reduced motion and dismissal were checked before release.

All twelve original models, creator images and WhatsApp ordering links are preserved. Model and image credits are in ASSET_CREDITS.md and credits.html.

The ivory header slides down from above once its original position scrolls away, then stays available. Explore models, How to order and WhatsApp are visible at every screen size. The mobile header uses two rows. There is no price-calculator control.

Grab the printer image with a mouse or finger to reposition it anywhere within the visible screen. The scroll-print animation remains independent. Position resets on reload, resize keeps it reachable, and the close button still works. Keyboard arrows move the focused image and Home restores the corner.
