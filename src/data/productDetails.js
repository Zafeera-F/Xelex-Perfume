// FRAGRANCE NOTE PYRAMID — frontend-only presentation data
// ---------------------------------------------------------------------------
// The database models Product (name/price/description/images/etc.) but
// deliberately not individual fragrance notes — top/heart/base notes are
// shared across an entire collection tier rather than being unique
// per-product data, so there's nothing to gain from storing them
// per-product. GET /api/products/:slug supplies everything else; this file
// supplies the note pyramid, keyed off the product's collection name.

export const NOTE_FAMILIES = {
  Signature: {
    top: ["Bergamot", "Pink Pepper", "Mandarin"],
    heart: ["Jasmine", "Rose", "Iris"],
    base: ["Musk", "Cedarwood", "Amber"],
  },
  Rare: {
    top: ["Saffron", "Cardamom", "Black Pepper"],
    heart: ["Oud", "Leather", "Violet"],
    base: ["Sandalwood", "Vanilla", "Patchouli"],
  },
  Classic: {
    top: ["Lemon", "Neroli", "Green Notes"],
    heart: ["Lavender", "Geranium", "Lily of the Valley"],
    base: ["Vetiver", "Oakmoss", "Tonka Bean"],
  },
  "Limited Edition": {
    top: ["White Pepper", "Bergamot", "Blackcurrant"],
    heart: ["White Orchid", "Ylang-Ylang", "Tuberose"],
    base: ["Ambergris", "White Musk", "Cashmeran"],
  },
};

export function getFragranceNotes(collectionName) {
  return NOTE_FAMILIES[collectionName] || NOTE_FAMILIES.Signature;
}
