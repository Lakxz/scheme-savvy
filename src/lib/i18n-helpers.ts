import { translations, TranslationKey } from '@/lib/translations';
import { EligibilityItem } from '@/types/database';
import type { Language } from '@/contexts/LanguageContext';

function tStatic(key: string, language: Language): string {
  const entry = (translations as Record<string, { en: string; ta: string }>)[key];
  if (!entry) return key;
  return entry[language] || entry.en || key;
}

function fillTemplate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = params[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

// Translate a single enum value (e.g. gender 'male' -> 'ஆண்'). Falls back to raw value.
export function translateEnum(group: 'gender' | 'category' | 'occupation' | 'education' | 'disability', value: string, language: Language): string {
  const key = `enum.${group}.${value.toLowerCase()}`;
  const entry = (translations as Record<string, { en: string; ta: string }>)[key];
  if (!entry) return value;
  return entry[language] || entry.en || value;
}

export function translateEnumList(group: 'gender' | 'category' | 'occupation' | 'education' | 'disability', values: string[], language: Language, sep = ', '): string {
  return values.map((v) => translateEnum(group, v, language)).join(sep);
}

// Translate an eligibility reason / missing item
export function translateEligibilityItem(item: EligibilityItem, language: Language): string {
  // Pre-translate enum-like params before substituting
  const params = { ...(item.params || {}) } as Record<string, string | number>;

  const enumGroupForCode: Record<string, 'gender' | 'category' | 'occupation' | 'education' | 'disability' | undefined> = {
    'reason.genderOk': 'gender',
    'missing.genderOnly': 'gender',
    'reason.categoryOk': 'category',
    'missing.categoryOnly': 'category',
    'reason.occupationOk': 'occupation',
    'missing.occupationOnly': 'occupation',
    'reason.educationOk': 'education',
    'missing.educationOnly': 'education',
    'missing.disabilityOnly': 'disability',
  };

  const group = enumGroupForCode[item.code];
  if (group) {
    if (typeof params.value === 'string') {
      params.value = translateEnum(group, params.value, language);
    }
    if (typeof params.values === 'string') {
      const sep = params.values.includes('/') ? '/' : ',';
      const list = params.values.split(sep).map((v) => v.trim()).filter(Boolean);
      params.values = translateEnumList(group, list, language, sep === '/' ? '/' : ', ');
    }
  }

  // Format numbers with locale
  if (typeof params.income === 'number') params.income = params.income.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN');
  if (typeof params.max === 'number' && (item.code === 'reason.incomeOk' || item.code === 'missing.incomeOver')) {
    params.max = params.max.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN');
  }

  const template = tStatic(item.code, language);
  return fillTemplate(template, params);
}

// Translate a free-form document name by best-effort lookup.
export function translateDocument(name: string, language: Language): string {
  const key = `doc.${name.toLowerCase().trim()}`;
  const entry = (translations as Record<string, { en: string; ta: string }>)[key];
  if (entry) return entry[language] || entry.en || name;
  return name;
}
