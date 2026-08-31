import { NextRequest, NextResponse } from 'next/server';
import { ExplainRequestPayload, NarratorSummary } from '@/lib/types';
import {
  COMMITGUARD_NARRATOR_SYSTEM_PROMPT,
  generateDeterministicFallbackSummary,
  validateAntiAdvisoryGuardrail,
} from '@/lib/llm-guardrail';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let payload: ExplainRequestPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 1. Check if Gemini API key exists
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // 2. If no key, return high-speed deterministic fallback immediately (<2ms)
  if (!apiKey) {
    const fallback = generateDeterministicFallbackSummary(payload);
    return NextResponse.json(fallback);
  }

  // 3. Call Gemini with strict timeout (1800ms) to guarantee <2s latency
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const promptText = `
Translate this calculated transaction payload into the strict 3-bullet schema:
Transaction Type: ${payload.commitmentType}
Instrument/Product: ${payload.productOrInstrumentName}
Principal / Cart Price: ₹${payload.principalOrPrice}
Tenure: ${payload.tenureMonths} Months
Computed Math Truth: ${JSON.stringify(payload.computedMetrics, null, 2)}
Active Macro Alerts: ${JSON.stringify(payload.policyAlerts.map(a => a.headline))}
Goal Conflict: ${payload.goalConflict?.warningMessage || 'None'}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: COMMITGUARD_NARRATOR_SYSTEM_PROMPT }],
          },
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fallback on HTTP error
      const fallback = generateDeterministicFallbackSummary(payload);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      const fallback = generateDeterministicFallbackSummary(payload);
      return NextResponse.json(fallback);
    }

    const parsed = JSON.parse(contentText);

    // Validate anti-advisory guardrails
    const combined = `${parsed.bullet_1_hidden_friction} ${parsed.bullet_2_liquidity_horizon} ${parsed.bullet_3_neutral_baseline}`;
    if (!validateAntiAdvisoryGuardrail(combined)) {
      // Reject and fallback if subjective advice slipped through
      const fallback = generateDeterministicFallbackSummary(payload);
      return NextResponse.json(fallback);
    }

    const result: NarratorSummary = {
      bullet_1_hidden_friction: parsed.bullet_1_hidden_friction,
      bullet_2_liquidity_horizon: parsed.bullet_2_liquidity_horizon,
      bullet_3_neutral_baseline: parsed.bullet_3_neutral_baseline,
      status: 'GUARDRAIL_VERIFIED',
      executionTimeMs: Date.now() - startTime,
    };

    return NextResponse.json(result);
  } catch {
    // Network failure or timeout (> 1.8s) -> instant fallback
    const fallback = generateDeterministicFallbackSummary(payload);
    return NextResponse.json(fallback);
  }
}
