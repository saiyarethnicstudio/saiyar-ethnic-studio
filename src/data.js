// ---- Central business + catalogue data. Edit here; every page is generated from it. ----
const SITE = {
  name: 'Saiyar Ethnic Studio',
  url: (process.env.SITE_URL || 'https://www.example.com').replace(/\/$/, ''), // set SITE_URL before real deployment
  whatsapp: '918980026639',
  whatsappDisplay: '+91 89800 26639',
  email: 'saiyarethnicstudio@gmail.com',
  instagram: 'https://www.instagram.com/saiyar_ethnic_studio_nikol/',
  instagramHandle: '@saiyar_ethnic_studio_nikol',
  addressLines: [
    'Saiyar Ethnic Studio',
    'B36, Nikol Gam Road, Opp. Vishala Supreme-2,',
    'Shreyans Park Society, Krishna Park Society,',
    'Kenal, Nikol, Ahmedabad, Gujarat – 382350, India.',
  ],
  // Add Instagram posts: { image: '/images/instagram/post1.webp', url: 'https://www.instagram.com/p/XXXX/', alt: 'what the photo shows' }
  instagramPosts: [],
  // Paste official Instagram embed snippets (post > ⋯ > Embed) here to show real reels on the About page.
  instagramEmbeds: [],
};
SITE.address = SITE.addressLines.join(' ');
SITE.mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(SITE.addressLines.slice(1).join(' '));

const CATEGORIES = [
  { id: 'cholis', slug: 'wedding-cholis', label: 'Wedding Cholis', nav: 'Cholis', title: 'Wedding Choli on Rent in Nikol, Ahmedabad',
    h1: 'Wedding Cholis on Rent',
    meta: 'Rent wedding cholis and designer choli outfits in Nikol, Ahmedabad. Browse looks for weddings, receptions and Garba, then enquire on WhatsApp.',
    intro: 'Choli outfits for wedding functions, receptions, engagements and Garba nights, available to rent at our Nikol studio. Open any look, then message us to confirm price, availability and sizing.',
    waMsg: n => `Hello Saiyar Ethnic Studio, I am interested in renting the ${n}. Please share the rental price, availability, sizing, and rental terms.` },
  { id: 'sarees', slug: 'heavy-sarees', label: 'Heavy & Designer Sarees', nav: 'Heavy Sarees', title: 'Heavy & Designer Sarees on Rent in Ahmedabad',
    h1: 'Heavy & Designer Sarees on Rent',
    meta: 'Heavy and designer sarees on rent in Ahmedabad for weddings, receptions and festive occasions. Explore the collection and enquire on WhatsApp.',
    intro: 'Rich, statement sarees for wedding guests, receptions and festive evenings. Choose a look you love and ask us about rental price and your event date.',
    waMsg: n => `Hello Saiyar Ethnic Studio, I am interested in the ${n}. Please share the rental price and availability for my event.` },
  { id: 'gowns', slug: 'wedding-gowns', label: 'Wedding Gowns', nav: 'Wedding Gowns', title: 'Wedding Gowns on Rent in Ahmedabad',
    h1: 'Wedding Gowns on Rent',
    meta: 'Wedding and reception gowns on rent in Ahmedabad. Browse elegant gown looks at Saiyar Ethnic Studio, Nikol, and enquire on WhatsApp.',
    intro: 'Elegant gowns for weddings, receptions and engagement celebrations. Find a silhouette you like and message us about price, sizing and availability.',
    waMsg: n => `Hello Saiyar Ethnic Studio, I am interested in renting the ${n}. Please share the rental price, sizing, and availability.` },
];

const OCCASIONS = [
  { id: 'Wedding Guest', blurb: 'Look polished from the first ritual to the last dance.' },
  { id: 'Reception & Engagement', blurb: 'Evening-ready outfits made for photographs.' },
  { id: 'Bridal Celebrations', blurb: 'Statement looks for the bride and her closest circle.' },
  { id: 'Festive & Garba', blurb: 'Colour, movement and twirl for festival nights.' },
];

// Placeholder products. Replace images by adding public/images/products/<slug>.webp (and <slug>-2.webp, <slug>-3.webp for extra views).
// Set rentalPrice and priceIsVerified:true ONLY once the studio confirms the price.
const P = (id, slug, name, category, kind, palette, visibleColor, details, occasion, blurb) => ({
  id, slug, name, category, kind, palette, visibleColor, visibleDesignDetails: details, occasion, description: blurb,
  rentalPrice: null, priceIsVerified: false, availabilityStatus: 'Confirm with studio',
});
const PRODUCTS = [
  P(1, 'wine-embroidered-bridal-choli', 'Wine Embroidered Bridal Choli', 'cholis', 'choli', { c: '#6B1E2E', a: '#C8A96A', bg: '#F1E3DA' }, 'Wine', ['Gold accent border', 'Flared skirt', 'Draped dupatta'], ['Bridal Celebrations', 'Wedding Guest'], 'A deep wine choli look with gold accents at the hem and a draped dupatta.'),
  P(2, 'ivory-gold-reception-choli', 'Ivory & Gold Reception Choli', 'cholis', 'choli', { c: '#E9DFC9', a: '#B08D4A', bg: '#F4EBDD' }, 'Ivory', ['Gold hem band', 'Soft ivory base'], ['Reception & Engagement', 'Wedding Guest'], 'A light ivory choli look finished with a gold hem band, suited to evening functions.'),
  P(3, 'emerald-festive-garba-choli', 'Emerald Festive Garba Choli', 'cholis', 'choli', { c: '#0F5A47', a: '#D8B35E', bg: '#E4EBDD' }, 'Emerald', ['Gold border', 'Wide flare for movement'], ['Festive & Garba'], 'A rich emerald choli look with a wide flare and gold border.'),
  P(4, 'rose-pink-sangeet-choli', 'Rose Pink Sangeet Choli', 'cholis', 'choli', { c: '#B5516B', a: '#E0C68A', bg: '#F5E3E3' }, 'Rose pink', ['Champagne border', 'Draped dupatta'], ['Wedding Guest', 'Reception & Engagement'], 'A rose pink choli look with a champagne border, soft and festive.'),
  P(5, 'crimson-heavy-border-saree', 'Crimson Heavy Border Saree', 'sarees', 'saree', { c: '#8E1B2B', a: '#D4B16A', bg: '#F2DFD8' }, 'Crimson', ['Wide gold border', 'Draped pallu'], ['Bridal Celebrations', 'Wedding Guest'], 'A crimson saree look with a wide gold border and a statement pallu.'),
  P(6, 'champagne-gold-designer-saree', 'Champagne Gold Designer Saree', 'sarees', 'saree', { c: '#C9AE78', a: '#6B1E2E', bg: '#F3EADA' }, 'Champagne gold', ['Contrast wine blouse', 'Draped pallu'], ['Reception & Engagement'], 'A champagne gold saree look paired with a contrasting wine blouse.'),
  P(7, 'midnight-navy-party-saree', 'Midnight Navy Party Saree', 'sarees', 'saree', { c: '#1E2A55', a: '#C8A96A', bg: '#E3E6EE' }, 'Midnight navy', ['Gold border', 'Pleated front'], ['Reception & Engagement', 'Wedding Guest'], 'A midnight navy saree look with a gold border and neat pleats.'),
  P(8, 'teal-festive-saree', 'Teal Festive Saree', 'sarees', 'saree', { c: '#17696C', a: '#D8B35E', bg: '#DFEBE8' }, 'Teal', ['Gold border', 'Draped pallu'], ['Festive & Garba', 'Wedding Guest'], 'A bright teal saree look with gold trim, made for festive gatherings.'),
  P(9, 'ivory-bridal-wedding-gown', 'Ivory Bridal Wedding Gown', 'gowns', 'gown', { c: '#F1EADB', a: '#C8A96A', bg: '#F0E6E1' }, 'Ivory', ['Fitted bodice', 'Full flared skirt', 'Gold sash'], ['Bridal Celebrations'], 'An ivory gown look with a fitted bodice, full skirt and a gold sash.'),
  P(10, 'blush-reception-gown', 'Blush Reception Gown', 'gowns', 'gown', { c: '#E6B7B4', a: '#B08D4A', bg: '#F7E8E3' }, 'Blush pink', ['Fitted bodice', 'Flowing skirt'], ['Reception & Engagement'], 'A blush pink gown look with a flowing skirt, graceful for receptions.'),
  P(11, 'emerald-evening-gown', 'Emerald Evening Gown', 'gowns', 'gown', { c: '#0E5C4A', a: '#D8B35E', bg: '#E1EBE2' }, 'Emerald', ['Fitted bodice', 'Gold sash'], ['Reception & Engagement', 'Wedding Guest'], 'An emerald gown look with a gold sash, ideal for an evening reception.'),
  P(12, 'wine-flared-gown', 'Wine Flared Gown', 'gowns', 'gown', { c: '#5E1A2B', a: '#C8A96A', bg: '#EFDFDA' }, 'Wine', ['Fitted bodice', 'Wide flared skirt'], ['Wedding Guest', 'Bridal Celebrations'], 'A wine gown look with a wide flared skirt and gold detailing.'),
];

module.exports = { SITE, CATEGORIES, OCCASIONS, PRODUCTS };
