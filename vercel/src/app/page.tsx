'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, RefreshCw, Check, Copy, Sparkles, School, Utensils, ShieldCheck, Zap, Bug, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { LunchLevel, LunchSummaryResult } from '@/lib/types';

export default function HomePage() {
  const [level, setLevel] = useState<LunchLevel>('ES');
  const [date, setDate] = useState<string>('2026-10-01');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LunchSummaryResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [rawData, setRawData] = useState<any>(null);
  const [loadingRaw, setLoadingRaw] = useState<boolean>(false);

  const toggleRawData = async () => {
    if (!showRawJson && !rawData) {
      setLoadingRaw(true);
      try {
        const res = await fetch(`/api/debug?level=${level}&date=${date}`);
        const data = await res.json();
        setRawData(data);
      } catch (err) {
        console.error('Failed to load raw data', err);
      } finally {
        setLoadingRaw(false);
      }
    }
    setShowRawJson(!showRawJson);
  };

  const fetchSummary = async (targetLevel = level, targetDate = date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lunch?level=${targetLevel}&date=${targetDate}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to load summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [level, date]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSpeak = () => {
    if (!result?.speechText) return;

    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(result.speechText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in this browser.');
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
          <Sparkles size={16} /> Powered by Gemini 2.0 Flash Lite & Vercel
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Verona Area School Lunch Summarizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Real-time, voice-optimized school lunch summaries designed for Amazon Alexa Flash Briefings and Alexa Skills.
        </p>
      </header>

      {/* Control Panel */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          
          {/* Level selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              School Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(['ES', 'MS', 'HS'] as LunchLevel[]).map((lvl) => {
                const labelMap = { ES: 'Elementary (K-5)', MS: 'Middle (6-8)', HS: 'High (9-12)' };
                const isSelected = level === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#a5b4fc' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lvl}
                    <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>{labelMap[lvl]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Date
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => fetchSummary()}
                disabled={loading}
                title="Refresh menu"
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            {/* Quick date shortcuts */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {['2026-10-01', '2026-10-05', '2026-10-06', '2026-10-07'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: date === d ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: date === d ? '#818cf8' : 'var(--text-muted)',
                  }}
                >
                  {d.slice(5)}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Result Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '30px', backdropFilter: 'blur(12px)', marginBottom: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <School size={20} color="#818cf8" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {result?.levelName || 'School Lunch'}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Date: {result?.date || date}
            </p>
          </div>

          {/* Cache & Status indicator & Debug link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href={`/api/debug?level=${level}&date=${date}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border)',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              title="View raw JSON data scraped from Health-e Pro without AI summarization"
            >
              <Bug size={14} color="#f43f5e" /> Raw Scraped Data <ExternalLink size={12} />
            </a>

            <button
              onClick={toggleRawData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: showRawJson ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: showRawJson ? '#818cf8' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {showRawJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {showRawJson ? 'Hide Inline' : 'Inspect Raw'}
            </button>

            {result?.cached ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                <ShieldCheck size={14} /> Cached (Zero AI Cost)
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                <Zap size={14} /> Freshly Summarized
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Inline Raw JSON Inspector */}
        {showRawJson && (
          <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bug size={14} /> Raw Scraped Data from Health-e Pro (Unsummarized)
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(rawData, null, 2), 'raw-json')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'raw-json' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy JSON
              </button>
            </div>
            {loadingRaw ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching raw scraped items...</p>
            ) : (
              <pre style={{ fontSize: '0.78rem', color: '#cbd5e1', maxHeight: '300px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px' }}>
                {JSON.stringify(rawData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Alexa Spoken Text Display */}
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Alexa Spoken Speech Text
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSpeak}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: isSpeaking ? '#ef4444' : 'rgba(56, 189, 248, 0.15)',
                  color: isSpeaking ? '#fff' : 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <Volume2 size={14} /> {isSpeaking ? 'Stop Audio' : 'Hear on Alexa'}
              </button>
              <button
                onClick={() => copyToClipboard(result?.speechText || '', 'speech')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                }}
              >
                {copied === 'speech' ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy
              </button>
            </div>
          </div>
          
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: '#f1f5f9', fontWeight: 500 }}>
            {loading ? 'Retrieving and summarizing menu...' : result?.speechText}
          </p>
        </div>

        {/* Breakdown of Extracted Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={14} /> Today's Featured Specials
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {result?.details?.specialEntrees?.length ? (
                result.details.specialEntrees.map((it) => (
                  <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', fontWeight: 500 }}>
                    {it}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px' }}>
              Sides & Special Treats
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[...(result?.details?.treats || []), ...(result?.details?.sides || [])].map((it) => (
                <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde68a', fontWeight: 500 }}>
                  {it}
                </span>
              ))}
              {(!result?.details?.treats?.length && !result?.details?.sides?.length) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard sides</span>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
              Ignored Daily Staples (Filtered Out)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {result?.details?.stapleEntrees?.map((it) => (
                <span key={it} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                  {it}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Integration Guide / URL endpoints */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Endpoints for Alexa & GitHub Actions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Endpoint 1: Flash Briefing */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                Amazon Alexa Flash Briefing Feed URL
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/briefing?level=${level}`, 'briefing-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'briefing-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#93c5fd', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/briefing?level=${level}`}
            </code>
          </div>

          {/* Endpoint 2: JSON API */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8' }}>
                Alexa Skill / GitHub Action API URL
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/lunch?level=${level}&date=${date}`, 'json-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'json-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#c7d2fe', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/lunch?level=${level}&date=${date}`}
            </code>
          </div>

          {/* Endpoint 3: Plain text */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                Plain Text Output
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/lunch?level=${level}&date=${date}&format=text`, 'text-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'text-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#6ee7b7', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/lunch?level=${level}&date=${date}&format=text`}
            </code>
          </div>

          {/* Endpoint 4: Debug Raw Scraped Data */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bug size={14} /> Debug: Raw Scraped Data (No AI Summary)
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a
                  href={`${currentOrigin}/api/debug?level=${level}&date=${date}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  Open in Tab <ExternalLink size={11} />
                </a>
                <button
                  onClick={() => copyToClipboard(`${currentOrigin}/api/debug?level=${level}&date=${date}`, 'debug-url')}
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copied === 'debug-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
                </button>
              </div>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#fda4af', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/debug?level=${level}&date=${date}`}
            </code>
          </div>

        </div>
      </div>
    </main>
  );
}
