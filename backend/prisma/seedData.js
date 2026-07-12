// Catalog reference data for prisma/seed.js — ported directly from the
// frontend's former static placeholder catalog (src/data/products.js +
// src/data/productDetails.js) so the seeded database renders identically to
// what the site showed before it had a real backend. `slug` values are the
// old static `id` values verbatim, so every existing /product/:slug URL
// keeps working unchanged.

const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const CATEGORY_NAMES = ["Men", "Women", "Unisex"];
export const COLLECTION_NAMES = ["Signature", "Rare", "Classic", "Limited Edition"];

// ids that were in FEATURED_PRODUCTS / BEST_SELLERS in the old placeholder data.
const FEATURED_SLUGS = ["noir-absolu", "velvet-amber", "golden-oud", "celestial-musk"];
const BEST_SELLER_SLUGS = ["royal-saffron", "ivory-rose", "amberwood", "moonlit-vanilla", "midnight-oud"];

const RAW_PRODUCTS = [
  { slug: "noir-absolu", name: "Noir Absolu", category: "Men", collection: "Signature", line: "XeleX Signature", price: 1499, rating: 4.6, reviews: 128, inStock: true, badge: "New", imageSeed: "xelex-p1", description: "A bold, contemporary signature scent built around a warm musk-and-cedar base — designed for everyday wear that still feels considered." },
  { slug: "velvet-amber", name: "Velvet Amber", category: "Women", collection: "Signature", line: "XeleX Signature", price: 1699, rating: 4.8, reviews: 214, inStock: true, badge: "Best Seller", imageSeed: "xelex-p2", description: "Soft amber wrapped in jasmine and rose, with just enough warmth to feel worn-in rather than heavy. Our most-loved signature release." },
  { slug: "golden-oud", name: "Golden Oud", category: "Unisex", collection: "Rare", line: "XeleX Rare", price: 2199, rating: 4.7, reviews: 96, inStock: true, badge: "Limited", imageSeed: "xelex-p3", description: "A rich, resinous oud built for evenings — smoky and layered, with saffron and leather giving it real depth. Produced in limited batches." },
  { slug: "celestial-musk", name: "Celestial Musk", category: "Women", collection: "Signature", line: "XeleX Signature", price: 1399, rating: 4.4, reviews: 73, inStock: true, badge: null, imageSeed: "xelex-p4", description: "A quiet, close-to-skin musk that leans floral rather than sweet. Built for daily wear where you want to be noticed, not announced." },
  { slug: "royal-saffron", name: "Royal Saffron", category: "Men", collection: "Rare", line: "XeleX Rare", price: 1899, rating: 4.5, reviews: 61, inStock: true, badge: null, imageSeed: "xelex-p5", description: "Spiced and confident, saffron and black pepper up top settle into oud and sandalwood — a rare-tier scent with real staying power." },
  { slug: "ivory-rose", name: "Ivory Rose", category: "Women", collection: "Classic", line: "XeleX Classic", price: 1599, rating: 4.3, reviews: 89, inStock: true, badge: null, imageSeed: "xelex-p6", description: "A classic rose composition softened with lily of the valley and vetiver. Timeless rather than trend-led." },
  { slug: "amberwood", name: "Amberwood", category: "Men", collection: "Classic", line: "XeleX Classic", price: 1799, rating: 4.6, reviews: 102, inStock: false, badge: null, imageSeed: "xelex-p7", description: "Warm woods and amber in a classic structure — reliable, versatile, and built to layer well with a jacket in cooler months." },
  { slug: "moonlit-vanilla", name: "Moonlit Vanilla", category: "Women", collection: "Signature", line: "XeleX Signature", price: 1499, rating: 4.2, reviews: 54, inStock: true, badge: null, imageSeed: "xelex-p8", description: "A gentle vanilla-forward signature scent, rounded out with musk and a touch of iris so it never tips into overly sweet." },
  { slug: "midnight-oud", name: "Midnight Oud", category: "Unisex", collection: "Rare", line: "XeleX Rare", price: 2099, rating: 4.9, reviews: 187, inStock: true, badge: "Best Seller", imageSeed: "xelex-p9", description: "Our most awarded rare-tier fragrance — deep oud and leather balanced by violet, built for cold-weather evenings." },
  { slug: "citrus-noir", name: "Citrus Noir", category: "Men", collection: "Classic", line: "XeleX Classic", price: 1299, rating: 4.0, reviews: 38, inStock: true, badge: null, imageSeed: "xelex-p10", description: "A crisp classic citrus opening that dries down into vetiver and oakmoss — sharp at first spray, grounded by the finish." },
  { slug: "white-orchid", name: "White Orchid", category: "Women", collection: "Limited Edition", line: "XeleX Rare", price: 2399, rating: 4.7, reviews: 45, inStock: true, badge: "Limited", imageSeed: "xelex-p11", description: "A limited-edition white floral built around orchid and tuberose, finished with ambergris and cashmeran for a modern skin-scent feel." },
  { slug: "spiced-leather", name: "Spiced Leather", category: "Men", collection: "Rare", line: "XeleX Rare", price: 1999, rating: 4.5, reviews: 67, inStock: false, badge: null, imageSeed: "xelex-p12", description: "Confident and spiced, black pepper and cardamom sit over an oud-and-leather heart — built for rare-tier occasions." },
  { slug: "jasmine-veil", name: "Jasmine Veil", category: "Women", collection: "Classic", line: "XeleX Classic", price: 1399, rating: 4.1, reviews: 29, inStock: true, badge: null, imageSeed: "xelex-p13", description: "A soft classic jasmine composition, lifted by neroli and settled by tonka bean. Easy to wear, hard to place exactly." },
  { slug: "sandalwood-mist", name: "Sandalwood Mist", category: "Unisex", collection: "Signature", line: "XeleX Signature", price: 1599, rating: 4.4, reviews: 82, inStock: true, badge: null, imageSeed: "xelex-p14", description: "A creamy, unisex signature sandalwood scent softened with rose and finished with warm amber — quietly versatile." },
];

export const CATALOG = RAW_PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  description: p.description,
  price: p.price,
  categoryName: p.category,
  collectionName: p.collection,
  brandLine: p.line,
  badge: p.badge,
  ratingAverage: p.rating,
  ratingCount: p.reviews,
  stockQuantity: p.inStock ? 25 : 0,
  isFeatured: FEATURED_SLUGS.includes(p.slug),
  isBestSeller: BEST_SELLER_SLUGS.includes(p.slug),
  images: [
    { url: img(p.imageSeed, 600, 750), altText: p.name, sortOrder: 0 },
    { url: img(`${p.slug}-alt1`, 700, 850), altText: `${p.name} alternate view 1`, sortOrder: 1 },
    { url: img(`${p.slug}-alt2`, 700, 850), altText: `${p.name} alternate view 2`, sortOrder: 2 },
  ],
}));
