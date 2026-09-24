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
  CalendarDays,
  Tv,
  Smartphone,
  Tablet,
  Monitor,
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

function getIsoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getThisWeekIsoStr(): string {
  return getIsoWeekString(new Date());
}

function getNextWeekIsoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return getIsoWeekString(d);
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
  const nextWeekStr = getNextWeekIsoStr();
  const thisWeekStr = getThisWeekIsoStr();

  const [level, setLevel] = useState<LunchLevel>('ES');
  const [mealType, setMealType] = useState<MealType>('both');
  const [date, setDate] = useState<string>(todayStr);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [rawData, setRawData] = useState<any>(null);
  const [loadingRaw, setLoadingRaw] = useState<boolean>(false);
  const [showAplPreview, setShowAplPreview] = useState<boolean>(false);
  const [selectedDeviceSize, setSelectedDeviceSize] = useState<'show5' | 'show8' | 'show15'>('show8');

  // Quick date shortcuts including Yesterday, Today, Tomorrow, and Next Week
  const dateShortcuts = [
    { label: 'Yesterday', date: getDateOffset(-1), isWeek: false },
    { label: 'Today', date: todayStr, isWeek: false },
    { label: 'Tomorrow', date: getDateOffset(1), isWeek: false },
    { label: 'Next Week', date: nextWeekStr, isWeek: true },
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
              width: '76px',
              height: '76px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(249, 115, 22, 0.45))',
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
            maxWidth: '700px',
            margin: '0 auto',
            fontSize: '1.05rem',
          }}
        >
          Voice-optimized daily and weekly breakfast, lunch, and combo menus for Verona Area School District, designed for Amazon Alexa Flash Briefings and Alexa Custom Skills.
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

          {/* 3. Date / Week Picker & Quick Shortcuts */}
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
              Date or Week (YYYY-MM-DD or YYYY-Www)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD or YYYY-Www"
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
              <input
                type="date"
                id="native-date-picker"
                onChange={(e) => {
                  if (e.target.value) setDate(e.target.value);
                }}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => {
                  const picker = document.getElementById('native-date-picker') as HTMLInputElement | null;
                  picker?.showPicker?.();
                }}
                title="Open calendar picker"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={18} />
              </button>
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

            {/* Quick date shortcuts with Yesterday, Today, Tomorrow, and Next Week */}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {sc.isWeek && <CalendarDays size={12} color="#fb923c" />}
                    {sc.label} ({sc.isWeek ? sc.date : sc.date.slice(5)})
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
                {result?.type === 'week'
                  ? `Weekly Forecast (${result.week})`
                  : mealType === 'breakfast'
                  ? 'Breakfast'
                  : mealType === 'lunch'
                  ? 'Lunch'
                  : 'Breakfast & Lunch'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {result?.type === 'week' ? 'Week' : 'Date'}:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {result?.week || result?.date || date}
              </strong>
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
              onClick={() => setShowAplPreview(!showAplPreview)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '20px',
                background: showAplPreview ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border)',
                color: showAplPreview ? '#fb923c' : '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
              title="Preview Alexa Presentation Language (APL) multimodal designs for Echo Show devices"
            >
              <Tv size={14} color="#f97316" /> Echo Show Display {showAplPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

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

        {/* Echo Show APL Multimodal Screen Simulator */}
        {showAplPreview && (
          <div style={{ background: '#090d16', border: '2px solid rgba(249, 115, 22, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '28px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tv size={16} /> Alexa Presentation Language (APL) Multimodal Simulator
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Live visual designs rendered on screen devices using official Health-e Pro photography and responsive APL viewport models.
                </p>
              </div>

              {/* Device Selector Buttons */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '3px', gap: '4px' }}>
                <button
                  onClick={() => setSelectedDeviceSize('show5')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedDeviceSize === 'show5' ? 'var(--primary)' : 'transparent',
                    color: selectedDeviceSize === 'show5' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <Smartphone size={14} /> Echo Show 5
                </button>
                <button
                  onClick={() => setSelectedDeviceSize('show8')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedDeviceSize === 'show8' ? 'var(--primary)' : 'transparent',
                    color: selectedDeviceSize === 'show8' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <Tablet size={14} /> Echo Show 8
                </button>
                <button
                  onClick={() => setSelectedDeviceSize('show15')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedDeviceSize === 'show15' ? 'var(--primary)' : 'transparent',
                    color: selectedDeviceSize === 'show15' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <Monitor size={14} /> Echo Show 15
                </button>
              </div>
            </div>

            {/* Simulated Device Bezel */}
            <div
              style={{
                background: '#111827',
                border: '8px solid #1f2937',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8), 0 10px 25px rgba(0, 0, 0, 0.5)',
                maxWidth: selectedDeviceSize === 'show5' ? '540px' : selectedDeviceSize === 'show8' ? '740px' : '100%',
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              {/* Echo Show 5 Layout (Compact Hero Spotlight) */}
              {selectedDeviceSize === 'show5' && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minHeight: '190px', background: '#0b0f19', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <img src="/paw-logo.png" alt="VASD" style={{ width: '22px', height: '22px' }} />
                        <span style={{ fontSize: '0.74rem', color: '#f97316', fontWeight: 700 }}>
                          {result?.levelName || 'Elementary'} • {result?.mealType === 'breakfast' ? 'Breakfast' : 'Lunch'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px' }}>
                        {result?.date || 'Today'}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                        {result?.details?.specialEntrees?.[0] || 'Today\'s Menu'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 600, marginTop: '4px' }}>
                        Featured Hot Entrée
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '0.65rem', background: '#1e293b', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px' }}>
                        {result?.items?.length || 10} items on today's menu
                      </span>
                    </div>
                  </div>
                  <div style={{ width: '150px', height: '140px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#1e293b' }}>
                    <img
                      src={result?.heroImage || '/paw-logo.png'}
                      alt="Hero entree"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              {/* Echo Show 8 Layout (Split View with Touch Scrolling List) */}
              {selectedDeviceSize === 'show8' && (
                <div style={{ background: '#0b0f19', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/paw-logo.png" alt="VASD" style={{ width: '26px', height: '26px' }} />
                      <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>Verona Area School District</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(249, 115, 22, 0.2)', color: '#f97316', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                      {result?.levelName || 'Elementary K-5'} • {result?.mealType === 'breakfast' ? 'Breakfast' : 'Lunch'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
                    {/* Left: Featured Entree Card */}
                    <div style={{ background: '#1e293b', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ height: '150px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', background: '#0f172a' }}>
                          <img
                            src={result?.heroImage || '/paw-logo.png'}
                            alt="Featured course"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 800, letterSpacing: '0.05em' }}>FEATURED ENTRÉE</div>
                        <div style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800, marginTop: '3px', lineHeight: 1.2 }}>
                          {result?.details?.specialEntrees?.[0] || 'Today\'s Entrée'}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
                          {result?.summary?.slice(0, 110)}...
                        </p>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '8px' }}>
                        {result?.date || 'Today'}
                      </div>
                    </div>

                    {/* Right: Touch-Scrollable Sequence */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 700 }}>Menu Items (Touch to scroll)</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{result?.items?.length || 10} items</span>
                      </div>
                      <div style={{ maxHeight: '255px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                        {(result?.items || []).map((it: any) => (
                          <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', borderRadius: '10px', padding: '8px' }}>
                            <img
                              src={it.imageUrl || '/paw-logo.png'}
                              alt={it.name}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#0f172a' }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {it.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 600 }}>
                                {it.category} {it.allergens?.length ? `• ${it.allergens.join(', ')}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Echo Show 15 Layout (Widescreen Kitchen Gallery Hub) */}
              {selectedDeviceSize === 'show15' && (
                <div style={{ background: '#0b0f19', borderRadius: '16px', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src="/paw-logo.png" alt="VASD" style={{ width: '36px', height: '36px' }} />
                      <div>
                        <div style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 800 }}>Verona Area School District — Kitchen Hub</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{result?.date} • {result?.levelName}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', background: 'rgba(249, 115, 22, 0.2)', border: '1px solid #ea580c', color: '#f97316', padding: '6px 14px', borderRadius: '12px', fontWeight: 800 }}>
                      {result?.mealType === 'breakfast' ? 'Breakfast' : result?.mealType === 'both' ? 'Breakfast & Lunch' : 'Lunch'}
                    </span>
                  </div>

                  {/* Wide Featured Banner */}
                  <div style={{ display: 'flex', gap: '20px', background: '#1e293b', borderRadius: '16px', padding: '16px', marginBottom: '18px', alignItems: 'center' }}>
                    <img
                      src={result?.heroImage || '/paw-logo.png'}
                      alt="Featured main"
                      style={{ width: '220px', height: '140px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, background: '#0f172a' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 800, letterSpacing: '0.05em' }}>FEATURED MAIN COURSE</span>
                      <div style={{ fontSize: '1.45rem', color: '#f8fafc', fontWeight: 800, marginTop: '2px' }}>
                        {result?.details?.specialEntrees?.[0] || 'Today\'s Featured Entrée'}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.5, maxWidth: '680px' }}>
                        {result?.speechText}
                      </p>
                    </div>
                  </div>

                  {/* Touch-Scrollable Horizontal Gallery */}
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700, marginBottom: '10px' }}>
                      All Menu Items & Sides (Swipe or scroll horizontally)
                    </div>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {(result?.items || []).map((it: any) => (
                        <div
                          key={it.name}
                          style={{
                            flex: '0 0 160px',
                            background: '#1e293b',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <img
                            src={it.imageUrl || '/paw-logo.png'}
                            alt={it.name}
                            style={{ width: '100%', height: '100px', borderRadius: '8px', objectFit: 'cover', background: '#0f172a', marginBottom: '8px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 700 }}>
                              {it.category}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px', lineHeight: 1.2 }}>
                              {it.name}
                            </div>
                            {it.allergens?.length ? (
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
                                {it.allergens.join(', ')}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alexa Spoken Text Display with Hero Photo */}
        <div style={{ background: 'rgba(0, 0, 0, 0.45)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
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
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontSize: '1.18rem', lineHeight: 1.6, color: '#f8fafc', fontWeight: 500, margin: 0 }}>
                {loading ? 'Retrieving and summarizing menu...' : result?.speechText}
              </p>
            </div>
            {result?.heroImage && (
              <div style={{ flex: '0 0 auto', width: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(249, 115, 22, 0.3)', background: 'rgba(0, 0, 0, 0.5)' }}>
                <img
                  src={result.heroImage}
                  alt="Featured entree photo"
                  style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '6px 8px', fontSize: '0.72rem', color: '#fed7aa', fontWeight: 700, textAlign: 'center', background: 'rgba(249, 115, 22, 0.15)' }}>
                  Main Course Photo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Day-by-Day Forecast Breakdown */}
        {result?.type === 'week' && result?.days ? (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#fb923c', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={16} /> Week Forecast ({result.week}) Breakdown
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
              {result.days.map((day: any) => {
                const dObj = new Date(day.date + 'T12:00:00');
                const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
                return (
                  <div key={day.date} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fb923c', marginBottom: '6px' }}>{dayName}</div>
                    {!day.hasSchool ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No School</span>
                    ) : day.breakfast || day.lunch ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {day.breakfast && (
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#fed7aa', fontWeight: 700 }}>Breakfast:</div>
                            <div style={{ fontSize: '0.75rem', color: '#e4e4e7' }}>{day.breakfast.specialEntrees?.join(', ') || 'Standard'}</div>
                          </div>
                        )}
                        {day.lunch && (
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 700 }}>Lunch:</div>
                            <div style={{ fontSize: '0.75rem', color: '#e4e4e7' }}>{day.lunch.specialEntrees?.join(', ') || 'Standard'}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#e4e4e7' }}>
                        {day.specialEntrees?.length ? day.specialEntrees.join(', ') : 'Standard Menu'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : result?.breakfast && result?.lunch ? (
          /* Single Day Combined Breakdown */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coffee size={15} /> Breakfast Entrees & Sides
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.breakfast.specialEntrees?.length ? (
                  result.breakfast.specialEntrees.map((it: string) => (
                    <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', fontWeight: 600 }}>
                      {it}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
                )}
                {result.breakfast.sides?.map((it: string) => (
                  <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#d4d4d8' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={15} /> Lunch Hot Entrees & Sides
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.lunch.specialEntrees?.length ? (
                  result.lunch.specialEntrees.map((it: string) => (
                    <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', fontWeight: 600 }}>
                      {it}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>
                )}
                {[...(result.lunch.treats || []), ...(result.lunch.sides || [])].map((it: string) => (
                  <span key={it} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#d4d4d8' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Single Day Single Meal Breakdown */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', color: '#fb923c', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={14} /> Featured Specials
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result?.details?.specialEntrees?.length ? (
                  result.details.specialEntrees.map((it: string) => (
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
                {[...(result?.details?.treats || []), ...(result?.details?.sides || [])].map((it: string) => (
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
                {result?.details?.stapleEntrees?.map((it: string) => (
                  <span key={it} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Real Food Photos Gallery from Health-e Pro */}
        {result?.items && result.items.filter((it: any) => it.imageUrl).length > 0 && (
          <div style={{ marginTop: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', color: '#fb923c', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={15} /> Today's Food Photography ({result.items.filter((it: any) => it.imageUrl).length} Photos Scraped from Health-e Pro)
            </h4>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {result.items.filter((it: any) => it.imageUrl).map((it: any) => (
                <div
                  key={it.name}
                  style={{
                    flex: '0 0 140px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase' }}>
                      {it.category}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600, marginTop: '2px', lineHeight: 1.2 }}>
                      {it.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Examples: Breakfast, Lunch, Combo, and Next Week */}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Example 1: Breakfast */}
          <div
            onClick={() => {
              setMealType('breakfast');
              setLevel('ES');
              setDate(todayStr);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: mealType === 'breakfast' && !date.includes('-W') ? '1px solid var(--primary)' : '1px solid var(--border)',
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
              Morning rotating entrees (muffins, pancake bars, etc.) and fruit sides.
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
              border: mealType === 'lunch' && !date.includes('-W') ? '1px solid var(--primary)' : '1px solid var(--border)',
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
              Hot lunch specials, vegetables, and treats with daily staples filtered out.
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
              border: mealType === 'both' && !date.includes('-W') ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={18} color="#ff6a00" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff6a00' }}>
                Both (Breakfast & Lunch)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Full day readout starting with breakfast followed by lunch.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> "Alexa, ask Verona School Lunch what's the menu"
            </div>
          </div>

          {/* Example 4: Next Week Full Forecast */}
          <div
            onClick={() => {
              setMealType('both');
              setLevel('ES');
              setDate(nextWeekStr);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: date === nextWeekStr ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CalendarDays size={18} color="#34d399" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                Next Week Forecast
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Full Monday–Friday preview with day-by-day menu highlights.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> "Alexa, ask Verona School Lunch what's the menu next week"
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
