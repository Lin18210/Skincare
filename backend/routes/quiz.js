const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Routine builder ────────────────────────────────────────────────────────
function buildRoutine(skin_type, skin_concerns = [], sensitivity, budget) {
  const isSensitive = sensitivity === 'high' || skin_type === 'sensitive';
  const isOily = skin_type === 'oily' || skin_type === 'combination';
  const isDry = skin_type === 'dry';
  const hasAcne = skin_concerns.includes('acne');
  const hasAging = skin_concerns.includes('aging');
  const hasDullness = skin_concerns.includes('dullness');
  const hasPores = skin_concerns.includes('pores');
  const hasRedness = skin_concerns.includes('redness');

  const morning = [
    {
      step: 1,
      name: 'Cleanser',
      category: 'Cleanser',
      icon: '🧼',
      tip: isOily
        ? 'Use a gel or foaming cleanser to control excess sebum.'
        : isDry || isSensitive
        ? 'Use a gentle creamy or low-pH cleanser to preserve moisture.'
        : 'Use a mild foaming or amino acid cleanser.',
    },
    {
      step: 2,
      name: 'Toner',
      category: 'Toner',
      icon: '💧',
      tip: isOily
        ? 'Use a BHA or witch hazel toner to tighten pores and control oil.'
        : 'Use a hydrating or rosewater toner to balance after cleansing.',
    },
    {
      step: 3,
      name: 'Vitamin C / Brightening Serum',
      category: 'Serum',
      icon: '✨',
      tip: hasDullness || hasAging
        ? 'Vitamin C serum helps with brightness and protects against UV damage. Apply before SPF.'
        : hasPores || hasAcne
        ? 'Niacinamide serum reduces sebum and minimizes pores.'
        : 'Apply your targeted serum after toning.',
      targetConcerns: hasAcne ? ['acne', 'pores'] : hasDullness ? ['dullness', 'aging'] : null,
    },
    {
      step: 4,
      name: 'Eye Cream',
      category: 'Eye Care',
      icon: '👁️',
      tip: 'Gently tap with your ring finger around the orbital bone — never rub.',
    },
    {
      step: 5,
      name: 'Moisturizer',
      category: 'Moisturizer',
      icon: '🌸',
      tip: isOily
        ? 'Choose a lightweight gel or water-cream to hydrate without greasiness.'
        : 'Use a rich cream to lock in moisture and strengthen the skin barrier.',
    },
    {
      step: 6,
      name: 'Sunscreen SPF 50+',
      category: 'SPF',
      icon: '☀️',
      tip: 'The most important step! Apply 2 fingers worth of SPF every morning, rain or shine.',
    },
  ];

  const evening = [
    {
      step: 1,
      name: 'Cleanser',
      category: 'Cleanser',
      icon: '🧼',
      tip: isOily
        ? 'Double cleanse at night: oil cleanser first, then gel/foam to remove sunscreen and pollution.'
        : 'A gentle cleanser is enough. Avoid over-cleansing dry skin.',
    },
    {
      step: 2,
      name: 'Toner',
      category: 'Toner',
      icon: '💧',
      tip: 'Exfoliating toner (AHA/BHA) can be used 2–3x per week in the PM to accelerate cell turnover.',
    },
    ...(!(isSensitive && !hasAcne)
      ? [{
          step: 3,
          name: 'Exfoliator',
          category: 'Exfoliator',
          icon: '🌀',
          tip: isOily || hasAcne
            ? 'BHA exfoliant 3x/week to keep pores clear and prevent breakouts.'
            : 'AHA 2x/week to smooth texture and boost radiance. Always follow with moisturizer.',
          frequency: '2–3x per week only',
        }]
      : []),
    {
      step: isSensitive && !hasAcne ? 3 : 4,
      name: hasAging ? 'Retinol Serum' : hasAcne ? 'Niacinamide / BHA Serum' : 'Treatment Serum',
      category: 'Serum',
      icon: '💊',
      tip: hasAging
        ? 'Start retinol at 0.3% 2–3x/week. Expect 6–8 weeks before seeing results.'
        : hasAcne
        ? 'Niacinamide calms inflammation. Use azelaic acid to target blemishes overnight.'
        : 'Apply your hydrating or targeted serum as the treatment step.',
      targetConcerns: hasAging ? ['aging'] : hasAcne ? ['acne'] : null,
    },
    {
      step: isSensitive && !hasAcne ? 4 : 5,
      name: 'Eye Cream',
      category: 'Eye Care',
      icon: '👁️',
      tip: 'Use a peptide or retinol eye cream PM for firming. Depuffing caffeine cream works AM.',
    },
    {
      step: isSensitive && !hasAcne ? 5 : 6,
      name: 'Night Moisturizer',
      category: 'Moisturizer',
      icon: '🌙',
      tip: isDry
        ? 'Use a rich barrier cream or sleeping mask overnight for deep repair.'
        : 'A lighter moisturizer is fine PM — your skin repairs itself while you sleep.',
    },
    {
      step: isSensitive && !hasAcne ? 6 : 7,
      name: 'Sleeping Mask (optional)',
      category: 'Mask',
      icon: '✨',
      tip: 'Use a hydrating sleeping mask 2–3x per week as the final seal for radiant morning skin.',
      frequency: '2–3x per week',
    },
  ];

  const skincareTips = [
    ...(hasAcne ? ['Never pick or pop pimples — it spreads bacteria and causes scarring.', 'Change pillowcases every 2–3 days.'] : []),
    ...(isOily ? ['Blot excess oil instead of washing your face more often.', 'Mattifying SPF will control shine during the day.'] : []),
    ...(isDry ? ['Apply moisturizer on slightly damp skin to lock in hydration better.', 'Drink 8 glasses of water daily.'] : []),
    ...(hasAging ? ["Start SPF early — it's the #1 anti-aging product.", 'Introduce retinol slowly (2x/week) to avoid irritation.'] : []),
    ...(isSensitive ? ['Patch test every new product on your inner arm first.', 'Avoid fragrance and essential oils in skincare.'] : []),
    'Stick to your routine for at least 4–8 weeks before judging results.',
    'Less is more — a simple routine done consistently beats 10 products used randomly.',
  ];

  return { morning, evening, skincareTips };
}

// ─── POST /api/quiz/recommend ────────────────────────────────────────────────
router.post('/recommend', authenticate, async (req, res) => {
  const { skin_type, skin_concerns, sensitivity, sun_exposure, budget, answers } = req.body;

  // Save quiz result
  await supabase.from('quiz_results').insert({
    user_id: req.user.id,
    skin_type,
    skin_concerns: skin_concerns || [],
    sensitivity,
    sun_exposure,
    budget,
    answers,
  });

  // Build product query based on skin type
  let query = supabase
    .from('products')
    .select('*, categories(id, name, icon)')
    .eq('is_active', true);

  if (skin_type) query = query.contains('skin_types', [skin_type]);

  const { data: allMatches, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Score and rank products
  const scored = allMatches.map((product) => {
    let score = 0;
    if (skin_concerns && skin_concerns.length) {
      const matches = (product.skin_concerns || []).filter(c => skin_concerns.includes(c));
      score += matches.length * 3;
    }
    if (budget === 'budget' && product.price <= 15) score += 2;
    else if (budget === 'mid-range' && product.price > 15 && product.price <= 40) score += 2;
    else if (budget === 'premium' && product.price > 40) score += 2;
    score += (product.rating || 0) * 0.5;
    return { ...product, _score: score };
  });

  const recommended = scored
    .sort((a, b) => b._score - a._score)
    .slice(0, 12);

  // Build personalized routine
  const routine = buildRoutine(skin_type, skin_concerns, sensitivity, budget);

  return res.json({ products: recommended, routine, skin_type });
});

module.exports = router;
