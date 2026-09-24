'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  RefreshCw,
  Check,
  Copy,
  Sparkles,
  School,
  Utensils,
  ShieldCheck,
  Zap,
  Bug,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Coffee,
  Sun,
  Layers,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { LunchLevel, LunchSummaryResult, MealType } from '@/lib/types';

function getTodayStr(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function getDateOffset(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function formatModelName(model: string): string {
  if (model.includes('3.5')) return 'Gemini 3.5 Flash Lite';
  if (model.includes('2.0')) return 'Gemini 2.0 Flash Lite';
  if (model.includes('1.5')) return 'Gemini 1.5 Flash';
  return model;
}

export default function HomePage() {
  const configuredModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const todayStr = getTodayStr();

  const [level, setLevel] = useState<LunchLevel>('ES');
  const [mealType, setMealType] = useState<MealType>('both');
  const [date, setDate] = useState<string>(todayStr);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LunchSummaryResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [rawData, setRawData] = useState<any>(null);
  const [loadingRaw, setLoadingRaw] = useState<boolean>(false);

  // Quick date options including Yesterday, Today, Tomorrow, and upcoming school days
  const dateShortcuts = [
    { label: 'Yesterday', date: getDateOffset(-1) },
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: getDateOffset(1) },
    { label: '+2 Days', date: getDateOffset(2) },
    { label: '+3 Days', date: getDateOffset(3) },
  ];

  const toggleRawData = async () => {
    if (!showRawJson && !rawData) {
      setLoadingRaw(true);
      try {
        const res = await fetch(`/api/debug?level=${level}&date=${date}&meal=${mealType}`);
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

  const fetchSummary = async (targetLevel = level, targetDate = date, targetMeal = mealType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lunch?level=${targetLevel}&date=${targetDate}&meal=${targetMeal}`);
      const data = await res.json();
      setResult(data);
      // Reset cached raw view so user can re-fetch matching debug data if toggled
      setRawData(null);
    } catch (err) {
      console.error('Failed to load summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [level, date, mealType]);

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

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://vasd-lunch.vercel.app';

  return (
    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <img
            src="/paw-logo.png"
            alt="Verona Wildcats Paw Logo"
            style={{
              width: '72px',
              height: '72px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 14px rgba(249, 115, 22, 0.45))',
            }}
          />
        </div>

        {/* Model Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            color: '#fb923c',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '14px',
          }}
        >
          <Sparkles size={16} color="#fb923c" /> Powered by Google {formatModelName(configuredModel)} & Vercel Edge
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            color: '#f8fafc',
          }}
        >
          Verona Area School Menu Summarizer
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto',
            fontSize: '1.05rem',
          }}
        >
          Voice-optimized breakfast, lunch, and combo menus for Verona Area School District, designed for Amazon Alexa Flash Briefings and Alexa Custom Skills.
        </p>
      </header>

      {/* Control Panel */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* 1. School Level selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                color: 'var(--accent)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
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
                      padding: '10px 6px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fb923c' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lvl}
                    <div style={{ fontSize: '0.70rem', opacity: 0.8, marginTop: '2px', fontWeight: 500 }}>
                      {labelMap[lvl]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Meal Type selector (Breakfast, Lunch, Combo) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                color: 'var(--accent)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              Meal Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { type: 'breakfast' as MealType, label: 'Breakfast', icon: Coffee },
                { type: 'lunch' as MealType, label: 'Lunch', icon: Sun },
                { type: 'both' as MealType, label: 'Both (Combo)', icon: Layers },
              ].map(({ type, label: lText, icon: Icon }) => {
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fb923c' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={16} color={isSelected ? '#fb923c' : 'var(--text-muted)'} />
                    <span>{lText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Date Picker & Quick Shortcuts */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                color: 'var(--accent)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
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
                  fontWeight: 700,
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)',
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Quick date shortcuts with Yesterday, Today, Tomorrow */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {dateShortcuts.map((sc) => {
                const isCurrent = date === sc.date;
                return (
                  <button
                    key={sc.label}
                    onClick={() => setDate(sc.date)}
                    style={{
                      fontSize: '0.74rem',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: isCurrent ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: isCurrent ? '#fb923c' : 'var(--text-muted)',
                      border: isCurrent ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    {sc.label} ({sc.date.slice(5)})
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Main Result Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '16px',
          padding: '28px',
          backdropFilter: 'blur(12px)',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <School size={22} color="#fb923c" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {result?.levelName || 'Verona School Menu'}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(249, 115, 22, 0.15)',
                  color: '#fb923c',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Breakfast & Lunch'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Date: <strong style={{ color: 'var(--text-secondary)' }}>{result?.date || date}</strong>
            </p>
          </div>

          {/* Cache & Status indicator & Debug link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href={`/api/debug?level=${level}&date=${date}&meal=${mealType}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
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
                padding: '5px 12px',
                borderRadius: '20px',
                background: showRawJson ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: showRawJson ? '#fb923c' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {showRawJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {showRawJson ? 'Hide Inline' : 'Inspect Raw'}
            </button>

            {result?.cached ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                <ShieldCheck size={14} /> Cached (Zero AI Cost)
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                <Zap size={14} /> Freshly Summarized
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Inline Raw JSON Inspector */}
        {showRawJson && (
          <div style={{ background: 'rgba(0, 0, 0, 0.65)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
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
              <pre style={{ fontSize: '0.78rem', color: '#cbd5e1', maxHeight: '300px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.4)', padding: '12px', borderRadius: '8px' }}>
                {JSON.stringify(rawData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Alexa Spoken Text Display */}
        <div style={{ background: 'rgba(0, 0, 0, 0.45)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Alexa Spoken Speech Text
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSpeak}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: isSpeaking ? '#ef4444' : 'rgba(249, 115, 22, 0.2)',
                  color: isSpeaking ? '#fff' : '#fb923c',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
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
          
          <p style={{ fontSize: '1.18rem', lineHeight: 1.6, color: '#f8fafc', fontWeight: 500 }}>
            {loading ? 'Retrieving and summarizing menu...' : result?.speechText}
          </p>
        </div>

        {/* Breakdown of Extracted Items */}
        {result?.breakfast && result?.lunch ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Breakfast section */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coffee size={15} /> Breakfast Entrees & Sides
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.breakfast.specialEntrees?.length ? (
                  result.breakfast.specialEntrees.map((it) => (
                    <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', fontWeight: 600 }}>
                      {it}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
                )}
                {result.breakfast.sides?.map((it) => (
                  <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#d4d4d8' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>

            {/* Lunch section */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={15} /> Lunch Hot Entrees & Sides
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.lunch.specialEntrees?.length ? (
                  result.lunch.specialEntrees.map((it) => (
                    <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', fontWeight: 600 }}>
                      {it}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
                )}
                {[...(result.lunch.treats || []), ...(result.lunch.sides || [])].map((it) => (
                  <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#d4d4d8' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', color: '#fb923c', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={14} /> Featured Specials
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result?.details?.specialEntrees?.length ? (
                  result.details.specialEntrees.map((it) => (
                    <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', fontWeight: 600 }}>
                      {it}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>
                Sides & Treats
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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Ignored Staples (Filtered Out)
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
        )}
      </div>

      {/* Interactive Examples: Breakfast, Lunch, and Combo */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
          marginBottom: '30px',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: '#f8fafc' }}>
          Interactive Menu Examples & Voice Commands
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Click any example below to test that configuration live in the viewer above, or ask Alexa using the phrase shown:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {/* Example 1: Breakfast */}
          <div
            onClick={() => {
              setMealType('breakfast');
              setLevel('ES');
              setDate(todayStr);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: mealType === 'breakfast' ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coffee size={18} color="#fb923c" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb923c' }}>
                Breakfast Only
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Retrieves the morning rotating entree (pancake bars, muffins, etc.) and fruit sides.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fdba74', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> "Alexa, ask Verona School Lunch what's for breakfast tomorrow"
            </div>
          </div>

          {/* Example 2: Lunch */}
          <div
            onClick={() => {
              setMealType('lunch');
              setLevel('ES');
              setDate(todayStr);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: mealType === 'lunch' ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sun size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b' }}>
                Lunch Only
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Retrieves hot lunch specials, vegetables, and special desserts while filtering out PB&J/deli staples.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> "Alexa, ask Verona School Lunch what's for lunch today"
            </div>
          </div>

          {/* Example 3: Combined Menu */}
          <div
            onClick={() => {
              setMealType('both');
              setLevel('ES');
              setDate(todayStr);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: mealType === 'both' ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={18} color="#ff6a00" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff6a00' }}>
                Both (Breakfast & Lunch Combo)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Full day readout starting with breakfast followed by lunch in a natural conversational flow.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> "Alexa, ask Verona School Lunch what's the menu"
            </div>
          </div>
        </div>
      </div>

      {/* Integration Guide / URL endpoints */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: '#f8fafc' }}>
          API Endpoints for Alexa, Scripts & Automations
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Endpoint 1: Breakfast API */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fb923c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coffee size={14} /> Breakfast API Endpoint
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/breakfast?level=${level}&date=${date}`, 'breakfast-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'breakfast-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#fdba74', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/breakfast?level=${level}&date=${date}`}
            </code>
          </div>

          {/* Endpoint 2: Lunch API */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sun size={14} /> Lunch API Endpoint
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/lunch?level=${level}&date=${date}`, 'lunch-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'lunch-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#fde68a', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/lunch?level=${level}&date=${date}`}
            </code>
          </div>

          {/* Endpoint 3: Combined Menu API */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff6a00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Combined Menu API (Breakfast + Lunch)
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/menu?level=${level}&date=${date}`, 'menu-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'menu-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#fed7aa', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/menu?level=${level}&date=${date}`}
            </code>
          </div>

          {/* Endpoint 4: Alexa Flash Briefing Feed */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
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

          {/* Endpoint 5: Alexa Custom Skill Endpoint */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                Alexa Custom Skill HTTPS Endpoint
              </span>
              <button
                onClick={() => copyToClipboard(`${currentOrigin}/api/alexa`, 'alexa-url')}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied === 'alexa-url' ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy URL
              </button>
            </div>
            <code style={{ fontSize: '0.85rem', color: '#6ee7b7', wordBreak: 'break-all' }}>
              {`${currentOrigin}/api/alexa`}
            </code>
          </div>

        </div>
      </div>
    </main>
  );
}
