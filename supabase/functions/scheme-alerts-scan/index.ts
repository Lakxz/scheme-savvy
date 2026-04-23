// Daily scheme alerts scanner
// - Detects newly active schemes the user is eligible for
// - Detects upcoming deadlines (7 days) and just-expired schemes
// - Inserts notifications and emails the user via Resend (respects email_alerts pref)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Profile {
  user_id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  category: string | null;
  occupation: string | null;
  education: string | null;
  annual_income: number | null;
  disability: string | null;
  email_alerts: boolean | null;
  ration_card: string | null;
  has_aadhaar: boolean | null;
  has_bank_account: boolean | null;
  farmer_type: string | null;
  land_acres: number | null;
  religion: string | null;
  marital_status: string | null;
  is_minority: boolean | null;
  is_bpl: boolean | null;
  state: string | null;
}

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  application_url: string | null;
  application_deadline: string | null;
  created_at: string | null;
  is_active: boolean | null;
  min_age: number | null;
  max_age: number | null;
  gender: string[] | null;
  categories: string[] | null;
  occupations: string[] | null;
  education_levels: string[] | null;
  disabilities: string[] | null;
  max_income: number | null;
  ration_cards: string[] | null;
  states: string[] | null;
  farmer_types: string[] | null;
  marital_statuses: string[] | null;
  religions: string[] | null;
  max_land_acres: number | null;
  bpl_only: boolean | null;
  minority_only: boolean | null;
  requires_aadhaar: boolean | null;
  requires_bank_account: boolean | null;
}

// Lightweight eligibility check — returns true if profile passes ALL declared criteria
function isEligible(profile: Profile, scheme: Scheme): boolean {
  if (scheme.min_age !== null && (profile.age ?? -1) < scheme.min_age) return false;
  if (scheme.max_age !== null && profile.age !== null && profile.age > scheme.max_age) return false;
  if (scheme.gender?.length && profile.gender && !scheme.gender.includes(profile.gender)) return false;
  if (scheme.categories?.length && profile.category && !scheme.categories.includes(profile.category)) return false;
  if (scheme.occupations?.length && profile.occupation && !scheme.occupations.includes(profile.occupation)) return false;
  if (scheme.education_levels?.length && profile.education && !scheme.education_levels.includes(profile.education)) return false;
  if (scheme.disabilities?.length && profile.disability && !scheme.disabilities.includes(profile.disability)) return false;
  if (scheme.max_income !== null && (profile.annual_income ?? 0) > scheme.max_income) return false;
  if (scheme.ration_cards?.length && profile.ration_card && !scheme.ration_cards.includes(profile.ration_card)) return false;
  if (scheme.states?.length && profile.state && !scheme.states.includes(profile.state)) return false;
  if (scheme.farmer_types?.length && profile.farmer_type && !scheme.farmer_types.includes(profile.farmer_type)) return false;
  if (scheme.marital_statuses?.length && profile.marital_status && !scheme.marital_statuses.includes(profile.marital_status)) return false;
  if (scheme.religions?.length && profile.religion && !scheme.religions.includes(profile.religion)) return false;
  if (scheme.max_land_acres !== null && (profile.land_acres ?? 0) > scheme.max_land_acres) return false;
  if (scheme.bpl_only && !profile.is_bpl) return false;
  if (scheme.minority_only && !profile.is_minority) return false;
  if (scheme.requires_aadhaar && !profile.has_aadhaar) return false;
  if (scheme.requires_bank_account && !profile.has_bank_account) return false;
  return true;
}

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

async function sendEmail(
  to: string,
  name: string | null,
  alerts: { title: string; message: string; type: string }[]
): Promise<void> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY || alerts.length === 0) return;

  const greeting = name ? `Hi ${name},` : "Hi,";
  const items = alerts
    .map((a) => {
      const color =
        a.type === "urgent" ? "#dc2626" : a.type === "warning" ? "#d97706" : "#2563eb";
      return `<div style="border-left:4px solid ${color};padding:12px 16px;margin:12px 0;background:#f9fafb;border-radius:4px;">
        <div style="font-weight:600;color:#111827;font-size:15px;margin-bottom:4px;">${a.title}</div>
        <div style="color:#4b5563;font-size:14px;line-height:1.5;">${a.message}</div>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <h1 style="color:#111827;font-size:22px;margin:0 0 8px;">Scheme Alerts</h1>
      <p style="color:#6b7280;margin:0 0 20px;font-size:14px;">${greeting} you have ${alerts.length} new update${alerts.length > 1 ? "s" : ""} on government schemes.</p>
      ${items}
      <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
        You're receiving this because email alerts are enabled. Manage preferences in your profile.
      </p>
    </div></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Scheme Alerts <onboarding@resend.dev>",
      to: [to],
      subject: `${alerts.length} new scheme alert${alerts.length > 1 ? "s" : ""}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let body: any = {};
    try { body = await req.json(); } catch { /* cron has empty body */ }
    const targetUserId: string | undefined = body?.user_id;

    // Load profiles (single user if specified, else all)
    let profileQuery = supabase.from("profiles").select("*");
    if (targetUserId) profileQuery = profileQuery.eq("user_id", targetUserId);
    const { data: profiles, error: pErr } = await profileQuery;
    if (pErr) throw pErr;

    // Load all active schemes
    const { data: schemes, error: sErr } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true);
    if (sErr) throw sErr;

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let totalInserted = 0;
    let totalEmails = 0;

    for (const profile of (profiles ?? []) as Profile[]) {
      // Get user email from auth
      const { data: userRes } = await supabase.auth.admin.getUserById(profile.user_id);
      const email = userRes?.user?.email ?? null;

      // Get already-notified scheme ids to avoid duplicates
      const { data: existingNotifs } = await supabase
        .from("notifications")
        .select("scheme_id, type")
        .eq("user_id", profile.user_id);
      const sentKeys = new Set(
        (existingNotifs ?? []).map((n: any) => `${n.scheme_id}:${n.type}`)
      );

      const alertsToInsert: any[] = [];
      const emailAlerts: { title: string; message: string; type: string }[] = [];

      for (const scheme of (schemes ?? []) as Scheme[]) {
        if (!isEligible(profile, scheme)) continue;

        // 1) Newly opened schemes (created in last 24h)
        const createdAt = scheme.created_at ? new Date(scheme.created_at) : null;
        if (createdAt && createdAt >= yesterday) {
          const key = `${scheme.id}:new`;
          if (!sentKeys.has(key)) {
            const a = {
              user_id: profile.user_id,
              scheme_id: scheme.id,
              type: "new",
              title: `New scheme: ${scheme.name}`,
              message: `You're eligible for this newly opened ${scheme.ministry} scheme.`,
            };
            alertsToInsert.push(a);
            emailAlerts.push({ title: a.title, message: a.message, type: "info" });
          }
        }

        // 2) Deadline-based alerts
        if (scheme.application_deadline) {
          const days = daysBetween(scheme.application_deadline);

          if (days >= 0 && days <= 7) {
            const key = `${scheme.id}:urgent`;
            if (!sentKeys.has(key)) {
              const a = {
                user_id: profile.user_id,
                scheme_id: scheme.id,
                type: "urgent",
                title: `Deadline in ${days} day${days === 1 ? "" : "s"}: ${scheme.name}`,
                message: `Application closes on ${scheme.application_deadline}. Apply soon.`,
              };
              alertsToInsert.push(a);
              emailAlerts.push({ title: a.title, message: a.message, type: "urgent" });
            }
          } else if (days < 0 && days >= -1) {
            // Just expired (within last day)
            const key = `${scheme.id}:expired`;
            if (!sentKeys.has(key)) {
              const a = {
                user_id: profile.user_id,
                scheme_id: scheme.id,
                type: "warning",
                title: `Expired: ${scheme.name}`,
                message: `The application deadline (${scheme.application_deadline}) has passed.`,
              };
              alertsToInsert.push(a);
              emailAlerts.push({ title: a.title, message: a.message, type: "warning" });
            }
          }
        }
      }

      if (alertsToInsert.length > 0) {
        const { error: insErr } = await supabase.from("notifications").insert(alertsToInsert);
        if (insErr) {
          console.error("Insert error for user", profile.user_id, insErr);
        } else {
          totalInserted += alertsToInsert.length;
        }

        // Send email if user opted in
        if (profile.email_alerts !== false && email) {
          await sendEmail(email, profile.full_name, emailAlerts);
          totalEmails++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        users_scanned: profiles?.length ?? 0,
        notifications_inserted: totalInserted,
        emails_sent: totalEmails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error("scheme-alerts-scan error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
