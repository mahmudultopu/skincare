/* ==========================================================
   SERAÉ — store config + product catalog
   Edit this file to change prices, add products or brands.
   Prices are base USD (approximate international retail).
   ========================================================== */

const CONFIG = {
  storeName: 'Seraé',
  freeShippingOver: 75,          // USD
  shipping: { standard: 7.99, express: 19.99 },
  // Put a number like '8801XXXXXXXXX' to show an "Order on WhatsApp" button in the bag.
  whatsapp: '',
  // Approximate conversion rates from USD. Update them as needed.
  currencies: {
    USD: { rate: 1,    locale: 'en-US' },
    EUR: { rate: 0.92, locale: 'de-DE' },
    GBP: { rate: 0.78, locale: 'en-GB' },
    BDT: { rate: 122,  locale: 'en-BD' },
    INR: { rate: 84,   locale: 'en-IN' },
    AED: { rate: 3.67, locale: 'en-AE' },
    CAD: { rate: 1.37, locale: 'en-CA' },
    AUD: { rate: 1.52, locale: 'en-AU' },
  },
};

const CATEGORIES = [
  { id: 'all',         name: 'All' },
  { id: 'cleanser',    name: 'Cleansers' },
  { id: 'toner',       name: 'Toners & Essences' },
  { id: 'serum',       name: 'Serums' },
  { id: 'moisturizer', name: 'Moisturizers' },
  { id: 'sunscreen',   name: 'Sunscreen' },
  { id: 'treatment',   name: 'Treatments' },
  { id: 'mask',        name: 'Masks' },
  { id: 'eye',         name: 'Eye Care' },
];

const CONCERNS = [
  { id: 'acne',        name: 'Acne & breakouts' },
  { id: 'pores',       name: 'Pores & oil' },
  { id: 'dryness',     name: 'Dryness' },
  { id: 'aging',       name: 'Fine lines' },
  { id: 'dullness',    name: 'Dullness' },
  { id: 'dark-spots',  name: 'Dark spots' },
  { id: 'sensitivity', name: 'Redness' },
];

/* shape: dropper | pump | tube | jar | bottle | spray
   body/cap: packaging colours used by the SVG renderer
   label: 1–2 short lines printed on the pack                */
const PRODUCTS = [
  // ---------- The Ordinary
  { id: 'to-niacinamide', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%', cat: 'serum', size: '30 ml', price: 6.0, rating: 4.6, reviews: 28412,
    concerns: ['acne', 'pores', 'dullness'], shape: 'dropper', body: '#EAE5DD', cap: '#FFFFFF', label: ['Niacinamide', '10% + Zinc 1%'], badge: 'Bestseller',
    desc: 'A high-strength vitamin and mineral formula that visibly reduces blemishes, congestion and the look of enlarged pores.', key: ['Niacinamide 10%', 'Zinc PCA 1%'] },
  { id: 'to-hyaluronic', brand: 'The Ordinary', name: 'Hyaluronic Acid 2% + B5', cat: 'serum', size: '30 ml', price: 8.9, rating: 4.5, reviews: 19830,
    concerns: ['dryness', 'aging'], shape: 'dropper', body: '#E4E8EA', cap: '#FFFFFF', label: ['Hyaluronic', 'Acid 2% + B5'],
    desc: 'Multi-depth hydration with low, medium and high molecular weight hyaluronic acid plus vitamin B5 for plump, bouncy skin.', key: ['Hyaluronic acid', 'Panthenol (B5)'] },
  { id: 'to-peeling', brand: 'The Ordinary', name: 'AHA 30% + BHA 2% Peeling Solution', cat: 'treatment', size: '30 ml', price: 9.5, rating: 4.4, reviews: 15207,
    concerns: ['dullness', 'pores', 'dark-spots'], shape: 'dropper', body: '#9E2430', cap: '#FFFFFF', label: ['AHA 30%', '+ BHA 2%'],
    desc: 'A 10-minute exfoliating facial that refines texture, unclogs pores and reveals brighter skin. Use up to twice a week.', key: ['Glycolic acid', 'Salicylic acid', 'Tasmanian pepperberry'] },

  // ---------- CeraVe
  { id: 'cv-hydrating-cleanser', brand: 'CeraVe', name: 'Hydrating Facial Cleanser', cat: 'cleanser', size: '236 ml', price: 15.99, rating: 4.7, reviews: 41022,
    concerns: ['dryness', 'sensitivity'], shape: 'pump', body: '#F7F7F4', cap: '#2E6DB4', label: ['Hydrating', 'Cleanser'], badge: 'Bestseller',
    desc: 'A gentle, non-foaming cleanser with three essential ceramides that removes makeup and dirt without disrupting the skin barrier.', key: ['Ceramides 1, 3, 6-II', 'Hyaluronic acid'] },
  { id: 'cv-moisturizing-cream', brand: 'CeraVe', name: 'Moisturizing Cream', cat: 'moisturizer', size: '453 g', price: 19.99, rating: 4.8, reviews: 52310,
    concerns: ['dryness', 'sensitivity'], shape: 'jar', body: '#F7F7F4', cap: '#2E6DB4', label: ['Moisturizing', 'Cream'],
    desc: 'Rich, non-greasy cream that delivers 24-hour hydration and restores the protective skin barrier for face and body.', key: ['Ceramides', 'Hyaluronic acid', 'MVE technology'] },
  { id: 'cv-pm-lotion', brand: 'CeraVe', name: 'PM Facial Moisturizing Lotion', cat: 'moisturizer', size: '89 ml', price: 16.99, rating: 4.6, reviews: 23915,
    concerns: ['dryness', 'pores'], shape: 'pump', body: '#F4F6F8', cap: '#1F4E8C', label: ['PM Facial', 'Lotion'],
    desc: 'Lightweight overnight lotion with niacinamide that calms and hydrates while you sleep. Oil-free and non-comedogenic.', key: ['Niacinamide', 'Ceramides'] },

  // ---------- La Roche-Posay
  { id: 'lrp-anthelios', brand: 'La Roche-Posay', name: 'Anthelios Melt-in Milk SPF 60', cat: 'sunscreen', size: '150 ml', price: 37.99, rating: 4.7, reviews: 9811,
    concerns: ['aging', 'dark-spots', 'sensitivity'], shape: 'tube', body: '#FFFFFF', cap: '#F08A2C', label: ['Anthelios', 'SPF 60'],
    desc: 'Broad-spectrum, fast-absorbing sun protection for face and body. Water resistant and suitable for sensitive skin.', key: ['Cell-Ox Shield', 'Thermal spring water'] },
  { id: 'lrp-effaclar-duo', brand: 'La Roche-Posay', name: 'Effaclar Duo Acne Treatment', cat: 'treatment', size: '40 ml', price: 23.99, rating: 4.5, reviews: 7340,
    concerns: ['acne', 'pores'], shape: 'tube', body: '#FFFFFF', cap: '#2C7FB8', label: ['Effaclar', 'Duo'],
    desc: 'Dual-action acne treatment with micronized benzoyl peroxide that clears breakouts and helps prevent new ones.', key: ['Benzoyl peroxide 5.5%', 'LHA'] },
  { id: 'lrp-toleriane', brand: 'La Roche-Posay', name: 'Toleriane Double Repair Moisturizer', cat: 'moisturizer', size: '75 ml', price: 24.99, rating: 4.7, reviews: 12088,
    concerns: ['sensitivity', 'dryness'], shape: 'pump', body: '#FFFFFF', cap: '#4D8FCC', label: ['Toleriane', 'Double Repair'],
    desc: 'Oil-free daily moisturizer that restores the skin barrier in one hour and provides 48-hour hydration.', key: ['Ceramide-3', 'Niacinamide', 'Prebiotic water'] },

  // ---------- Estée Lauder
  { id: 'el-anr', brand: 'Estée Lauder', name: 'Advanced Night Repair Serum', cat: 'serum', size: '50 ml', price: 115, rating: 4.8, reviews: 8654,
    concerns: ['aging', 'dullness', 'dryness'], shape: 'dropper', body: '#4A2A14', cap: '#C9A86A', label: ['Advanced', 'Night Repair'], badge: 'Luxury',
    desc: 'The iconic night serum that reduces multiple signs of ageing, strengthens skin and boosts radiance overnight.', key: ['Chronolux Power Signal', 'Hyaluronic acid', 'Tripeptide-32'] },
  { id: 'el-anr-eye', brand: 'Estée Lauder', name: 'Advanced Night Repair Eye Gel-Creme', cat: 'eye', size: '15 ml', price: 80, rating: 4.6, reviews: 3120,
    concerns: ['aging', 'dryness'], shape: 'jar', body: '#4A2A14', cap: '#C9A86A', label: ['ANR', 'Eye'], scale: 0.78,
    desc: 'Cooling gel-creme that targets puffiness, dark circles and fine lines around the delicate eye area.', key: ['Chronolux technology', 'Caffeine'] },

  // ---------- Clinique
  { id: 'cl-ddml', brand: 'Clinique', name: 'Dramatically Different Moisturizing Lotion+', cat: 'moisturizer', size: '125 ml', price: 34, rating: 4.6, reviews: 11409,
    concerns: ['dryness', 'sensitivity'], shape: 'pump', body: '#F3DD6A', cap: '#9E9E9E', label: ['Dramatically', 'Different'],
    desc: 'The dermatologist-developed yellow lotion that softens, smooths and strengthens the skin barrier.', key: ['Hyaluronic acid', 'Sunflower seed oil'] },
  { id: 'cl-all-about-eyes', brand: 'Clinique', name: 'All About Eyes', cat: 'eye', size: '15 ml', price: 39, rating: 4.4, reviews: 4230,
    concerns: ['aging', 'dryness'], shape: 'jar', body: '#E7EEF1', cap: '#9DA7AD', label: ['All About', 'Eyes'], scale: 0.78,
    desc: 'Lightweight eye cream that visibly reduces puffiness and dark circles with every use.', key: ['Caffeine', 'Whey protein'] },

  // ---------- Kiehl's
  { id: 'ki-ultra-facial', brand: "Kiehl's", name: 'Ultra Facial Cream', cat: 'moisturizer', size: '50 ml', price: 38, rating: 4.7, reviews: 9420,
    concerns: ['dryness'], shape: 'jar', body: '#FBFAF6', cap: '#FBFAF6', label: ['Ultra Facial', 'Cream'],
    desc: 'Lightweight 24-hour daily moisturizer that leaves skin soft, smooth and comfortable in any climate.', key: ['Squalane', 'Glacial glycoprotein'] },
  { id: 'ki-midnight', brand: "Kiehl's", name: 'Midnight Recovery Concentrate', cat: 'serum', size: '30 ml', price: 56, rating: 4.6, reviews: 5013,
    concerns: ['aging', 'dullness'], shape: 'dropper', body: '#1E2A47', cap: '#F2EFE8', label: ['Midnight', 'Recovery'],
    desc: 'A lightweight facial oil of distilled botanicals that visibly restores skin overnight for a refreshed look by morning.', key: ['Lavender essential oil', 'Evening primrose oil'] },
  { id: 'ki-avocado-eye', brand: "Kiehl's", name: 'Creamy Eye Treatment with Avocado', cat: 'eye', size: '14 ml', price: 36, rating: 4.5, reviews: 6550,
    concerns: ['dryness', 'aging'], shape: 'jar', body: '#FBFAF6', cap: '#5C7A3A', label: ['Avocado', 'Eye'], scale: 0.74,
    desc: 'Rich eye cream with avocado oil that deeply hydrates and nourishes the delicate under-eye area.', key: ['Avocado oil', 'Shea butter', 'Beta-carotene'] },

  // ---------- Drunk Elephant
  { id: 'de-c-firma', brand: 'Drunk Elephant', name: 'C-Firma Fresh Day Serum', cat: 'serum', size: '28 ml', price: 78, rating: 4.4, reviews: 3866,
    concerns: ['dullness', 'dark-spots', 'aging'], shape: 'pump', body: '#F4A23B', cap: '#FFFFFF', label: ['C-Firma', 'Fresh'],
    desc: 'Potent vitamin C day serum, freshly mixed at first use, that firms and brightens while fighting signs of photoageing.', key: ['L-ascorbic acid 15%', 'Ferulic acid', 'Vitamin E'] },
  { id: 'de-protini', brand: 'Drunk Elephant', name: 'Protini Polypeptide Cream', cat: 'moisturizer', size: '50 ml', price: 68, rating: 4.5, reviews: 5217,
    concerns: ['aging', 'dryness'], shape: 'jar', body: '#FFFFFF', cap: '#7FB3D5', label: ['Protini', 'Polypeptide'],
    desc: 'Signal-peptide moisturizer that improves the look of firmness, tone and texture for healthier-looking skin.', key: ['Signal peptides', 'Pygmy waterlily', 'Amino acids'] },

  // ---------- Paula's Choice
  { id: 'pc-bha', brand: "Paula's Choice", name: 'Skin Perfecting 2% BHA Liquid Exfoliant', cat: 'treatment', size: '118 ml', price: 35, rating: 4.7, reviews: 25110,
    concerns: ['pores', 'acne', 'dullness'], shape: 'bottle', body: '#F2F2F0', cap: '#E44D4D', label: ['2% BHA', 'Exfoliant'], badge: 'Bestseller',
    desc: 'Cult leave-on exfoliant that unclogs and minimises pores, smooths wrinkles and evens skin tone.', key: ['Salicylic acid 2%', 'Green tea extract'] },

  // ---------- COSRX
  { id: 'cx-snail', brand: 'COSRX', name: 'Advanced Snail 96 Mucin Power Essence', cat: 'toner', size: '100 ml', price: 25, rating: 4.7, reviews: 34519,
    concerns: ['dryness', 'dullness', 'sensitivity'], shape: 'pump', body: '#E9E3D6', cap: '#2B2B2B', label: ['Snail 96', 'Mucin'], badge: 'K-Beauty',
    desc: 'Lightweight essence with 96% snail secretion filtrate that repairs, hydrates and gives skin a healthy glow.', key: ['Snail mucin 96%', 'Sodium hyaluronate'] },
  { id: 'cx-good-morning', brand: 'COSRX', name: 'Low pH Good Morning Gel Cleanser', cat: 'cleanser', size: '150 ml', price: 14, rating: 4.5, reviews: 18604,
    concerns: ['acne', 'pores'], shape: 'tube', body: '#E2F0E4', cap: '#3B8C5A', label: ['Good Morning', 'Gel Cleanser'],
    desc: 'Mildly acidic gel cleanser with tea tree oil and BHA that cleanses gently while keeping skin balanced.', key: ['Tea tree oil', 'Betaine salicylate'] },

  // ---------- Laneige
  { id: 'la-water-sleeping', brand: 'Laneige', name: 'Water Sleeping Mask', cat: 'mask', size: '70 ml', price: 34, rating: 4.6, reviews: 13820,
    concerns: ['dryness', 'dullness'], shape: 'jar', body: '#6EA6D8', cap: '#DCEBF7', label: ['Water', 'Sleeping Mask'], badge: 'K-Beauty',
    desc: 'Overnight gel mask that intensely hydrates and revitalises tired skin while you sleep.', key: ['Squalane', 'Probiotic-derived complex'] },
  { id: 'la-lip-mask', brand: 'Laneige', name: 'Lip Sleeping Mask — Berry', cat: 'mask', size: '20 g', price: 24, rating: 4.7, reviews: 29741,
    concerns: ['dryness'], shape: 'jar', body: '#E8708F', cap: '#F7C6D2', label: ['Lip', 'Sleeping Mask'], scale: 0.72,
    desc: 'Leave-on lip mask with berry fruit complex that soothes and moisturises for softer, smoother lips by morning.', key: ['Berry fruit complex', 'Murumuru butter', 'Vitamin C'] },

  // ---------- Sulwhasoo
  { id: 'sw-first-care', brand: 'Sulwhasoo', name: 'First Care Activating Serum', cat: 'serum', size: '60 ml', price: 99, rating: 4.7, reviews: 2970,
    concerns: ['aging', 'dullness', 'dryness'], shape: 'bottle', body: '#B98A4E', cap: '#E2C68F', label: ['First Care', 'Activating'], badge: 'Luxury',
    desc: 'Ginseng-powered first-step serum that balances, hydrates and preps skin to absorb the rest of your routine.', key: ['JAUM Activator', 'Korean ginseng'] },

  // ---------- Shiseido
  { id: 'sh-ultimune', brand: 'Shiseido', name: 'Ultimune Power Infusing Serum', cat: 'serum', size: '50 ml', price: 92, rating: 4.6, reviews: 3410,
    concerns: ['aging', 'dryness', 'sensitivity'], shape: 'pump', body: '#C3202F', cap: '#E6E2DE', label: ['Ultimune', 'Power Serum'],
    desc: 'Skin-defending serum that strengthens against daily stressors for firmer, more resilient, radiant skin.', key: ['ImuGeneration RED technology', 'Reishi mushroom'] },

  // ---------- SK-II
  { id: 'sk-fte', brand: 'SK-II', name: 'Facial Treatment Essence', cat: 'toner', size: '160 ml', price: 199, rating: 4.7, reviews: 6122, old: 229,
    concerns: ['dullness', 'aging', 'pores'], shape: 'bottle', body: '#7A1F2B', cap: '#C7C2BC', label: ['Facial Treatment', 'Essence'], badge: 'Luxury',
    desc: 'The legendary "Pitera" essence that improves texture, clarity and radiance for crystal-clear skin.', key: ['Pitera (galactomyces ferment)'] },

  // ---------- Tatcha
  { id: 'ta-dewy', brand: 'Tatcha', name: 'The Dewy Skin Cream', cat: 'moisturizer', size: '50 ml', price: 72, rating: 4.6, reviews: 4710,
    concerns: ['dryness', 'dullness'], shape: 'jar', body: '#5D3A7A', cap: '#C4A55A', label: ['The Dewy', 'Skin Cream'],
    desc: 'Rich, plumping cream with Japanese purple rice and botanicals for a dewy, glowing complexion.', key: ['Okinawa algae', 'Purple rice', 'Hyaluronic acid'] },

  // ---------- Fresh
  { id: 'fr-soy', brand: 'Fresh', name: 'Soy Face Cleanser', cat: 'cleanser', size: '150 ml', price: 40, rating: 4.5, reviews: 6890,
    concerns: ['sensitivity', 'dryness'], shape: 'pump', body: '#F1E7D2', cap: '#D7C49E', label: ['Soy Face', 'Cleanser'],
    desc: 'Gentle gel cleanser with soy proteins that removes makeup and impurities while maintaining moisture.', key: ['Soy proteins', 'Rose water', 'Cucumber'] },
  { id: 'fr-rose-mask', brand: 'Fresh', name: 'Rose Face Mask', cat: 'mask', size: '100 ml', price: 66, rating: 4.5, reviews: 3304,
    concerns: ['dryness', 'sensitivity'], shape: 'jar', body: '#F3C6CE', cap: '#F7F2EE', label: ['Rose', 'Face Mask'],
    desc: 'Soothing gel mask with real rose petals that hydrates, tones and calms in just 10 minutes.', key: ['Rose petals', 'Rose flower oil', 'Cucumber'] },

  // ---------- Glow Recipe
  { id: 'gr-dew-drops', brand: 'Glow Recipe', name: 'Watermelon Glow Niacinamide Dew Drops', cat: 'serum', size: '40 ml', price: 35, rating: 4.4, reviews: 8217,
    concerns: ['dullness', 'dark-spots'], shape: 'dropper', body: '#F49AB1', cap: '#7DBE8A', label: ['Watermelon', 'Dew Drops'], badge: 'New',
    desc: 'Breakthrough highlighting serum that hydrates and reduces the look of hyperpigmentation for a dewy glow.', key: ['Niacinamide', 'Watermelon', 'Hyaluronic acid'] },

  // ---------- Beauty of Joseon
  { id: 'bj-relief-sun', brand: 'Beauty of Joseon', name: 'Relief Sun: Rice + Probiotics SPF50+', cat: 'sunscreen', size: '50 ml', price: 18, rating: 4.8, reviews: 22950,
    concerns: ['sensitivity', 'dark-spots', 'aging'], shape: 'tube', body: '#F5EFE3', cap: '#C9B48A', label: ['Relief Sun', 'SPF50+'], badge: 'K-Beauty',
    desc: 'Lightweight organic sunscreen with rice extract and probiotics. No white cast, comfortable for daily wear.', key: ['Rice extract 30%', 'Grain fermented extracts'] },
  { id: 'bj-glow-serum', brand: 'Beauty of Joseon', name: 'Glow Serum: Propolis + Niacinamide', cat: 'serum', size: '30 ml', price: 17, rating: 4.6, reviews: 11470,
    concerns: ['acne', 'dullness', 'pores'], shape: 'dropper', body: '#C98A2E', cap: '#F2EEE6', label: ['Glow Serum', 'Propolis'],
    desc: 'Soothing propolis serum with niacinamide that calms breakouts and brings out a healthy natural glow.', key: ['Propolis 60%', 'Niacinamide 2%', 'Tea tree'] },

  // ---------- Innisfree
  { id: 'in-green-tea', brand: 'Innisfree', name: 'Green Tea Seed Hyaluronic Serum', cat: 'serum', size: '80 ml', price: 27, rating: 4.5, reviews: 7035,
    concerns: ['dryness', 'dullness'], shape: 'pump', body: '#5E8F4B', cap: '#E9EEE5', label: ['Green Tea', 'Seed Serum'],
    desc: 'Hydrating serum with Jeju green tea and hyaluronic acid that strengthens the moisture barrier.', key: ['Jeju green tea', 'Hyaluronic acid'] },
  { id: 'in-volcanic', brand: 'Innisfree', name: 'Super Volcanic Pore Clay Mask', cat: 'mask', size: '100 ml', price: 20, rating: 4.4, reviews: 5980,
    concerns: ['pores', 'acne'], shape: 'jar', body: '#3A3A3A', cap: '#5A5A5A', label: ['Volcanic', 'Clay Mask'],
    desc: 'Deep-cleansing clay mask with Jeju volcanic clusters that absorbs excess sebum and refines pores.', key: ['Jeju volcanic clusters', 'AHA'] },

  // ---------- Neutrogena
  { id: 'ng-hydro-boost', brand: 'Neutrogena', name: 'Hydro Boost Water Gel', cat: 'moisturizer', size: '50 ml', price: 19.99, rating: 4.6, reviews: 30120,
    concerns: ['dryness'], shape: 'jar', body: '#4A90D9', cap: '#2D6FB8', label: ['Hydro Boost', 'Water Gel'],
    desc: 'Oil-free gel moisturizer with hyaluronic acid that quenches dry skin and keeps it looking smooth and supple.', key: ['Hyaluronic acid', 'Olive extract'] },

  // ---------- Bioderma
  { id: 'bd-sensibio', brand: 'Bioderma', name: 'Sensibio H2O Micellar Water', cat: 'cleanser', size: '500 ml', price: 17.99, rating: 4.7, reviews: 19780,
    concerns: ['sensitivity'], shape: 'bottle', body: '#F7F4F2', cap: '#E9A0B4', label: ['Sensibio', 'H2O'],
    desc: 'The original micellar water that cleanses and removes makeup while respecting sensitive skin.', key: ['Micelles', 'Cucumber extract'] },

  // ---------- Avène
  { id: 'av-thermal', brand: 'Avène', name: 'Thermal Spring Water Spray', cat: 'toner', size: '150 ml', price: 18, rating: 4.6, reviews: 6420,
    concerns: ['sensitivity', 'dryness'], shape: 'spray', body: '#FFFFFF', cap: '#E9E7E3', label: ['Thermal', 'Spring Water'],
    desc: 'Soothing, softening mist rich in minerals that calms irritated and sensitive skin instantly.', key: ['Avène thermal spring water'] },

  // ---------- Vichy
  { id: 'vi-mineral-89', brand: 'Vichy', name: 'Minéral 89 Hyaluronic Acid Booster', cat: 'serum', size: '50 ml', price: 34.5, rating: 4.6, reviews: 8805,
    concerns: ['dryness', 'sensitivity'], shape: 'dropper', body: '#E9EEF2', cap: '#FFFFFF', label: ['Minéral 89', 'Booster'],
    desc: 'Daily skin booster with 89% Vichy volcanic water that strengthens and plumps for a healthy glow.', key: ['Vichy volcanic water 89%', 'Hyaluronic acid'] },

  // ---------- Lancôme
  { id: 'lc-genifique', brand: 'Lancôme', name: 'Advanced Génifique Serum', cat: 'serum', size: '50 ml', price: 118, rating: 4.7, reviews: 4380, old: 135,
    concerns: ['aging', 'dullness'], shape: 'dropper', body: '#151515', cap: '#2A2A2A', label: ['Advanced', 'Génifique'], badge: 'Luxury',
    desc: 'Microbiome science serum that strengthens the skin barrier for visibly younger, radiant skin in 7 days.', key: ['Pre- and probiotic fractions', 'Hyaluronic acid'] },

  // ---------- Dior
  { id: 'di-capture', brand: 'Dior', name: 'Capture Totale Le Sérum', cat: 'serum', size: '50 ml', price: 150, rating: 4.6, reviews: 1290,
    concerns: ['aging', 'dullness'], shape: 'pump', body: '#E9E6E2', cap: '#BFB7AD', label: ['Capture Totale', 'Le Sérum'], badge: 'Luxury',
    desc: 'Firming, anti-ageing serum enriched with longoza that visibly redensifies and revitalises skin.', key: ['Longoza', 'Peony'] },

  // ---------- Clarins
  { id: 'cr-double', brand: 'Clarins', name: 'Double Serum', cat: 'serum', size: '50 ml', price: 105, rating: 4.7, reviews: 3960,
    concerns: ['aging', 'dullness', 'pores'], shape: 'pump', body: '#C3262F', cap: '#E8C26A', label: ['Double', 'Serum'],
    desc: 'Two-phase complete age-control serum with 21 plant extracts for smoother, firmer, more radiant skin.', key: ['Turmeric', 'Kangaroo flower', '21 plant extracts'] },

  // ---------- Origins
  { id: 'or-ginzing', brand: 'Origins', name: 'GinZing Energy-Boosting Gel Moisturizer', cat: 'moisturizer', size: '50 ml', price: 38, rating: 4.5, reviews: 5320,
    concerns: ['dullness', 'dryness'], shape: 'jar', body: '#F39A3B', cap: '#F7F0E6', label: ['GinZing', 'Gel Cream'],
    desc: 'Oil-free gel moisturizer with ginseng and coffee that hydrates and wakes up tired-looking skin.', key: ['Panax ginseng', 'Coffee bean', 'Niacinamide'] },

  // ---------- Sunday Riley
  { id: 'sr-good-genes', brand: 'Sunday Riley', name: 'Good Genes Lactic Acid Treatment', cat: 'treatment', size: '30 ml', price: 85, rating: 4.4, reviews: 2840,
    concerns: ['dullness', 'dark-spots', 'aging'], shape: 'pump', body: '#2B2B2B', cap: '#F3F1EC', label: ['Good Genes', 'Lactic Acid'],
    desc: 'Exfoliating lactic acid treatment that instantly brightens and smooths for visibly clearer skin.', key: ['Lactic acid', 'Licorice', 'Lemongrass'] },

  // ---------- Supergoop!
  { id: 'sg-unseen', brand: 'Supergoop!', name: 'Unseen Sunscreen SPF 40', cat: 'sunscreen', size: '50 ml', price: 38, rating: 4.6, reviews: 12750,
    concerns: ['aging', 'dark-spots'], shape: 'tube', body: '#FFE873', cap: '#FFFFFF', label: ['Unseen', 'SPF 40'],
    desc: 'Invisible, weightless, scentless sunscreen that doubles as a makeup-gripping primer.', key: ['Red algae', 'Frankincense', 'Meadowfoam seed'] },

  // ---------- Olay
  { id: 'ol-micro-sculpting', brand: 'Olay', name: 'Regenerist Micro-Sculpting Cream', cat: 'moisturizer', size: '48 g', price: 31.99, rating: 4.6, reviews: 21330,
    concerns: ['aging', 'dryness'], shape: 'jar', body: '#8E1B3A', cap: '#C9A35E', label: ['Regenerist', 'Micro-Sculpt'],
    desc: 'Advanced anti-ageing cream with amino-peptides that hydrates to plump and firm the look of skin.', key: ['Amino-peptides', 'Niacinamide', 'Hyaluronic acid'] },

  // ---------- Cetaphil
  { id: 'ce-gentle', brand: 'Cetaphil', name: 'Gentle Skin Cleanser', cat: 'cleanser', size: '236 ml', price: 12.99, rating: 4.6, reviews: 27410,
    concerns: ['sensitivity', 'dryness'], shape: 'pump', body: '#FFFFFF', cap: '#1D5FA8', label: ['Gentle Skin', 'Cleanser'],
    desc: 'Mild, soap-free formula that cleanses without stripping, ideal for sensitive and dry skin.', key: ['Niacinamide', 'Panthenol', 'Glycerin'] },

  // ---------- Medik8 / Murad / Dermalogica (more international picks)
  { id: 'mk-crystal-retinal', brand: 'Medik8', name: 'Crystal Retinal 6', cat: 'serum', size: '30 ml', price: 69, rating: 4.6, reviews: 2210,
    concerns: ['aging', 'acne', 'dark-spots'], shape: 'pump', body: '#F1EEE9', cap: '#23426F', label: ['Crystal', 'Retinal 6'], badge: 'New',
    desc: 'Next-generation vitamin A night serum that works up to 11× faster than retinol with minimal irritation.', key: ['Retinaldehyde 0.06%', 'Hyaluronic acid'] },
  { id: 'dm-daily-microfoliant', brand: 'Dermalogica', name: 'Daily Microfoliant', cat: 'treatment', size: '74 g', price: 65, rating: 4.7, reviews: 6830,
    concerns: ['dullness', 'pores', 'dark-spots'], shape: 'bottle', body: '#F4F2EE', cap: '#2B2B2B', label: ['Daily', 'Microfoliant'],
    desc: 'Rice-based enzyme powder that activates with water for a gentle daily polish and brighter skin.', key: ['Rice enzymes', 'Papain', 'Salicylic acid'] },
  { id: 'mu-retinal-resculpt', brand: 'Murad', name: 'Retinal ReSculpt Overnight Treatment', cat: 'treatment', size: '30 ml', price: 98, rating: 4.4, reviews: 970,
    concerns: ['aging'], shape: 'pump', body: '#C9A8D3', cap: '#F1ECF4', label: ['Retinal', 'ReSculpt'],
    desc: 'Overnight retinal treatment that visibly lifts, firms and smooths deep lines and wrinkles.', key: ['Retinal', 'Peptides', 'Hyaluronic acid'] },
];

/* ----------------------------------------------------------
   Admin overrides (saved from admin.html in this browser):
   store settings, product edits, added and hidden products.
   ---------------------------------------------------------- */
(() => {
  try {
    const cfg = JSON.parse(localStorage.getItem('serae:config') || 'null');
    if (cfg) {
      if (cfg.freeShippingOver != null) CONFIG.freeShippingOver = cfg.freeShippingOver;
      if (cfg.shipping) Object.assign(CONFIG.shipping, cfg.shipping);
      if (cfg.whatsapp != null) CONFIG.whatsapp = cfg.whatsapp;
      Object.entries(cfg.rates || {}).forEach(([code, rate]) => {
        if (CONFIG.currencies[code] && rate > 0) CONFIG.currencies[code].rate = rate;
      });
    }
    const cat = JSON.parse(localStorage.getItem('serae:catalog') || 'null');
    if (cat) {
      PRODUCTS.forEach((p) => Object.assign(p, cat.edits?.[p.id]));
      (cat.added || []).forEach((p) => PRODUCTS.push(p));
    }
  } catch { /* storage unavailable — use defaults */ }

  // The storefront never shows hidden products; the admin panel needs them all.
  if (!window.SERAE_ADMIN) {
    for (let i = PRODUCTS.length - 1; i >= 0; i--) if (PRODUCTS[i].hidden) PRODUCTS.splice(i, 1);
  }
})();
