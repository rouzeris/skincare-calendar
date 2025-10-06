// Baza danych popularnych marek kosmetycznych i ich produktów
export interface CosmeticBrand {
  name: string;
  country: string;
  category: 'luxury' | 'mass' | 'drugstore' | 'professional' | 'korean' | 'natural';
  popularProducts: string[];
}

export const cosmeticsDatabase: CosmeticBrand[] = [
  // Luksusowe marki
  {
    name: 'Chanel',
    country: 'France',
    category: 'luxury',
    popularProducts: ['Rouge Coco', 'Les Beiges', 'Le Lift Crème', 'Sublimage']
  },
  {
    name: 'Dior',
    country: 'France', 
    category: 'luxury',
    popularProducts: ['Rouge Dior', 'Capture Totale', 'Forever Foundation', 'Addict Lip']
  },
  {
    name: 'Estée Lauder',
    country: 'USA',
    category: 'luxury',
    popularProducts: ['Double Wear', 'Advanced Night Repair', 'Pure Color', 'Revitalizing Supreme']
  },
  {
    name: 'Lancôme',
    country: 'France',
    category: 'luxury',
    popularProducts: ['Teint Idole', 'Génifique', 'Rouge Drama', 'Rénergie']
  },
  {
    name: 'YSL',
    country: 'France',
    category: 'luxury',
    popularProducts: ['Touche Éclat', 'Rouge Volupté', 'All Hours Foundation', 'Black Opium']
  },
  
  // Mass market
  {
    name: "L'Oréal Paris",
    country: 'France',
    category: 'mass',
    popularProducts: ['True Match', 'Revitalift', 'Color Riche', 'Age Perfect']
  },
  {
    name: 'Maybelline',
    country: 'USA',
    category: 'mass',
    popularProducts: ['Fit Me', 'Baby Lips', 'Great Lash', 'SuperStay']
  },
  {
    name: 'Revlon',
    country: 'USA',
    category: 'mass',
    popularProducts: ['ColorStay', 'Super Lustrous', 'PhotoReady', 'Age Defying']
  },
  
  // Apteczne
  {
    name: 'Eucerin',
    country: 'Germany',
    category: 'drugstore',
    popularProducts: ['Q10 Active', 'Hyaluron-Filler', 'Sun Protection', 'AtopiControl']
  },
  {
    name: 'Vichy',
    country: 'France',
    category: 'drugstore',
    popularProducts: ['Aqualia Thermal', 'LiftActiv', 'Capital Soleil', 'Normaderm']
  },
  {
    name: 'La Roche-Posay',
    country: 'France',
    category: 'drugstore',
    popularProducts: ['Effaclar', 'Toleriane', 'Anthelios', 'Hyalu B5']
  },
  {
    name: 'Avène',
    country: 'France',
    category: 'drugstore',
    popularProducts: ['Thermal Spring Water', 'Cleanance', 'Hydrance', 'Fluide Minéral']
  },
  {
    name: 'Bioderma',
    country: 'France',
    category: 'drugstore',
    popularProducts: ['Sensibio H2O', 'Atoderm', 'Sebium', 'Photoderm']
  },
  
  // Kanadyjskie marki
  {
    name: 'The Ordinary',
    country: 'Canada',
    category: 'drugstore',
    popularProducts: ['Niacinamide 10%', 'Hyaluronic Acid', 'Retinol 0.5%', 'AHA BHA Peeling']
  },
  
  // Koreańskie marki K-Beauty
  {
    name: 'COSRX',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Snail 96 Mucin Power Essence', 'BHA Blackhead Power Liquid', 'Low pH Good Morning Cleanser', 'Centella Blemish Cream']
  },
  {
    name: 'Some By Mi',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['AHA BHA PHA 30 Days Miracle Serum', 'Red Tea Tree Spot Treatment', 'Snail Truecica Miracle Repair', 'Goodbye Blackhead Green Miracle']
  },
  {
    name: 'Innisfree',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Green Tea Seed Serum', 'Super Volcanic Pore Clay Mask', 'Jeju Cherry Blossom Tone Up Cream', 'No Sebum Mineral Powder']
  },
  {
    name: 'Beauty of Joseon',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Dynasty Cream', 'Glow Replenishing Rice Milk', 'Red Bean Water Gel', 'Calming Serum']
  },
  {
    name: 'Purito',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Centella Unscented Serum', 'Comfy Water Sun Block', 'From Green Cleansing Oil', 'B5 Panthenol Re-barrier Cream']
  },
  {
    name: 'Missha',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Time Revolution First Treatment Essence', 'Perfect Cover BB Cream', 'Super Aqua Ultra Hyalron', 'Cho Bo Yang']
  },
  {
    name: 'Etude House',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['SoonJung pH 6.5 Whip Cleanser', 'Moistfull Collagen Cream', 'Dear Darling Water Gel Tint', 'Play Color Eyes']
  },
  {
    name: 'The Face Shop',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Rice Water Bright Cleansing Foam', 'The Therapy Oil Blending Formula', 'Yehwadam Heaven Grade Ginseng', 'Jeju Aloe Fresh Soothing Gel']
  },
  {
    name: 'Laneige',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Water Sleeping Mask', 'Lip Sleeping Mask', 'Cream Skin Refiner', 'Perfect Renew 3X']
  },
  {
    name: 'Dr. Jart+',
    country: 'South Korea',
    category: 'korean',
    popularProducts: ['Cicapair Tiger Grass Color Correcting Treatment', 'Ceramidin Cream', 'Dermask Water Jet', 'V7 Toning Light']
  },
  {
    name: 'SK-II',
    country: 'Japan',
    category: 'luxury',
    popularProducts: ['Facial Treatment Essence', 'GenOptics Aura Essence', 'R.N.A. Power Radical New Age', 'Color Clear Beauty Artisan Brush Foundation']
  },
  {
    name: 'Shiseido',
    country: 'Japan',
    category: 'luxury',
    popularProducts: ['Ultimune Power Infusing Concentrate', 'Benefiance Wrinkle Smoothing Cream', 'Synchro Skin Self-Refreshing Foundation', 'Perfect Rouge']
  },
  {
    name: 'Hada Labo',
    country: 'Japan',
    category: 'drugstore',
    popularProducts: ['Gokujyun Premium Hyaluronic Lotion', 'Shirojyun Premium Whitening Lotion', 'Koi-Gokujyun Perfect Gel', 'UV White Gel']
  },
  {
    name: 'Tatcha',
    country: 'USA',
    category: 'luxury',
    popularProducts: ['The Water Cream', 'The Dewy Skin Cream', 'Rice Polish Classic', 'Violet-C Brightening Serum']
  },
  {
    name: 'Drunk Elephant',
    country: 'USA',
    category: 'luxury',
    popularProducts: ['C-Firma Day Serum', 'B-Hydra Intensive Hydration Serum', 'TLC Framboos Glycolic Night Serum', 'Protini Polypeptide Cream']
  },
  
  // Naturalne marki
  {
    name: 'Weleda',
    country: 'Switzerland',
    category: 'natural',
    popularProducts: ['Calendula Baby Care', 'Pomegranate Firming', 'Wild Rose Smoothing', 'Sea Buckthorn Body Oil']
  },
  {
    name: 'Dr. Hauschka',
    country: 'Germany',
    category: 'natural',
    popularProducts: ['Rose Day Cream', 'Regenerating Serum', 'Clarifying Toner', 'Quince Hydrating Body Milk']
  },
  
  // Polskie marki
  {
    name: 'Ziaja',
    country: 'Poland',
    category: 'drugstore',
    popularProducts: ['Kozie Mleko', 'Manuka Tree Purifying', 'Sopot Spa', 'Med']
  },
  {
    name: 'Eveline',
    country: 'Poland',
    category: 'mass',
    popularProducts: ['Facemed+', 'Royal Snail', 'Laser Therapy', 'Bio Hyaluron 4D']
  },
  {
    name: 'Bielenda',
    country: 'Poland',
    category: 'mass',
    popularProducts: ['Carbo Detox', 'Good Skin Acid Peel', 'Rose Care', 'Vegan Friendly']
  },
  {
    name: 'Under Twenty',
    country: 'Poland',
    category: 'mass',
    popularProducts: ['Anti Acne', 'Nutri Lash & Brow', 'Metamorphosis Brightening', 'Black Pearl']
  },

  // Niemieckie marki
  {
    name: 'Nivea',
    country: 'Germany',
    category: 'mass',
    popularProducts: ['Creme', 'Q10 Power', 'Cellular Anti-Age', 'Protect & Care']
  },
  {
    name: 'Sebamed',
    country: 'Germany',
    category: 'drugstore',
    popularProducts: ['Clear Face Care Gel', 'Everyday Shampoo', 'Anti-Dry Night Intensive Cream', 'Baby Sebamed']
  },

  // Włoskie marki
  {
    name: 'Collistar',
    country: 'Italy',
    category: 'luxury',
    popularProducts: ['Pure Actives Collagen', 'Magnifica Plus', 'Special Perfect Body', 'Art Design']
  },
  {
    name: 'Bottega Verde',
    country: 'Italy',
    category: 'natural',
    popularProducts: ['Argan del Marocco', 'Melograno', 'Rosa Bulgara', 'Aloe']
  },

  // Hiszpańskie marki
  {
    name: 'Isdin',
    country: 'Spain',
    category: 'drugstore',
    popularProducts: ['Fotoprotektor Fusion Water', 'Lambdapil Anti-Hair Loss', 'Isdinceutics Hyaluronic Concentrate', 'Acniben']
  },

  // Brytyjskie marki
  {
    name: 'The Body Shop',
    country: 'UK',
    category: 'natural',
    popularProducts: ['Tea Tree', 'Vitamin E', 'Shea', 'Himalayan Charcoal']
  },
  {
    name: 'Charlotte Tilbury',
    country: 'UK',
    category: 'luxury',
    popularProducts: ['Magic Cream', 'Flawless Filter', 'Pillow Talk', 'Magic Away Concealer']
  },

  // Duńskie marki
  {
    name: 'Ole Henriksen',
    country: 'Denmark',
    category: 'luxury',
    popularProducts: ['Truth Serum', 'Banana Bright Eye Cream', 'C-Rush Brightening Gel Crème', 'Glow2OH Dark Spot Toner']
  },

  // Izraelskie marki
  {
    name: 'Ahava',
    country: 'Israel',
    category: 'natural',
    popularProducts: ['Dead Sea Water', 'Essential Day Moisturizer', 'Purifying Mud Mask', 'Mineral Hand Cream']
  },

  // Australijskie marki
  {
    name: 'Aesop',
    country: 'Australia',
    category: 'luxury',
    popularProducts: ['Parsley Seed Facial Cleanser', 'Resurrection Aromatique Hand Balm', 'Mandarin Facial Hydrating Cream', 'Amazing Face Cleanser']
  },

  // Brazylijskie marki
  {
    name: 'Natura',
    country: 'Brazil',
    category: 'natural',
    popularProducts: ['Chronos', 'Tododia', 'Plant', 'Una']
  },

  // Indyjskie marki
  {
    name: 'Forest Essentials',
    country: 'India',
    category: 'natural',
    popularProducts: ['Kashmiri Saffron & Neem Honey Face Pack', 'Delicate Facial Cleanser Mashobra Honey', 'Soundarya Radiance Cream', 'Bhringraj Hair Cleanser']
  },

  // Tajskie marki
  {
    name: 'Thann',
    country: 'Thailand',
    category: 'natural',
    popularProducts: ['Rice Bran Oil', 'Aromatic Wood', 'Oriental Essence', 'Shiso']
  }
];

export function searchBrands(query: string): CosmeticBrand[] {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return cosmeticsDatabase.filter(brand =>
    brand.name.toLowerCase().includes(lowercaseQuery) ||
    brand.popularProducts.some(product => 
      product.toLowerCase().includes(lowercaseQuery)
    )
  ).slice(0, 10); // Ogranicz do 10 wyników
}

export function getAllBrands(): string[] {
  return cosmeticsDatabase.map(brand => brand.name).sort();
}

export function getBrandProducts(brandName: string): string[] {
  const brand = cosmeticsDatabase.find(b => 
    b.name.toLowerCase() === brandName.toLowerCase()
  );
  return brand?.popularProducts || [];
}