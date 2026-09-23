import { LunchItem, LunchLevel } from './types';

// Normalized string helper to avoid character encoding mismatches
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Common staples that appear daily across all or specific levels
const GLOBAL_STAPLES = [
  'skim chocolate milk',
  '1 white milk',
  'white milk',
  'chocolate milk',
  'milk',
  'leafy green salad',
  'fresh vegetable variety',
  'fresh fruit variety',
];

const ES_STAPLES = [
  'soy butter alt entree',
  'bagel alt entree',
  'yogurt string cheese goldfish alt entree',
  'yogurt string cheese goldfish',
];

const MS_STAPLES = [
  'vegan nugget wrap meal',
  'crispy chicken wrap meal',
  'spicy crispy chicken wrap meal',
  'club wrap meal',
  'protein snack bag meal',
  'protein snack bag',
  'bagel alt entree',
];

const HS_STAPLES = [
  'big daddy cheese pizza',
  'big daddy pepperoni pizza',
  'gourmet salad variety',
  'turkey cheese sub meal',
  'turkey and cheese sub meal',
  'crispy chicken wrap meal',
  'club wrap meal',
  'vegan nugget wrap meal',
];

export function isStapleItem(name: string, level: LunchLevel): boolean {
  const norm = normalizeName(name);

  // Check global staples (milk, generic salad/fruit)
  if (GLOBAL_STAPLES.some(s => norm.includes(s) || s.includes(norm))) {
    return true;
  }

  // Level-specific staple checks
  if (level === 'ES') {
    return ES_STAPLES.some(s => norm.includes(s) || s.includes(norm));
  } else if (level === 'MS') {
    return MS_STAPLES.some(s => norm.includes(s) || s.includes(norm));
  } else if (level === 'HS') {
    return HS_STAPLES.some(s => norm.includes(s) || s.includes(norm));
  }

  return false;
}

export function categorizeItem(name: string, rawCategory?: string): 'entree' | 'side' | 'treat' | 'other' {
  const norm = normalizeName(name);
  const cat = (rawCategory || '').toLowerCase();

  // Treats and special sweets
  const treats = ['frozen yogurt', 'sorbet', 'cookie', 'slushie', 'oreo', 'ice cream'];
  if (treats.some(t => norm.includes(t))) {
    return 'treat';
  }

  if (cat.includes('entree') || cat.includes('lunch entree')) {
    return 'entree';
  }

  if (cat.includes('vegetable') || cat.includes('fruit') || cat.includes('grain')) {
    return 'side';
  }

  return 'other';
}
