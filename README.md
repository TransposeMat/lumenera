# Lumenera

Finished static Lumenera storefront. This branch publishes through GitHub Pages from the root.

Website: https://transposemat.github.io/lumenera/

The transparent corner printer follows page scrolling, with a circular close button and draggable artwork. The same transparent corner printer appears on mobile, with no bottom bar or caption. Motion respects reduced-motion preferences and stops after settling; continuous-scroll tracking uses cached geometry and no animation library.

The scroll controller follows new positions immediately and settles within approximately 120ms after scrolling ends. Its additional compressed payload is 4.4KB. Continuous 60Hz and 120Hz scroll tracking, reversal, resize, reduced motion and dismissal were checked before release.

All twelve original models, creator images and WhatsApp ordering links are preserved. Model and image credits are in ASSET_CREDITS.md and credits.html.

The ivory header is fixed from first paint at every screen size, without a delayed entrance or scroll threshold. Desktop keeps its 94px row with visible navigation. Mobile uses a compact 64px row with the logo, a pale-sage WhatsApp icon and text-labelled Menu with a chevron. The native menu reveals Explore models and How to order in a full-width navigation strip. The menu supports keyboard navigation and works without JavaScript. There is no price-calculator control.

Grab the printer image with a mouse or finger to reposition it anywhere within the visible screen. The scroll-print animation remains independent. Position resets on reload, resize keeps it reachable, and the close button still works. Keyboard arrows move the focused image and Home restores the corner.

Mobile printer artwork is 25% smaller: 96px wide, or 84px below 360px. Desktop remains 168px; close targets, dragging and scroll behavior are preserved.

The Revet Wallet — Nerdy White is featured after the original model collection. Its official product image, checked store price (Rs 1,599 on 13 October 2026), WhatsApp order message and Shopify store link are available without JavaScript. Wallet price and delivery are confirmed in chat. Its imagery is self-hosted and lazy-loaded; provenance is included.

Pricing now shows the owner-provided order discounts: Rs 2,500+ / Rs 200 off; Rs 4,000+ / Rs 350 off; Rs 8,000+ / Rs 700 off. Base printing remains Rs 15/gram, with the applicable discount and separate delivery charge confirmed in the quote. The visible collection count is removed; filter feedback remains available to assistive technology.

Object-order links use the original green text-and-arrow treatment and 44px targets on desktop and mobile. Per-card attribution rows are removed; the dedicated creator/source credits page remains linked from the collection and footer.

The mobile Menu now has a distinct open state, touch-safe hover feedback and reversible native 180ms opening/120ms closing animation. Escape, outside input, focus leaving and selection dismiss cleanly; crossing to desktop and hiding the tab cancel pending motion. Reduced motion is immediate and no-script native disclosure remains available.

Responsive finish: mobile featured rows follow content height, avoiding the inherited blank gap; collection-to-wallet spacing is tighter. Mobile supporting text and FAQ are more readable, all model inputs use 16px text, filters preserve comfortable targets, and the header has one clean divider. Original product links, all models, wallet, discounts and printer interactions are preserved.
