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

    // Check how many schemes already exist
    const { count } = await supabase
      .from("schemes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const existingCount = count || 0;

    const prompt = `Generate a JSON array of 20 real Indian government scholarships and welfare schemes that are currently active or recently announced. For each scheme, provide accurate details in this exact JSON format:

[
  {
    "name": "Scheme Name",
    "description": "2-3 sentence description of the scheme",
    "ministry": "Ministry/Department name",
    "benefits": "What beneficiaries receive (amount, services, etc.)",
    "documents_required": ["Aadhaar Card", "Income Certificate", "etc"],
    "application_url": "https://official-website.gov.in",
    "application_deadline": "2026-06-30",
    "min_age": 18,
    "max_age": 35,
    "gender": ["male", "female", "other"],
    "categories": ["general", "obc", "sc", "st", "ews"],
    "occupations": ["student"],
    "education_levels": ["graduate", "postgraduate"],
    "disabilities": ["none"],
    "max_income": 250000,
    "states": null,
    "bpl_only": false,
    "minority_only": false
  }
]

Important rules:
- Use ONLY these gender values: "male", "female", "other"
- Use ONLY these category values: "general", "obc", "sc", "st", "ews"
- Use ONLY these occupation values: "student", "employed", "self_employed", "unemployed", "farmer", "retired", "homemaker"
- Use ONLY these education values: "none", "primary", "secondary", "higher_secondary", "graduate", "postgraduate", "doctorate"
- Use ONLY these disability values: "none", "visual", "hearing", "locomotor", "mental", "multiple"
- Set states to null for pan-India schemes, or use an array of state names for state-specific ones
- Set application_deadline to realistic future dates in 2026
- Include a diverse mix: scholarships for students, farmer schemes, women empowerment, disability benefits, skill development, housing, health insurance, pension schemes
- Use real scheme names like PM Kisan, Ayushman Bharat, NSP scholarships, PMEGP, etc.
- max_income should be a number (annual income in INR) or null
- Return ONLY the JSON array, no other text`;

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
                "You are a database of Indian government schemes and scholarships. Return only valid JSON arrays with accurate scheme data. No markdown, no code blocks, just raw JSON.",
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

    // Parse JSON from the response - handle markdown code blocks
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

    // Insert schemes into database
    const schemesToInsert = schemes.map((s: any) => ({
      name: s.name,
      description: s.description,
      ministry: s.ministry,
      benefits: s.benefits,
      documents_required: s.documents_required,
      application_url: s.application_url,
      application_deadline: s.application_deadline,
      min_age: s.min_age,
      max_age: s.max_age,
      gender: s.gender,
      categories: s.categories,
      occupations: s.occupations,
      education_levels: s.education_levels,
      disabilities: s.disabilities,
      max_income: s.max_income,
      states: s.states,
      bpl_only: s.bpl_only || false,
      minority_only: s.minority_only || false,
      is_active: true,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("schemes")
      .insert(schemesToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to insert schemes: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched and stored ${inserted?.length || 0} schemes`,
        count: inserted?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-schemes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
