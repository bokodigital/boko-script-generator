export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are a senior social media strategist at Boko Digital, a global digital agency.
Boko's brand voice is: Expert & Authoritative, Pragmatic & Supportive, Proactive & Forward-Looking.
Writing principles: prioritize clarity (no jargon), be intentional, keep it concise, use active verbs.

Your job: given a business and 3 Instagram pages it admires or competes with, produce:
1) A short competitor analysis (what those pages do well, content patterns, tone, gaps to exploit).
2) Exactly 10 distinct, ready-to-shoot short-form video scripts (Reels / TikTok / Shorts) tailored to the business.

Each script must be genuinely different in angle and format (e.g. educational, behind-the-scenes,
myth-busting, listicle, founder story, customer spotlight, before/after, trend-jack, FAQ, hot take).
Scripts are for 9:16 vertical video, 15-45 seconds. Keep on-screen text short. CTAs must be specific.

Return ONLY valid JSON (no markdown, no backticks) matching exactly this shape:
{
  "analysis": {
    "summary": "2-3 sentence overview",
    "insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]
  },
  "scripts": [
    {
      "title": "short punchy title",
      "format": "e.g. Talking head, B-roll voiceover, Tutorial",
      "hookStyle": "e.g. Question hook, Bold claim, Pattern interrupt",
      "duration": "e.g. 20-30s",
      "hook": "the literal first line spoken/shown in first 3 seconds",
      "script": "the full spoken script / shot-by-shot voiceover with line breaks",
      "onScreenText": "short text overlays, separated by ' / '",
      "cta": "specific call to action",
      "caption": "ready-to-post Instagram caption",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }
  ]
}
The "scripts" array MUST contain exactly 10 items.`;

function buildUserPrompt({ business, industry, description, igPages }) {
  const pages = igPages
    .map((p, i) => `  ${i + 1}. ${p.name || '(no handle given)'} — ${p.link || '(no link given)'}`)
    .join('\n');
  return `BUSINESS NAME: ${business}
INDUSTRY: ${industry}
DESCRIPTION: ${description || '(none provided)'}

INSTAGRAM PAGES TO ANALYZE:
${pages}

Note: You are working from the handles/links and your knowledge of how pages in this niche typically
operate. Infer likely content strategy from the handle, niche, and industry context.

Now produce the competitor analysis and exactly 10 tailored video scripts as JSON.`;
}

function extractJson(text) {
  let t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { business, industry, description, igPages } = body || {};

    if (!business?.trim() || !industry?.trim()) {
      return Response.json({ error: 'Business name and industry are required.' }, { status: 400 });
    }
    if (!Array.isArray(igPages) || igPages.length < 1) {
      return Response.json({ error: 'Add at least one Instagram page.' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'Server is missing ANTHROPIC_API_KEY. Set it in your Vercel project settings.' },
        { status: 500 }
      );
    }

    const apiRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 7000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt({ business, industry, description, igPages }) },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      const msg =
        apiRes.status === 401
          ? 'Invalid Anthropic API key.'
          : `Anthropic API error (${apiRes.status}). ${errText.slice(0, 200)}`;
      return Response.json({ error: msg }, { status: 502 });
    }

    const payload = await apiRes.json();
    const text = (payload.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    let data;
    try {
      data = extractJson(text);
    } catch (e) {
      return Response.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 502 }
      );
    }

    if (!data?.scripts || !Array.isArray(data.scripts)) {
      return Response.json({ error: 'No scripts were generated. Please try again.' }, { status: 502 });
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
