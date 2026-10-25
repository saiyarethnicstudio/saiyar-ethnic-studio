# Saiyar Ethnic Studio website

ONE-PAGE rental-enquiry site (sections: home, collection, occasions, how it works, about, Instagram, FAQ, terms & privacy, contact). Products open in a popup; there are no product pages. A popup is shareable via a link like /#look-teal-festive-saree. Zero dependencies: only Node 18+ is needed.

## Run
    node build.js      # generates ./dist (index.html, sitemap.xml, robots.txt)
    node serve.js      # preview at http://localhost:4173
    # or: npm start
Deploy the contents of `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
Before deploying: SITE_URL=https://your-domain.com node build.js  (sets canonical URLs and the sitemap).

## Add your real photos
Drop files into `public/images/products/` named after the product slug, then run `node build.js`:
    wine-embroidered-bridal-choli.webp        (main image)
    wine-embroidered-bridal-choli-2.webp      (extra views: -2, -3, -4)
Slugs are listed in `src/data.js`. Real photos automatically replace the placeholder illustrations.
Use 4:5 portrait photos (e.g. 1200x1500) for the best result.

## Edit products
`src/data.js` is the single catalogue. Add/rename products there. Set `rentalPrice` and
`priceIsVerified: true` ONLY when the studio confirms the price; price/sort filters then appear automatically.
Update each product's name, description, visibleColor and visibleDesignDetails to match the real photo.

## Instagram
`SITE.instagramPosts` (your own post images linking to posts) and `SITE.instagramEmbeds`
(official embed code from Instagram: post > ... > Embed) in `src/data.js` fill the Instagram sections.

## Needs owner confirmation
Rental terms (deposit, duration, alterations, cancellation), opening hours, whether customer records are kept
(privacy policy), real domain name. These are marked "Owner to confirm" on the Rental Terms and Privacy pages.
