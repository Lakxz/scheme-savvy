import { Profile, Scheme, EligibilityResult, EligibilityItem } from '@/types/database';

export function calculateEligibility(profile: Partial<Profile>, scheme: Scheme): EligibilityResult {
  const reasons: string[] = [];
  const missingCriteria: string[] = [];
  const reasonItems: EligibilityItem[] = [];
  const missingItems: EligibilityItem[] = [];
  let matchScore = 0;
  let totalCriteria = 0;

  const addReason = (text: string, code: string, params?: Record<string, string | number>) => {
    reasons.push(text);
    reasonItems.push({ code, params });
  };
  const addMissing = (text: string, code: string, params?: Record<string, string | number>) => {
    missingCriteria.push(text);
    missingItems.push({ code, params });
  };

  // Age check
  if (scheme.min_age !== null || scheme.max_age !== null) {
    totalCriteria++;
    const minAge = scheme.min_age ?? 0;
    const maxAge = scheme.max_age ?? 150;
    if (profile.age !== null && profile.age !== undefined) {
      if (profile.age >= minAge && profile.age <= maxAge) {
        matchScore++;
        addReason(`Age ${profile.age} is within eligible range (${minAge}-${maxAge} years)`, 'reason.ageOk', { age: profile.age, min: minAge, max: maxAge });
      } else {
        addMissing(`Age must be between ${minAge} and ${maxAge} years`, 'missing.ageRange', { min: minAge, max: maxAge });
      }
    } else {
      addMissing('Age information required', 'missing.ageRequired');
    }
  }

  // Gender
  if (scheme.gender && scheme.gender.length > 0) {
    totalCriteria++;
    if (profile.gender) {
      if (scheme.gender.includes(profile.gender)) {
        matchScore++;
        addReason(`Gender (${profile.gender}) is eligible`, 'reason.genderOk', { value: profile.gender });
      } else {
        addMissing(`This scheme is for ${scheme.gender.join('/')} only`, 'missing.genderOnly', { values: scheme.gender.join('/') });
      }
    } else {
      addMissing('Gender information required', 'missing.genderRequired');
    }
  }

  // Category
  if (scheme.categories && scheme.categories.length > 0) {
    totalCriteria++;
    if (profile.category) {
      if (scheme.categories.includes(profile.category)) {
        matchScore++;
        addReason(`Category (${profile.category.toUpperCase()}) is eligible`, 'reason.categoryOk', { value: profile.category });
      } else {
        addMissing(`This scheme is for ${scheme.categories.map(c => c.toUpperCase()).join('/')} categories`, 'missing.categoryOnly', { values: scheme.categories.join('/') });
      }
    } else {
      addMissing('Category information required', 'missing.categoryRequired');
    }
  }

  // Occupation
  if (scheme.occupations && scheme.occupations.length > 0) {
    totalCriteria++;
    if (profile.occupation) {
      if (scheme.occupations.includes(profile.occupation)) {
        matchScore++;
        addReason(`Occupation (${profile.occupation.replace('_', ' ')}) is eligible`, 'reason.occupationOk', { value: profile.occupation });
      } else {
        addMissing(`This scheme requires occupation: ${scheme.occupations.join(', ')}`, 'missing.occupationOnly', { values: scheme.occupations.join(',') });
      }
    } else {
      addMissing('Occupation information required', 'missing.occupationRequired');
    }
  }

  // Education
  if (scheme.education_levels && scheme.education_levels.length > 0) {
    totalCriteria++;
    if (profile.education) {
      if (scheme.education_levels.includes(profile.education)) {
        matchScore++;
        addReason(`Education level (${profile.education.replace('_', ' ')}) is eligible`, 'reason.educationOk', { value: profile.education });
      } else {
        addMissing(`This scheme requires education: ${scheme.education_levels.join(', ')}`, 'missing.educationOnly', { values: scheme.education_levels.join(',') });
      }
    } else {
      addMissing('Education information required', 'missing.educationRequired');
    }
  }

  // Disability
  if (scheme.disabilities && scheme.disabilities.length > 0) {
    totalCriteria++;
    if (profile.disability && profile.disability !== 'none') {
      if (scheme.disabilities.includes(profile.disability)) {
        matchScore++;
        addReason('Disability status qualifies for this scheme', 'reason.disabilityOk');
      } else {
        addMissing(`This scheme is for ${scheme.disabilities.join('/')} disabilities`, 'missing.disabilityOnly', { values: scheme.disabilities.join('/') });
      }
    } else {
      addMissing('This scheme requires disability status', 'missing.disabilityRequired');
    }
  }

  // Income
  if (scheme.max_income !== null) {
    totalCriteria++;
    if (profile.annual_income !== undefined) {
      if (profile.annual_income <= scheme.max_income) {
        matchScore++;
        addReason(`Annual income ₹${profile.annual_income.toLocaleString()} is within limit (₹${scheme.max_income.toLocaleString()})`, 'reason.incomeOk', { income: profile.annual_income, max: scheme.max_income });
      } else {
        addMissing(`Annual income must be below ₹${scheme.max_income.toLocaleString()}`, 'missing.incomeOver', { max: scheme.max_income });
      }
    } else {
      addMissing('Income information required', 'missing.incomeRequired');
    }
  }

  // State
  if (scheme.states && scheme.states.length > 0) {
    totalCriteria++;
    if (profile.state) {
      if (scheme.states.includes(profile.state)) {
        matchScore++;
        addReason(`Resident of ${profile.state} is eligible`, 'reason.stateOk', { value: profile.state });
      } else {
        addMissing(`This scheme is for ${scheme.states.join(', ')} residents only`, 'missing.stateOnly', { values: scheme.states.join(', ') });
      }
    } else {
      addMissing('State information required', 'missing.stateRequired');
    }
  }

  // BPL
  if (scheme.bpl_only) {
    totalCriteria++;
    if (profile.is_bpl) { matchScore++; addReason('BPL status qualifies for this scheme', 'reason.bplOk'); }
    else addMissing('This scheme is for BPL families only', 'missing.bplOnly');
  }

  // Minority
  if (scheme.minority_only) {
    totalCriteria++;
    if (profile.is_minority) { matchScore++; addReason('Minority status qualifies for this scheme', 'reason.minorityOk'); }
    else addMissing('This scheme is for minority communities only', 'missing.minorityOnly');
  }

  // Marital status
  if (scheme.marital_statuses && scheme.marital_statuses.length > 0) {
    totalCriteria++;
    if (profile.marital_status) {
      if (scheme.marital_statuses.includes(profile.marital_status)) {
        matchScore++;
        addReason(`Marital status (${profile.marital_status}) qualifies`, 'reason.maritalOk', { value: profile.marital_status });
      } else {
        addMissing(`This scheme requires marital status: ${scheme.marital_statuses.join('/')}`, 'missing.maritalOnly', { values: scheme.marital_statuses.join('/') });
      }
    } else {
      addMissing('Marital status required', 'missing.maritalRequired');
    }
  }

  // Religion
  if (scheme.religions && scheme.religions.length > 0) {
    totalCriteria++;
    if (profile.religion) {
      if (scheme.religions.includes(profile.religion)) {
        matchScore++;
        addReason(`Religion (${profile.religion}) qualifies`, 'reason.religionOk', { value: profile.religion });
      } else {
        addMissing(`This scheme is for ${scheme.religions.join('/')} only`, 'missing.religionOnly', { values: scheme.religions.join('/') });
      }
    } else {
      addMissing('Religion information required', 'missing.religionRequired');
    }
  }

  // Farmer type
  if (scheme.farmer_types && scheme.farmer_types.length > 0) {
    totalCriteria++;
    if (profile.farmer_type) {
      if (scheme.farmer_types.includes(profile.farmer_type)) {
        matchScore++;
        addReason(`Farmer type (${profile.farmer_type}) qualifies`, 'reason.farmerOk', { value: profile.farmer_type });
      } else {
        addMissing(`This scheme is for ${scheme.farmer_types.join('/')} farmers`, 'missing.farmerOnly', { values: scheme.farmer_types.join('/') });
      }
    } else {
      addMissing('Farmer type required', 'missing.farmerRequired');
    }
  }

  // Max land acres
  if (scheme.max_land_acres !== null && scheme.max_land_acres !== undefined) {
    totalCriteria++;
    if (profile.land_acres !== undefined && profile.land_acres !== null) {
      if (profile.land_acres <= scheme.max_land_acres) {
        matchScore++;
        addReason(`Land ownership (${profile.land_acres} acres) is within limit`, 'reason.landOk', { acres: profile.land_acres, max: scheme.max_land_acres });
      } else {
        addMissing(`Land ownership must be ≤ ${scheme.max_land_acres} acres`, 'missing.landOver', { max: scheme.max_land_acres });
      }
    } else {
      addMissing('Land ownership information required', 'missing.landRequired');
    }
  }

  // Bank account
  if (scheme.requires_bank_account) {
    totalCriteria++;
    if (profile.has_bank_account) { matchScore++; addReason('Bank account available', 'reason.bankOk'); }
    else addMissing('Bank account required for DBT', 'missing.bankRequired');
  }

  // Aadhaar
  if (scheme.requires_aadhaar) {
    totalCriteria++;
    if (profile.has_aadhaar) { matchScore++; addReason('Aadhaar available', 'reason.aadhaarOk'); }
    else addMissing('Aadhaar card required', 'missing.aadhaarRequired');
  }

  // Ration card
  if (scheme.ration_cards && scheme.ration_cards.length > 0) {
    totalCriteria++;
    if (profile.ration_card && profile.ration_card !== 'none') {
      if (scheme.ration_cards.includes(profile.ration_card)) {
        matchScore++;
        addReason(`Ration card (${profile.ration_card.toUpperCase()}) qualifies`, 'reason.rationOk', { value: profile.ration_card });
      } else {
        addMissing(`Requires ration card: ${scheme.ration_cards.join('/').toUpperCase()}`, 'missing.rationOnly', { values: scheme.ration_cards.join('/') });
      }
    } else {
      addMissing('Specific ration card required', 'missing.rationRequired');
    }
  }

  const confidenceScore = totalCriteria > 0 ? Math.round((matchScore / totalCriteria) * 100) : 100;
  const isEligible = missingCriteria.length === 0 && confidenceScore >= 50;

  return { scheme, isEligible, confidenceScore, reasons, missingCriteria, reasonItems, missingItems };
}

export function getDaysUntilExpiry(deadline: string | null): number | null {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(days: number | null): 'expired' | 'urgent' | 'warning' | 'safe' | 'no-deadline' {
  if (days === null) return 'no-deadline';
  if (days < 0) return 'expired';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warning';
  return 'safe';
}
