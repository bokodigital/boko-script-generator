'use client';

import { useState } from 'react';

const EMPTY_IG = [
  { name: '', link: '' },
  { name: '', link: '' },
  { name: '', link: '' },
];

export default function Home() {
  const [business, setBusiness] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [igPages, setIgPages] = useState(EMPTY_IG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function updateIg(i, field, value) {
    setIgPages((prev) => {
      const next = prev.map((p) => ({ ...p }));
      next[i][field] = value;
      return next;
    });
  }

  const filledPages = igPages.filter((p) => p.name.trim() || p.link.trim());
  const canSubmit =
    business.trim() && industry.trim() && filledPages.length >= 1 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, industry, description, igPages: filledPages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function copyAll() {
    if (!result) return;
    const text = result.scripts
      .map(
        (s, i) =>
          `SCRIPT ${i + 1}: ${s.title}\nFormat: ${s.format} | Hook style: ${s.hookStyle}\n\nHOOK: ${s.hook}\n\nSCRIPT:\n${s.script}\n\nON-SCREEN TEXT: ${s.onScreenText}\nCTA: ${s.cta}\nCAPTION: ${s.caption}\nHASHTAGS: ${(s.hashtags || []).join(' ')}\n`
      )
      .join('\n----------------------------------------\n\n');
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="wrap">
      <section className="hero">
        <span className="tagline">Strategize · Execute · Deliver</span>
        <h1>
          AI Social Video <span className="hl">Script Generator</span>
        </h1>
        <p>
          Drop in 3 Instagram pages you admire or compete with, tell us about your
          business, and get 10 ready-to-shoot video scripts tailored to your brand.
        </p>
      </section>

      {!result && !loading && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="section-label">Your business</div>
          <div className="section-hint">So the scripts speak in your voice.</div>

          <div className="grid-2">
            <div className="field">
              <label>Business name *</label>
              <input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="e.g. Coastline Coffee Co."
              />
            </div>
            <div className="field">
              <label>Industry *</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Specialty coffee / hospitality"
              />
            </div>
          </div>

          <div className="field">
            <label>Short description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A sentence or two: what you sell, who you serve, what makes you different."
            />
          </div>

          <div className="divider" />

          <div className="section-label">Instagram pages to analyze</div>
          <div className="section-hint">
            Add up to 3 competitor or inspiration pages. At least one is required.
          </div>

          {igPages.map((p, i) => (
            <div className="ig-row" key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label><span className="ig-index">{i + 1}</span>Page name / handle</label>
                <input
                  value={p.name}
                  onChange={(e) => updateIg(i, 'name', e.target.value)}
                  placeholder="@theirhandle"
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Profile link</label>
                <input
                  value={p.link}
                  onChange={(e) => updateIg(i, 'link', e.target.value)}
                  placeholder="https://instagram.com/theirhandle"
                />
              </div>
            </div>
          ))}

          {error && <div className="error-box">{error}</div>}

          <div style={{ marginTop: 24 }}>
            <button className="btn" type="submit" disabled={!canSubmit}>
              Generate 10 scripts <span className="arrow">→</span>
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="card">
          <div className="loading">
            <div className="spinner" />
            <p style={{ color: '#000', fontWeight: 600 }}>
              Analyzing pages and writing your scripts…
            </p>
            <p style={{ color: '#666', fontSize: 13, marginTop: 6 }}>
              This usually takes 15–30 seconds.
            </p>
          </div>
        </div>
      )}

      {result && (
        <section className="results" id="results">
          <div className="results-head">
            <h2>Your Playbook</h2>
          </div>

          {result.analysis && (
            <div className="analysis">
              <h3>Competitor analysis</h3>
              {result.analysis.summary && <p style={{ marginBottom: 14 }}>{result.analysis.summary}</p>}
              {Array.isArray(result.analysis.insights) && (
                <ul>
                  {result.analysis.insights.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="toolbar">
            <button className="btn btn-ghost" onClick={copyAll}>Copy all scripts</button>
            <button className="btn btn-ghost" onClick={reset}>Start over</button>
          </div>

          {result.scripts.map((s, i) => (
            <div className="script" key={i}>
              <div className="script-top">
                <span className="script-num">{i + 1}</span>
                <span className="script-title">{s.title}</span>
              </div>
              <div className="script-meta">
                {s.format && <span className="chip">{s.format}</span>}
                {s.hookStyle && <span className="chip">{s.hookStyle}</span>}
                {s.duration && <span className="chip">{s.duration}</span>}
              </div>
              {s.hook && (
                <div className="script-block">
                  <div className="k">Hook (first 3 seconds)</div>
                  <div className="v">{s.hook}</div>
                </div>
              )}
              <div className="script-block">
                <div className="k">Script</div>
                <div className="v">{s.script}</div>
              </div>
              {s.onScreenText && (
                <div className="script-block">
                  <div className="k">On-screen text</div>
                  <div className="v">{s.onScreenText}</div>
                </div>
              )}
              {s.cta && (
                <div className="script-block">
                  <div className="k">Call to action</div>
                  <div className="v">{s.cta}</div>
                </div>
              )}
              {s.caption && (
                <div className="script-block">
                  <div className="k">Caption</div>
                  <div className="v">{s.caption}</div>
                </div>
              )}
              {Array.isArray(s.hashtags) && s.hashtags.length > 0 && (
                <div className="script-block">
                  <div className="k">Hashtags</div>
                  <div className="v hashtags">{s.hashtags.join('  ')}</div>
                </div>
              )}
            </div>
          ))}

          <div className="toolbar" style={{ marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={copyAll}>Copy all scripts</button>
            <button className="btn btn-ghost" onClick={reset}>Start over</button>
          </div>
        </section>
      )}
    </main>
  );
}
