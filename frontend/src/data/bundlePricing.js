// Same illustrative bundle pricing table as the original static site
// (not backend-modeled — the real order total is always computed
// server-side from the product's real price × quantity).
export const BUNDLE_PRICING = {
  'Metal Case': { 1: 349, 2: 569, 3: 799, 4: 999 },
  'Glass Case': { 1: 399, 2: 599, 3: 859, 4: 1159 },
};

export const getBundlePrice = (caseType, quantity) => {
  const qty = Math.min(quantity, 4);
  return BUNDLE_PRICING[caseType][qty] || BUNDLE_PRICING[caseType][1] * quantity;
};

export const getRegularPrice = (caseType, quantity) => {
  const singlePrice = caseType === 'Metal Case' ? 349 : 399;
  return singlePrice * quantity;
};

export const getSavings = (caseType, quantity) => getRegularPrice(caseType, quantity) - getBundlePrice(caseType, quantity);
