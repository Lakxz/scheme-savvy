import { Profile, Scheme, EligibilityResult } from '@/types/database';

export function calculateEligibility(profile: Partial<Profile>, scheme: Scheme): EligibilityResult {
  const reasons: string[] = [];
  const missingCriteria: string[] = [];
  let matchScore = 0;
  let totalCriteria = 0;

  // Age check
  if (scheme.min_age !== null || scheme.max_age !== null) {
    totalCriteria++;
    if (profile.age !== null && profile.age !== undefined) {
      const minAge = scheme.min_age ?? 0;
      const maxAge = scheme.max_age ?? 150;
      if (profile.age >= minAge && profile.age <= maxAge) {
        matchScore++;
        reasons.push(`Age ${profile.age} is within eligible range (${minAge}-${maxAge} years)`);
      } else {
        missingCriteria.push(`Age must be between ${minAge} and ${maxAge} years`);
      }
    } else {
      missingCriteria.push('Age information required');
    }
  }

  // Gender check
  if (scheme.gender && scheme.gender.length > 0) {
    totalCriteria++;
    if (profile.gender) {
      if (scheme.gender.includes(profile.gender)) {
        matchScore++;
        reasons.push(`Gender (${profile.gender}) is eligible`);
      } else {
        missingCriteria.push(`This scheme is for ${scheme.gender.join('/')} only`);
      }
    } else {
      missingCriteria.push('Gender information required');
    }
  }

  // Category check
  if (scheme.categories && scheme.categories.length > 0) {
    totalCriteria++;
    if (profile.category) {
      if (scheme.categories.includes(profile.category)) {
        matchScore++;
        reasons.push(`Category (${profile.category.toUpperCase()}) is eligible`);
      } else {
        missingCriteria.push(`This scheme is for ${scheme.categories.map(c => c.toUpperCase()).join('/')} categories`);
      }
    } else {
      missingCriteria.push('Category information required');
    }
  }

  // Occupation check
  if (scheme.occupations && scheme.occupations.length > 0) {
    totalCriteria++;
    if (profile.occupation) {
      if (scheme.occupations.includes(profile.occupation)) {
        matchScore++;
        reasons.push(`Occupation (${profile.occupation.replace('_', ' ')}) is eligible`);
      } else {
        missingCriteria.push(`This scheme requires occupation: ${scheme.occupations.join(', ')}`);
      }
    } else {
      missingCriteria.push('Occupation information required');
    }
  }

  // Education check
  if (scheme.education_levels && scheme.education_levels.length > 0) {
    totalCriteria++;
    if (profile.education) {
      if (scheme.education_levels.includes(profile.education)) {
        matchScore++;
        reasons.push(`Education level (${profile.education.replace('_', ' ')}) is eligible`);
      } else {
        missingCriteria.push(`This scheme requires education: ${scheme.education_levels.join(', ')}`);
      }
    } else {
      missingCriteria.push('Education information required');
    }
  }

  // Disability check
  if (scheme.disabilities && scheme.disabilities.length > 0) {
    totalCriteria++;
    if (profile.disability && profile.disability !== 'none') {
      if (scheme.disabilities.includes(profile.disability)) {
        matchScore++;
        reasons.push(`Disability status qualifies for this scheme`);
      } else {
        missingCriteria.push(`This scheme is for ${scheme.disabilities.join('/')} disabilities`);
      }
    } else {
      missingCriteria.push('This scheme requires disability status');
    }
  }

  // Income check
  if (scheme.max_income !== null) {
    totalCriteria++;
    if (profile.annual_income !== undefined) {
      if (profile.annual_income <= scheme.max_income) {
        matchScore++;
        reasons.push(`Annual income ₹${profile.annual_income.toLocaleString()} is within limit (₹${scheme.max_income.toLocaleString()})`);
      } else {
        missingCriteria.push(`Annual income must be below ₹${scheme.max_income.toLocaleString()}`);
      }
    } else {
      missingCriteria.push('Income information required');
    }
  }

  // State check
  if (scheme.states && scheme.states.length > 0) {
    totalCriteria++;
    if (profile.state) {
      if (scheme.states.includes(profile.state)) {
        matchScore++;
        reasons.push(`Resident of ${profile.state} is eligible`);
      } else {
        missingCriteria.push(`This scheme is for ${scheme.states.join(', ')} residents only`);
      }
    } else {
      missingCriteria.push('State information required');
    }
  }

  // BPL check
  if (scheme.bpl_only) {
    totalCriteria++;
    if (profile.is_bpl) {
      matchScore++;
      reasons.push('BPL status qualifies for this scheme');
    } else {
      missingCriteria.push('This scheme is for BPL families only');
    }
  }

  // Minority check
  if (scheme.minority_only) {
    totalCriteria++;
    if (profile.is_minority) {
      matchScore++;
      reasons.push('Minority status qualifies for this scheme');
    } else {
      missingCriteria.push('This scheme is for minority communities only');
    }
  }

  const confidenceScore = totalCriteria > 0 ? Math.round((matchScore / totalCriteria) * 100) : 100;
  const isEligible = missingCriteria.length === 0 && confidenceScore >= 50;

  return {
    scheme,
    isEligible,
    confidenceScore,
    reasons,
    missingCriteria,
  };
}

export function getDaysUntilExpiry(deadline: string | null): number | null {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryStatus(days: number | null): 'expired' | 'urgent' | 'warning' | 'safe' | 'no-deadline' {
  if (days === null) return 'no-deadline';
  if (days < 0) return 'expired';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warning';
  return 'safe';
}
