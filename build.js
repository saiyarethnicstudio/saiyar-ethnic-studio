// Zero-dependency static site generator. Run: node build.js  -> ./dist
const fs = require('fs'), path = require('path');
const { SITE, CATEGORIES, OCCASIONS, PRODUCTS } = require('./src/data');
const art = require('./src/art');

const ROOT = __dirname, DIST = path.join(ROOT, 'dist'), PUB = path.join(ROOT, 'public');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = msg => `https://wa.me/${SITE.whatsapp}` + (msg ? `?text=${encodeURIComponent(msg)}` : '');
const slugify = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const write = (rel, content) => { const f = path.join(DIST, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };

// ---------- icons ----------
const ico = (d, extra = '') => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${d}</svg>`;
const I = {
  search: ico('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  menu: ico('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
  wa: ico('<path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5z"/><path d="M8.6 7.6c-.3 1.8 1.2 4.5 3.3 6.1 1.5 1.1 3 1.5 4 1l.8-1.3-2.1-1.1-.9.8c-1.100-.4-2.500-1.700-2.900-2.900l.8-.9-1.100-2.100z"/>'),
  ig: ico('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
  mail: ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  pin: ico('<path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>'),
  arrow: ico('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  eye: ico('<path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
};

// ---------- products ----------
const exists = f => fs.existsSync(path.join(PUB, f));
function images(p) {
  const found = [];
  for (const suffix of ['', '-2', '-3', '-4']) {
    const ext = ['webp', 'jpg', 'jpeg', 'png'].find(e => exists(`images/products/${p.slug}${suffix}.${e}`));
    if (ext) found.push(`/images/products/${p.slug}${suffix}.${ext}`);
  }
  if (found.length) return { gallery: found, real: true };
  return { gallery: [`/images/products/${p.slug}.svg`], real: false };
}
const cat = id => CATEGORIES.find(c => c.id === id);
const priceLabel = (p, short) => p.priceIsVerified && p.rentalPrice ? `₹${Number(p.rentalPrice).toLocaleString('en-IN')} rental` : (short ? 'Enquire for Price' : 'Enquire for Rental Price');
const prods = PRODUCTS.map(p => {
  const c = cat(p.category), im = images(p);
  return { ...p, categoryLabel: c.label, categorySlug: c.slug, url: `/products/${p.slug}/`, image: im.gallery[0], gallery: im.gallery, isPlaceholder: !im.real,
    priceText: priceLabel(p), priceShort: priceLabel(p, true), waUrl: wa(c.waMsg(p.name)),
    alt: im.real ? `${p.visibleColor} ${c.label.toLowerCase().replace(/ on rent/, '')} outfit, ${p.name}` : `Illustration of the ${p.name}, a ${p.visibleColor.toLowerCase()} ${p.kind} look` };
});
const anyPrice = prods.some(p => p.priceIsVerified && p.rentalPrice);
const colors = [...new Set(prods.map(p => p.visibleColor))].sort();

// ---------- layout ----------
const NAV = [['/', 'Home'], ['/collections/wedding-cholis/', 'Cholis'], ['/collections/heavy-sarees/', 'Heavy Sarees'], ['/collections/wedding-gowns/', 'Wedding Gowns'], ['/collections/', 'All Collections'], ['/about/', 'About Us'], ['/contact/', 'Contact']];
const sitemap = [];
const clientData = JSON.stringify({
  wa: SITE.whatsapp, products: prods.map(p => ({ slug: p.slug, name: p.name, category: p.category, categoryLabel: p.categoryLabel, categorySlug: p.categorySlug, url: p.url, image: p.image, alt: p.alt,
    description: p.description, color: p.visibleColor, details: p.visibleDesignDetails, occasions: p.occasion, price: p.priceText, wa: p.waUrl, placeholder: p.isPlaceholder })),
}).replace(/</g, '\\u003c');

function layout({ title, desc, path: urlPath, body, ld = [], og = '/images/og.svg', noindex = false, active = '' }) {
  const full = `${title} | ${SITE.name}`;
  const canon = SITE.url + urlPath;
  if (!noindex) sitemap.push(urlPath);
  const ldAll = ld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const navLinks = cls => NAV.map(([h, l]) => `<a href="${h}" ${active === h ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(urlPath === '/' ? `${SITE.name} | Ethnic Wear on Rent in Nikol, Ahmedabad` : full)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}<link rel="canonical" href="${canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE.name}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${SITE.url}${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#6B1E2E">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${ldAll}
</head><body>
<a class="skip" href="#main">Skip to content</a>
<div class="announce"><p>Your Dream Wedding Look, Without the Heavy Price Tag <span class="sep" aria-hidden="true">|</span> <strong>Outfits starting at ₹500</strong></p></div>
<header class="hdr"><div class="wrap hdr-in">
  <button class="icon-btn burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">${I.menu}</button>
  <a class="brand" href="/" aria-label="${SITE.name} home"><span class="brand-main">Saiyar</span><span class="brand-sub">Ethnic Studio</span></a>
  <nav class="nav" aria-label="Main">${navLinks()}</nav>
  <div class="hdr-actions">
    <button class="icon-btn" id="open-search" aria-label="Search outfits">${I.search}</button>
    <a class="btn btn-wa hdr-wa" href="${wa('Hello Saiyar Ethnic Studio, I would like to explore your ethnic-wear rental collection.')}" target="_blank" rel="noopener noreferrer" aria-label="Enquire on WhatsApp">${I.wa}<span>Enquire</span></a>
  </div>
</div></header>
<div class="drawer" id="drawer" inert>
  <div class="drawer-panel"><button class="icon-btn drawer-x" id="drawer-x" aria-label="Close menu">${I.close}</button>
  <nav aria-label="Mobile">${navLinks()}<a href="/faq/">FAQ</a></nav>
  <a class="btn btn-wa" href="${wa('Hello Saiyar Ethnic Studio, I would like to explore your ethnic-wear rental collection.')}" target="_blank" rel="noopener noreferrer">${I.wa}Enquire on WhatsApp</a></div>
  <div class="drawer-back" id="drawer-back"></div>
</div>
<main id="main">${body}</main>
<footer class="ftr"><div class="wrap ftr-grid">
  <div><a class="brand brand-light" href="/"><span class="brand-main">Saiyar</span><span class="brand-sub">Ethnic Studio</span></a>
    <p class="ftr-note">Ethnic-wear rentals in Nikol, Ahmedabad. Wedding cholis, heavy sarees and wedding gowns.</p>
    <a class="social" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Saiyar Ethnic Studio on Instagram">${I.ig}<span>${SITE.instagramHandle}</span></a></div>
  <div><h2 class="ftr-h">Explore</h2><ul>${[['/collections/wedding-cholis/', 'Wedding Cholis'], ['/collections/heavy-sarees/', 'Heavy Sarees'], ['/collections/wedding-gowns/', 'Wedding Gowns'], ['/collections/', 'All Collections']].map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
  <div><h2 class="ftr-h">Studio</h2><ul>${[['/about/', 'About Us'], ['/contact/', 'Contact'], ['/faq/', 'FAQ'], ['/rental-terms/', 'Rental Terms'], ['/privacy-policy/', 'Privacy Policy']].map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
  <div><h2 class="ftr-h">Visit &amp; contact</h2>
    <address>${SITE.addressLines.map(esc).join('<br>')}</address>
    <p><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${SITE.whatsappDisplay}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">Get directions</a></p></div>
</div><div class="wrap ftr-base"><p>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p><p>Rental prices, availability and sizing are confirmed by the studio on WhatsApp.</p></div></footer>

<a class="fab" href="${wa('Hello Saiyar Ethnic Studio, I would like to explore your ethnic-wear rental collection.')}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Saiyar Ethnic Studio on WhatsApp">${I.wa}</a>

<dialog id="search" class="dlg dlg-search" aria-label="Search outfits"><div class="dlg-in">
  <div class="search-row">${I.search}<input id="search-input" type="search" placeholder="Search by name, colour or occasion" aria-label="Search outfits" autocomplete="off"><button class="icon-btn" id="search-x" aria-label="Close search">${I.close}</button></div>
  <div id="search-results" class="search-results" aria-live="polite"></div>
</div></dialog>
<dialog id="qv" class="dlg dlg-qv" aria-labelledby="qv-title"><div class="dlg-in qv-in" id="qv-body"></div></dialog>
<script>window.SAIYAR=${clientData};</script>
<script src="/app.js" defer></script>
</body></html>`;
}

const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([h, l], i) => `<li>${h && i < items.length - 1 ? `<a href="${h}">${esc(l)}</a>` : `<span aria-current="page">${esc(l)}</span>`}</li>`).join('')}</ol></nav>`;
const crumbLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([h, l], i) => ({ '@type': 'ListItem', position: i + 1, name: l, item: SITE.url + (h || '/') })) });
const localLd = () => ({ '@context': 'https://schema.org', '@type': 'ClothingStore', name: SITE.name, url: SITE.url + '/', image: SITE.url + '/images/og.svg', telephone: '+918980026639', email: SITE.email,
  description: 'Ethnic-wear rental studio in Nikol, Ahmedabad: wedding cholis, heavy sarees and wedding gowns on rent.', priceRange: '₹500–₹10,000', sameAs: [SITE.instagram],
  address: { '@type': 'PostalAddress', streetAddress: 'B36, Nikol Gam Road, Opp. Vishala Supreme-2, Shreyans Park Society, Krishna Park Society, Kenal', addressLocality: 'Nikol, Ahmedabad', addressRegion: 'Gujarat', postalCode: '382350', addressCountry: 'IN' } });

const waBtn = (label, msg, cls = '') => `<a class="btn btn-wa ${cls}" href="${wa(msg)}" target="_blank" rel="noopener noreferrer">${I.wa}${label}</a>`;
const WA_HOME = 'Hello Saiyar Ethnic Studio, I would like to explore your ethnic-wear rental collection.';

function card(p, eager) {
  const occ = p.occasion.join('|');
  return `<article class="card" data-slug="${p.slug}" data-category="${p.category}" data-color="${esc(p.visibleColor)}" data-occ="${esc(occ)}" data-name="${esc(p.name)}" data-price="${p.priceIsVerified && p.rentalPrice ? p.rentalPrice : ''}" data-search="${esc((p.name + ' ' + p.visibleColor + ' ' + occ + ' ' + p.categoryLabel).toLowerCase())}">
  <div class="card-media"><a href="${p.url}" data-qv="${p.slug}" aria-label="Quick view: ${esc(p.name)}"><img src="${p.image}" alt="${esc(p.alt)}" width="800" height="1000" ${eager ? '' : 'loading="lazy"'} decoding="async"></a>
    <button class="qv-btn" type="button" data-qv="${p.slug}">${I.eye}<span>Quick View</span></button></div>
  <div class="card-body"><p class="card-cat">${esc(p.categoryLabel)}</p><h3><a href="${p.url}">${esc(p.name)}</a></h3>
  <p class="card-price">${esc(p.priceShort)}</p><a class="card-link" href="${p.url}">View Details</a></div></article>`;
}
const grid = (list, extra = '') => `<div class="grid" ${extra}>${list.map((p, i) => card(p, i < 2)).join('')}</div>`;

// ---------- sections ----------
const processSteps = () => `<section class="sec sec-tint"><div class="wrap"><h2 class="h2 center">How renting works</h2>
<ol class="steps">${[['Explore the collection', 'Browse cholis, sarees and gowns and save the looks you like.'], ['Choose your favourite', 'Open any outfit to see details and colours.'], ['Message us on WhatsApp', 'We confirm rental price, availability, sizing and your rental dates.'], ['Visit the studio', 'Come to Nikol to see the outfit and complete your rental arrangements.']].map(([t, d], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
<p class="note center">A booking is not confirmed until the studio confirms it with you.</p></div></section>`;

const locationSec = () => `<section class="sec"><div class="wrap loc">
<div><h2 class="h2">Visit the studio in Nikol</h2><address class="addr">${SITE.addressLines.map(esc).join('<br>')}</address>
<ul class="contact-list"><li>${I.wa}<a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">${SITE.whatsappDisplay}</a></li><li>${I.mail}<a href="mailto:${SITE.email}">${SITE.email}</a></li><li>${I.ig}<a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer">${SITE.instagramHandle}</a></li></ul>
<div class="btn-row"><a class="btn btn-primary" href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">${I.pin}Get directions</a>${waBtn('Enquire on WhatsApp', WA_HOME, 'btn-ghost')}</div></div>
<div class="loc-card"><p class="loc-gu" lang="gu">તમારા ખાસ દિવસ માટે, તમારા budget માં perfect look.</p><p>Planning a wedding, reception or festival? Message us first, then visit to see your outfit.</p></div></div></section>`;

const igSection = () => {
  const posts = SITE.instagramPosts.length ? `<div class="ig-grid">${SITE.instagramPosts.map(p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(p.image)}" alt="${esc(p.alt || 'Saiyar Ethnic Studio Instagram post')}" loading="lazy" width="600" height="600"></a>`).join('')}</div>` : '';
  const embeds = SITE.instagramEmbeds.length ? `<div class="ig-embeds">${SITE.instagramEmbeds.join('')}</div><script async src="https://www.instagram.com/embed.js"></script>` : '';
  return `<section class="sec sec-tint"><div class="wrap center"><h2 class="h2">Follow our latest looks</h2><p class="lead">New outfits and reels are posted on Instagram first.</p>${posts}${embeds}
  <a class="btn btn-primary" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer">${I.ig}Follow ${SITE.instagramHandle}</a></div></section>`;
};

// ---------- pages ----------
function home() {
  const hero = prods[0];
  const featured = [prods[0], prods[4], prods[8], prods[1], prods[5], prods[9], prods[2], prods[10]];
  const cats = [
    ['Wedding Cholis on Rent', '/collections/wedding-cholis/', prods[0]], ['Heavy & Designer Sarees', '/collections/heavy-sarees/', prods[4]], ['Wedding Gowns', '/collections/wedding-gowns/', prods[8]],
    ['Bridal & Wedding Guest Looks', '/collections/?occasion=' + encodeURIComponent('Bridal Celebrations'), prods[6]], ['Festive & Occasion Wear', '/collections/?occasion=' + encodeURIComponent('Festive & Garba'), prods[2]],
  ];
  const occ = [['Wedding Guest', prods[3]], ['Reception & Engagement', prods[5]], ['Bridal Celebrations', prods[8]], ['Festive & Garba', prods[2]]];
  const body = `
<section class="hero"><div class="wrap hero-in">
  <div class="hero-copy"><h1 class="h1">Your Dream Wedding Look. Your Budget.</h1>
  <p class="lead">Discover beautiful wedding cholis, heavy sarees and elegant gowns on rent at Saiyar Ethnic Studio, Nikol, Ahmedabad.</p>
  <div class="btn-row"><a class="btn btn-primary" href="/collections/">Explore the Collection</a>${waBtn('Enquire on WhatsApp', WA_HOME, 'btn-ghost')}</div>
  <p class="hero-note">Rental outfits from ₹500 to ₹10,000, depending on the look.</p></div>
  <div class="hero-art"><div class="arch"><img src="${hero.image}" alt="${esc(hero.alt)}" width="800" height="1000" fetchpriority="high" decoding="async"></div></div>
</div></section>

<section class="sec"><div class="wrap"><h2 class="h2 center">Shop by category</h2><p class="lead center">Everything here is available to rent, not to buy.</p>
<div class="cats">${cats.map(([l, h, p]) => `<a class="cat" href="${h}"><div class="arch arch-sm"><img src="${p.image}" alt="" width="800" height="1000" loading="lazy"></div><span>${esc(l)}</span></a>`).join('')}</div></div></section>

<section class="sec sec-tint"><div class="wrap"><div class="sec-head"><h2 class="h2">Featured looks</h2><a class="more" href="/collections/">View all collections</a></div>${grid(featured)}</div></section>

<section class="sec"><div class="wrap"><h2 class="h2 center">Why Saiyar Ethnic Studio</h2>
<ul class="why">${[['Made for special occasions', 'Outfits chosen for weddings, receptions, engagements and festivals.'], ['Options for different budgets', 'Rentals from ₹500 to ₹10,000, depending on the outfit.'], ['A curated ethnic-wear collection', 'Cholis, heavy sarees and gowns in one local studio.'], ['Personal help on WhatsApp', 'Ask about price, sizing and dates directly with the studio.'], ['Easy to reach in Nikol', 'Visit us at Nikol Gam Road, Ahmedabad.']].map(([t, d]) => `<li><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul></div></section>

<section class="sec sec-tint"><div class="wrap"><h2 class="h2 center">Find a look for the occasion</h2>
<div class="occ">${occ.map(([o, p]) => `<a class="occ-card" href="/collections/?occasion=${encodeURIComponent(o)}"><img src="${p.image}" alt="" width="800" height="1000" loading="lazy"><span class="occ-t">${o}</span></a>`).join('')}</div></div></section>

${processSteps()}

<section class="sec"><div class="wrap story"><div><h2 class="h2">A local home for ethnic-wear rentals</h2>
<p class="lead">Saiyar Ethnic Studio is a women's ethnic-wear rental studio in Nikol, Ahmedabad, for anyone who wants to dress beautifully for the occasions that matter, without buying an outfit she may wear once.</p>
<a class="btn btn-ghost" href="/about/">Read our story</a></div><div class="arch arch-story"><img src="${prods[9].image}" alt="${esc(prods[9].alt)}" width="800" height="1000" loading="lazy"></div></div></section>

${igSection()}
${locationSec()}`;
  return layout({ title: 'Ethnic Wear on Rent in Nikol, Ahmedabad', desc: 'Rent wedding cholis, heavy sarees and wedding gowns in Nikol, Ahmedabad. Outfits from ₹500. Browse the collection and enquire on WhatsApp.', path: '/', body, active: '/', ld: [localLd()] });
}

const filterBar = ({ showCat }) => `<form class="filters" id="filters" role="search" aria-label="Filter outfits" onsubmit="return false">
  <button class="btn btn-ghost filters-toggle" type="button" id="filters-toggle" aria-expanded="false" aria-controls="filters-panel">Filters &amp; sort</button>
  <div class="filters-panel" id="filters-panel">
  <label class="f"><span>Search</span><input type="search" id="f-q" placeholder="e.g. wine, bridal"></label>
  ${showCat ? `<label class="f"><span>Category</span><select id="f-cat"><option value="">All categories</option>${CATEGORIES.map(c => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>` : ''}
  <label class="f"><span>Occasion</span><select id="f-occ"><option value="">All occasions</option>${OCCASIONS.map(o => `<option>${esc(o.id)}</option>`).join('')}</select></label>
  <label class="f"><span>Colour</span><select id="f-color"><option value="">All colours</option>${colors.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
  ${anyPrice ? `<label class="f"><span>Max rental price</span><select id="f-price"><option value="">Any price</option><option value="1000">Up to ₹1,000</option><option value="3000">Up to ₹3,000</option><option value="5000">Up to ₹5,000</option><option value="10000">Up to ₹10,000</option></select></label>` : ''}
  <label class="f"><span>Sort by</span><select id="f-sort"><option value="featured">Featured</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option>${anyPrice ? '<option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>' : ''}</select></label>
  <button class="btn btn-ghost" type="button" id="f-reset">Clear filters</button></div></form>
<p class="count" id="count" aria-live="polite"></p>`;
const emptyState = `<div class="empty" id="empty" hidden><h3>No outfits match those filters</h3><p>Try clearing a filter, or message us and we will help you find a look.</p><div class="btn-row">${waBtn('Ask on WhatsApp', 'Hello Saiyar Ethnic Studio, I could not find the outfit I was looking for on your website. Can you help me?')}</div></div>
<div class="center"><button class="btn btn-ghost" type="button" id="more" hidden>Load more outfits</button></div>`;

function collectionBanner(h1, intro, p) {
  return `<section class="banner"><div class="wrap banner-in"><div><h1 class="h1 h1-sm">${esc(h1)}</h1><p class="lead">${esc(intro)}</p></div>${p ? `<div class="arch arch-banner"><img src="${p.image}" alt="" width="800" height="1000" fetchpriority="high"></div>` : ''}</div></section>`;
}

function collections() {
  const c = [['/', 'Home'], ['/collections/', 'All Collections']];
  const body = `${collectionBanner('All Collections', 'Browse every outfit available to rent at Saiyar Ethnic Studio. Filter by category, occasion or colour, then open a look for details.', prods[4])}
<section class="sec sec-pt0"><div class="wrap">${crumbs(c)}${filterBar({ showCat: true })}${grid(prods, 'data-grid')}${emptyState}</div></section>
<section class="sec sec-tint"><div class="wrap"><h2 class="h2 center">Browse by collection</h2><div class="pill-row">${CATEGORIES.map(x => `<a class="pill" href="/collections/${x.slug}/">${esc(x.label)}</a>`).join('')}</div></div></section>`;
  return layout({ title: 'Ethnic Wear Rental Collection in Nikol, Ahmedabad', desc: 'Browse wedding cholis, heavy sarees and wedding gowns available on rent in Nikol, Ahmedabad. Filter by occasion and colour, then enquire on WhatsApp.', path: '/collections/', body, active: '/collections/', ld: [crumbLd(c)] });
}

function categoryPage(c) {
  const list = prods.filter(p => p.category === c.id);
  const crumbItems = [['/', 'Home'], ['/collections/', 'All Collections'], [`/collections/${c.slug}/`, c.label]];
  const other = CATEGORIES.filter(x => x.id !== c.id);
  const body = `${collectionBanner(c.h1, c.intro, list[0])}
<section class="sec sec-pt0"><div class="wrap">${crumbs(crumbItems)}${filterBar({ showCat: false })}${grid(list, `data-grid data-fixed-cat="${c.id}"`)}${emptyState}
<div class="cta-band"><h2 class="h3">Not sure which look suits you?</h2><p>Tell us your event and date, and we will suggest outfits from the studio.</p>${waBtn('Enquire on WhatsApp', 'Hello Saiyar Ethnic Studio, I would like help choosing an outfit from your ' + c.label.toLowerCase() + ' collection. My event date is: ')}</div>
<p class="related">Also explore: ${other.map(x => `<a href="/collections/${x.slug}/">${esc(x.label)}</a>`).join(' · ')}</p></div></section>`;
  return layout({ title: c.title, desc: c.meta, path: `/collections/${c.slug}/`, body, active: `/collections/${c.slug}/`, ld: [crumbLd(crumbItems)] });
}

function productPage(p) {
  const c = cat(p.category);
  const crumbItems = [['/', 'Home'], ['/collections/', 'All Collections'], [`/collections/${c.slug}/`, c.label], [p.url, p.name]];
  const related = [...prods.filter(x => x.category === p.category && x.slug !== p.slug), ...prods.filter(x => x.category !== p.category && x.occasion.some(o => p.occasion.includes(o)))].slice(0, 4);
  const thumbs = p.gallery.length > 1 ? `<div class="thumbs">${p.gallery.map((g, i) => `<button type="button" class="thumb" data-img="${g}" aria-label="View image ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}><img src="${g}" alt="" width="120" height="150" loading="lazy"></button>`).join('')}</div>` : '';
  const body = `<section class="sec sec-pt0"><div class="wrap">${crumbs(crumbItems)}
<div class="pdp"><div class="pdp-gallery"><div class="pdp-main"><img id="pdp-img" src="${p.image}" alt="${esc(p.alt)}" width="800" height="1000" fetchpriority="high">${p.isPlaceholder ? '<span class="tag">Illustration</span>' : ''}</div>${thumbs}</div>
<div class="pdp-info"><p class="card-cat">${esc(p.categoryLabel)}</p><h1 class="h1 h1-sm">${esc(p.name)}</h1>
<p class="pdp-price">${esc(p.priceText)}</p><p class="lead">${esc(p.description)}</p>
<dl class="specs"><div><dt>Colour</dt><dd>${esc(p.visibleColor)}</dd></div><div><dt>Design details</dt><dd>${p.visibleDesignDetails.map(esc).join(', ')}</dd></div><div><dt>Suggested occasions</dt><dd>${p.occasion.map(esc).join(', ')}</dd></div><div><dt>Availability</dt><dd>Please confirm with the studio for your date</dd></div></dl>
<div class="btn-row">${waBtn('Enquire on WhatsApp', c.waMsg(p.name))}<a class="btn btn-ghost" id="back-link" href="/collections/${c.slug}/">Back to collection</a></div>
<div class="enq"><h2 class="h3">Before you enquire</h2><ul><li>Rental price and rental duration: confirm with the studio.</li><li>Sizing and fit: ask on WhatsApp, or try the outfit at the studio.</li><li>Availability for your event date: confirm with the studio. Booking is not confirmed until the studio confirms it.</li></ul>
<p class="note">See <a href="/rental-terms/">rental terms</a> and <a href="/faq/">FAQ</a>.</p></div></div></div>
<section class="rel"><h2 class="h2">You may also like</h2>${grid(related)}</section></div></section>`;
  return layout({ title: `${p.name} on Rent in Ahmedabad`, desc: `${p.name}: a ${p.visibleColor.toLowerCase()} ${c.label.toLowerCase()} look available to rent at Saiyar Ethnic Studio, Nikol, Ahmedabad. Enquire on WhatsApp for price and availability.`, path: p.url, body, og: p.image, active: `/collections/${c.slug}/`, ld: [crumbLd(crumbItems)] });
}

function about() {
  const c = [['/', 'Home'], ['/about/', 'About Us']];
  const body = `<section class="banner"><div class="wrap banner-in"><div><h1 class="h1 h1-sm">About Saiyar Ethnic Studio</h1><p class="lead">A women's ethnic-wear rental studio in Nikol, Ahmedabad.</p></div><div class="arch arch-banner"><img src="${prods[9].image}" alt="${esc(prods[9].alt)}" width="800" height="1000" fetchpriority="high"></div></div></section>
<section class="sec"><div class="wrap prose">${crumbs(c)}
<h2 class="h2">Beautiful outfits, rented smartly</h2>
<p>Saiyar Ethnic Studio exists for customers who want to look their best at weddings, receptions, engagements, festivals and Garba nights, without paying the full cost of an outfit they may wear only once.</p>
<p>Our focus is renting. You can explore wedding cholis, heavy and designer sarees and wedding gowns, with outfits ranging from ₹500 to ₹10,000 depending on the look.</p>
<h2 class="h2">What you can find</h2>
<ul><li><a href="/collections/wedding-cholis/">Wedding cholis</a> for bridal celebrations, receptions and Garba.</li><li><a href="/collections/heavy-sarees/">Heavy and designer sarees</a> for wedding guests and festive evenings.</li><li><a href="/collections/wedding-gowns/">Wedding gowns</a> for receptions and engagements.</li></ul>
<h2 class="h2">Find us in Nikol</h2><p>We are on Nikol Gam Road, Ahmedabad. Message us on WhatsApp first so we can confirm availability, then visit the studio.</p>
<div class="btn-row"><a class="btn btn-primary" href="/collections/">Browse collections</a>${waBtn('Enquire on WhatsApp', WA_HOME, 'btn-ghost')}</div></div></section>
${igSection()}${locationSec()}`;
  return layout({ title: 'About Us', desc: 'Saiyar Ethnic Studio is a women\'s ethnic-wear rental studio in Nikol, Ahmedabad, offering wedding cholis, heavy sarees and wedding gowns on rent.', path: '/about/', body, active: '/about/', ld: [crumbLd(c), localLd()] });
}

function contact() {
  const c = [['/', 'Home'], ['/contact/', 'Contact']];
  const body = `<section class="banner banner-slim"><div class="wrap"><h1 class="h1 h1-sm">Contact Saiyar Ethnic Studio</h1><p class="lead">Tell us what you are looking for and we will continue the conversation on WhatsApp.</p></div></section>
<section class="sec sec-pt0"><div class="wrap">${crumbs(c)}<div class="contact-grid">
<div><h2 class="h3">Enquire about an outfit</h2><p class="muted">Share the outfit name, event date and your budget. Prices, availability and sizing are confirmed by the studio.</p>
<form id="contact-form" class="form" novalidate>
  <label class="f"><span>Full name <b aria-hidden="true">*</b></span><input name="name" id="c-name" autocomplete="name" required aria-describedby="e-name"><small class="err" id="e-name" role="alert"></small></label>
  <label class="f"><span>WhatsApp number <b aria-hidden="true">*</b></span><input name="phone" id="c-phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="e.g. 98765 43210" aria-describedby="e-phone"><small class="err" id="e-phone" role="alert"></small></label>
  <label class="f"><span>Outfit category <b aria-hidden="true">*</b></span><select name="category" id="c-cat" required aria-describedby="e-cat"><option value="">Select a category</option>${CATEGORIES.map(x => `<option>${esc(x.label)}</option>`).join('')}<option>Not sure yet</option></select><small class="err" id="e-cat" role="alert"></small></label>
  <label class="f"><span>Event or occasion</span><select name="occasion" id="c-occ"><option value="">Select an occasion</option>${OCCASIONS.map(o => `<option>${esc(o.id)}</option>`).join('')}<option>Other</option></select></label>
  <label class="f"><span>Required rental date</span><input name="date" id="c-date" type="date"></label>
  <label class="f"><span>Budget range</span><select name="budget" id="c-budget"><option value="">Select a budget</option><option>Up to ₹2,000</option><option>₹2,000 – ₹5,000</option><option>₹5,000 – ₹10,000</option><option>Not sure yet</option></select></label>
  <label class="f f-wide"><span>Message</span><textarea name="message" id="c-msg" rows="4" placeholder="Outfit name, size, colour you prefer…"></textarea></label>
  <div class="f-wide"><button class="btn btn-wa" type="submit">${I.wa}Send enquiry on WhatsApp</button><p class="note">This opens WhatsApp with your message ready to send. Nothing is saved or emailed by this website.</p></div>
  <div class="f-wide fallback" id="fallback" hidden><p><strong>WhatsApp did not open?</strong> Copy your message below and send it to ${SITE.whatsappDisplay}, or use the link.</p><textarea id="fallback-text" rows="5" readonly aria-label="Your enquiry message"></textarea><div class="btn-row"><button type="button" class="btn btn-ghost" id="copy-btn">Copy message</button><a class="btn btn-ghost" id="fallback-link" href="#" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></div></div>
</form></div>
<aside class="contact-side"><h2 class="h3">Studio details</h2><address class="addr">${SITE.addressLines.map(esc).join('<br>')}</address>
<ul class="contact-list"><li>${I.wa}<a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${SITE.whatsappDisplay}</a></li><li>${I.mail}<a href="mailto:${SITE.email}">${SITE.email}</a></li><li>${I.ig}<a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer">${SITE.instagramHandle}</a></li></ul>
<div class="btn-row"><a class="btn btn-primary" href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">${I.pin}Get directions</a></div>
<h3 class="h4">How enquiries work</h3><p class="muted">Pick an outfit from the <a href="/collections/">collection</a>, message us with your event date, and we will confirm price, availability and sizing. Opening hours: please confirm on WhatsApp.</p></aside></div></div></section>`;
  return layout({ title: 'Contact & Directions', desc: 'Contact Saiyar Ethnic Studio in Nikol, Ahmedabad. Enquire on WhatsApp, email, get directions, or send your rental enquiry.', path: '/contact/', body, active: '/contact/', ld: [crumbLd(c), localLd()] });
}

const FAQS = [
  ['How do I rent an outfit?', 'Browse the collection, open the outfit you like and tap "Enquire on WhatsApp". We will confirm price, availability, sizing and dates, and you then visit the studio in Nikol to complete the rental arrangements.'],
  ['What is the rental price?', 'Outfits across the studio range from ₹500 to ₹10,000, depending on the look. The price of a specific outfit is confirmed by the studio on WhatsApp.'],
  ['How do I check availability for my wedding date?', 'Message us on WhatsApp with the outfit name and your event date. A booking is not confirmed until the studio confirms it with you.'],
  ['How can I confirm sizing?', 'Share your size or measurements on WhatsApp and ask about the outfit you like. You can also visit the studio to see the outfit in person.'],
  ['How long can I rent an outfit?', 'Rental duration depends on the outfit and your event. Please confirm it with the studio on WhatsApp.'],
  ['Do I need to visit the studio?', 'You can browse and enquire online, but rental arrangements are completed with the studio. Please confirm the details on WhatsApp before visiting.'],
  ['What are the rental terms?', 'Deposits, collection, return and any charges are confirmed directly with the studio. See our rental terms page for what to ask.'],
  ['How do I contact Saiyar Ethnic Studio?', `WhatsApp ${SITE.whatsappDisplay}, email ${SITE.email}, or visit us at Nikol Gam Road, Ahmedabad. You can also message us on Instagram ${SITE.instagramHandle}.`],
];
function faq() {
  const c = [['/', 'Home'], ['/faq/', 'FAQ']];
  const body = `<section class="banner banner-slim"><div class="wrap"><h1 class="h1 h1-sm">Frequently asked questions</h1><p class="lead">Answers about renting at Saiyar Ethnic Studio.</p></div></section>
<section class="sec sec-pt0"><div class="wrap prose">${crumbs(c)}<div class="faq">${FAQS.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
<div class="cta-band"><h2 class="h3">Still have a question?</h2>${waBtn('Ask on WhatsApp', 'Hello Saiyar Ethnic Studio, I have a question about renting an outfit.')}</div></div></section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return layout({ title: 'FAQ: Renting Ethnic Wear in Ahmedabad', desc: 'Common questions about renting wedding cholis, sarees and gowns at Saiyar Ethnic Studio, Nikol, Ahmedabad.', path: '/faq/', body, ld: [crumbLd(c), ld] });
}

const confirm = t => `<p class="callout"><strong>Owner to confirm:</strong> ${t}</p>`;
function terms() {
  const c = [['/', 'Home'], ['/rental-terms/', 'Rental Terms']];
  const body = `<section class="banner banner-slim"><div class="wrap"><h1 class="h1 h1-sm">Rental terms</h1><p class="lead">What to confirm with the studio before you rent.</p></div></section>
<section class="sec sec-pt0"><div class="wrap prose">${crumbs(c)}
<p>Saiyar Ethnic Studio rents outfits. Every rental is arranged directly with the studio, and the details below are confirmed with you on WhatsApp or at the studio before anything is final.</p>
<h2 class="h3">Please confirm with the studio</h2><ul><li>Rental price for your chosen outfit.</li><li>Availability for your event date, and the rental dates.</li><li>Size, fit and any alteration options.</li><li>Deposit, if any.</li><li>Collection and return arrangements.</li><li>Any additional charges, such as for damage or late return.</li></ul>
<h2 class="h3">Bookings</h2><p>An enquiry on this website is not a booking. A rental is confirmed only when the studio confirms it with you.</p>
${confirm('Deposit amount and refund rules.')}${confirm('Rental duration and late-return charges.')}${confirm('Alterations, cleaning and damage policy.')}${confirm('Cancellation and date-change policy.')}
<div class="btn-row">${waBtn('Ask about terms on WhatsApp', 'Hello Saiyar Ethnic Studio, please share the rental terms, deposit and return details for an outfit.')}</div></div></section>`;
  return layout({ title: 'Rental Terms', desc: 'What to confirm before renting an outfit from Saiyar Ethnic Studio, Nikol, Ahmedabad: price, dates, sizing, deposit and return.', path: '/rental-terms/', body, ld: [crumbLd(c)] });
}
function privacy() {
  const c = [['/', 'Home'], ['/privacy-policy/', 'Privacy Policy']];
  const body = `<section class="banner banner-slim"><div class="wrap"><h1 class="h1 h1-sm">Privacy policy</h1><p class="lead">How enquiry information is used on this website.</p></div></section>
<section class="sec sec-pt0"><div class="wrap prose">${crumbs(c)}
<h2 class="h3">What this website collects</h2><p>This website has no accounts, payments or database. When you use the contact form, the details you type (name, WhatsApp number, outfit category, occasion, date, budget and message) are placed into a WhatsApp message on your own device. They are not stored or emailed by this website. The message is sent only if you choose to send it in WhatsApp.</p>
<h2 class="h3">When you message us</h2><p>If you contact the studio on WhatsApp, email or Instagram, the studio receives the information you send and uses it to reply to your enquiry. Those services have their own privacy policies.</p>
<h2 class="h3">Third-party services</h2><p>This site loads fonts from Google Fonts and links to WhatsApp, Instagram and Google Maps. Those services may collect technical information such as your IP address when you use them.</p>
<h2 class="h3">Contact</h2><p>Questions about your information: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
${confirm('Whether the studio keeps customer records, how long, and the business owner’s legal name. Add analytics or cookie details here if they are installed later.')}</div></section>`;
  return layout({ title: 'Privacy Policy', desc: 'How Saiyar Ethnic Studio uses the information you share when you enquire about a rental outfit.', path: '/privacy-policy/', body, ld: [crumbLd(c)] });
}
const notFound = () => layout({ title: 'Page not found', desc: 'This page could not be found.', path: '/404', noindex: true, body: `<section class="sec"><div class="wrap center"><h1 class="h1 h1-sm">We could not find that page</h1><p class="lead">The page may have moved. Try the collection instead.</p><div class="btn-row center-row"><a class="btn btn-primary" href="/collections/">Browse collections</a><a class="btn btn-ghost" href="/">Go home</a></div></div></section>` });

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(PUB, DIST, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/styles.css'), path.join(DIST, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src/app.js'), path.join(DIST, 'app.js'));
prods.forEach(p => { if (p.isPlaceholder) write(`images/products/${p.slug}.svg`, art(p.kind, p.palette)); });
write('images/og.svg', art('choli', PRODUCTS[0].palette));
write('images/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#6B1E2E"/><text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#C8A96A">S</text></svg>`);

write('index.html', home());
write('collections/index.html', collections());
CATEGORIES.forEach(c => write(`collections/${c.slug}/index.html`, categoryPage(c)));
prods.forEach(p => write(`products/${p.slug}/index.html`, productPage(p)));
write('about/index.html', about()); write('contact/index.html', contact()); write('faq/index.html', faq());
write('rental-terms/index.html', terms()); write('privacy-policy/index.html', privacy()); write('404.html', notFound());
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemap)].map(u => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log(`Built ${sitemap.length} pages, ${prods.length} products (${prods.filter(p => p.isPlaceholder).length} using placeholder art) -> dist/`);
