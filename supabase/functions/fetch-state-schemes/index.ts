import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const prompt = `Generate a JSON array of 25 real STATE GOVERNMENT schemes from various Indian states (Tamil Nadu, Karnataka, Kerala, Maharashtra, Gujarat, Rajasthan, Andhra Pradesh, Telangana, West Bengal, Punjab, Uttar Pradesh, Bihar, Odisha, Madhya Pradesh, etc.). Cover scholarships, farmer welfare, women empowerment, housing, health, pension, and skill schemes. Return strict JSON in this exact format:

[
  {
    "name": "Scheme Name",
    "description": "2-3 sentence description",
    "ministry": "State Department / Ministry name (include state name)",
    "benefits": "What beneficiaries receive",
    "documents_required": ["Aadhaar Card", "Income Certificate"],
    "application_url": "https://official-state-portal.gov.in",
    "application_deadline": "2026-08-30",
    "min_age": 18,
    "max_age": 35,
    "gender": ["male", "female", "other"],
    "categories": ["general", "obc", "sc", "st", "ews"],
    "occupations": ["student"],
    "education_levels": ["graduate"],
    "disabilities": ["none"],
    "max_income": 250000,
    "states": ["Tamil Nadu"],
    "bpl_only": false,
    "minority_only": false
  }
]

STRICT RULES:
- Every scheme MUST have a non-empty "states" array with at least one Indian state name (since these are state schemes).
- Use ONLY these gender values: "male", "female", "other"
- Use ONLY these category values: "general", "obc", "sc", "st", "ews"
- Use ONLY these occupation values: "student", "employed", "self_employed", "unemployed", "farmer", "retired", "homemaker"
- Use ONLY these education values: "none", "primary", "secondary", "higher_secondary", "graduate", "postgraduate", "doctorate"
- Use ONLY these disability values: "none", "visual", "hearing", "locomotor", "mental", "multiple"
- application_deadline must be a future date in 2026
- Use real schemes like Tamil Nadu Pudhumai Penn, Kalaignar Magalir Urimai Thogai, Karnataka Gruha Lakshmi, Kerala Snehapoorvam, Mahatma Jyotirao Phule Jan Arogya Yojana, Mukhyamantri Ladli Behna, etc.
- Cover at least 10 different states
- Return ONLY the JSON array, no markdown, no extra text.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a database of Indian STATE government schemes. Return only valid JSON arrays with accurate state-specific scheme data. No markdown, no code blocks.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required for AI usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let schemes;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      schemes = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse scheme data from AI");
    }

    if (!Array.isArray(schemes) || schemes.length === 0) {
      throw new Error("AI returned invalid scheme data");
    }

    // Allowed enum values — drop anything else to avoid Postgres enum errors
    const ALLOWED_GENDER = new Set(["male", "female", "other"]);
    const ALLOWED_CATEGORY = new Set(["general", "obc", "sc", "st", "ews"]);
    const ALLOWED_OCCUPATION = new Set([
      "student", "employed", "self_employed", "unemployed", "farmer", "retired", "homemaker",
    ]);
    const ALLOWED_EDUCATION = new Set([
      "none", "primary", "secondary", "higher_secondary", "graduate", "postgraduate", "doctorate",
    ]);
    const ALLOWED_DISABILITY = new Set([
      "none", "visual", "hearing", "locomotor", "mental", "multiple",
    ]);

    const cleanArr = (arr: any, allowed: Set<string>): string[] | null => {
      if (!Array.isArray(arr)) return null;
      const filtered = arr
        .map((v) => (typeof v === "string" ? v.toLowerCase().trim() : ""))
        .filter((v) => allowed.has(v));
      return filtered.length > 0 ? filtered : null;
    };

    const schemesToInsert = schemes.map((s: any) => ({
      name: s.name,
      description: s.description,
      ministry: s.ministry,
      benefits: s.benefits,
      documents_required: Array.isArray(s.documents_required) ? s.documents_required : null,
      application_url: s.application_url,
      application_deadline: s.application_deadline,
      min_age: s.min_age,
      max_age: s.max_age,
      gender: cleanArr(s.gender, ALLOWED_GENDER),
      categories: cleanArr(s.categories, ALLOWED_CATEGORY),
      occupations: cleanArr(s.occupations, ALLOWED_OCCUPATION),
      education_levels: cleanArr(s.education_levels, ALLOWED_EDUCATION),
      disabilities: cleanArr(s.disabilities, ALLOWED_DISABILITY),
      max_income: s.max_income,
      states: Array.isArray(s.states) && s.states.length > 0 ? s.states : null,
      bpl_only: s.bpl_only || false,
      minority_only: s.minority_only || false,
      is_active: true,
      scheme_level: "state",
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("schemes")
      .insert(schemesToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to insert state schemes: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched ${inserted?.length || 0} state schemes`,
        count: inserted?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-state-schemes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
