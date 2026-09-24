# 🐾 Verona Area School District (VASD) Menu Summarizer & Alexa Skill

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-orange?logo=google)](https://aistudio.google.com/)
[![Alexa Skills Kit](https://img.shields.io/badge/Alexa%20Skill-Ready-00CAFF?logo=amazonalexa)](https://developer.amazon.com/alexa)
[![Vercel Edge](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An intelligent, voice-optimized service that scrapes daily and weekly **breakfast** and **lunch** menus for the **Verona Area School District (VASD)** (Verona, Wisconsin) from Health-e Pro, filters out daily recurring staples, and generates concise, natural spoken summaries using **Google Gemini 3.5 Flash Lite**.

---

## 🌟 Features

* **🎙️ Amazon Alexa Custom Skill (`"verona school lunch"`)**: Interactive voice skill supporting single-day inquiries, multi-turn level prompting, and weekly forecasts.
* **🥐 Breakfast, Lunch, and Combined Menus**: Ask for just breakfast, just lunch, or the full daily/weekly menu.
* **📅 Flexible Date Resolution**: Supports *"today"*, *"tomorrow"*, *"yesterday"*, specific calendar dates (`YYYY-MM-DD`), and full weekly forecasts (`YYYY-Www` e.g., *"this week"*, *"next week"*).
* **🐾 Official VASD Wildcats Dashboard**: Interactive web viewer built in athletic orange & black with audio playback preview and one-click examples.
* **⚡ Multi-Tier Zero-Cost Caching**: In-memory + `/tmp` warm serverless caching + optional Redis / Vercel KV ensures near-zero AI latency and minimal API costs.
* **🛡️ Zero-Failure Resilience**: Automatic rule-based fallback guarantees announcements are always served even during temporary AI outages or high demand spikes.

---

## 🔄 How It Works (Architecture & Flow)

```
┌─────────────────────────────────┐
│ Health-e Pro VASD API (Org 3368)│
│  - Elementary (ES): 128399/128400
│  - Middle School (MS): 128402/128403
│  - High School (HS): 128405/128406
└───────────────┬─────────────────┘
                │ Raw JSON Menus
                ▼
┌─────────────────────────────────┐
│ Smart Filtering & Categorization│
│  - Filters PB&J, deli subs, milk│
│  - Separates specials & treats  │
└───────────────┬─────────────────┘
                │ Filtered Menu Data
                ▼
┌─────────────────────────────────┐      Found in Cache
│    Multi-Tier Caching Layer     │ ────────────────────────┐
│  - In-Memory Map (warm request) │                         │
│  - /tmp storage (serverless)    │                         │
│  - Upstash Redis / Vercel KV    │                         │
└───────────────┬─────────────────┘                         │
                │ Cache Miss                                │
                ▼                                           │
┌─────────────────────────────────┐                         │
│  Google Gemini 3.5 Flash Lite   │                         │
│  - Natural spoken phrasing      │                         │
│  - Safe rule-based fallback     │                         │
└───────────────┬─────────────────┘                         │
                │                                           │
                ├───────────────────────────────────────────┘
                ▼
┌───────────────────────────────────────────────────────────┐
│                     Delivery Channels                     │
│  • Alexa Custom Skill (/api/alexa)                        │
│  • Alexa Flash Briefing Feed (/api/briefing)              │
│  • Web Dashboard & Audio Preview (/)                      │
│  • REST Endpoints (/api/lunch, /api/breakfast, /api/menu) │
└───────────────────────────────────────────────────────────┘
```

---

## 🗣️ Alexa Voice Commands

The skill invocation name is **`verona school lunch`**.

### 1. Breakfast Inquiries
* *"Alexa, ask Verona School Lunch what's for **breakfast**"*
* *"Alexa, ask Verona School Lunch what's for **breakfast tomorrow** for **elementary school**"*
* *"Alexa, ask Verona School Lunch what's for **breakfast next week** for **high school**"*

### 2. Lunch Inquiries
* *"Alexa, ask Verona School Lunch what's for **lunch**"*
* *"Alexa, ask Verona School Lunch what's for **lunch today** for **middle school**"*
* *"Alexa, ask Verona School Lunch what's for **lunch tomorrow** for **high school**"*

### 3. Combined Menu (Breakfast + Lunch)
* *"Alexa, ask Verona School Lunch what's **the menu**"*
* *"Alexa, ask Verona School Lunch what's the **menu tomorrow** for **elementary school**"*
* *"Alexa, ask Verona School Lunch what's the **menu next week** for **high school**"*

### 4. Multi-Turn Interactive Flow
If you don't mention a school level, Alexa remembers your date and meal preference and asks:
> **Alexa**: *"Would you like the menu for elementary, middle, or high school?"*  
> **User**: *"Elementary"*  
> **Alexa**: *"Tomorrow for Elementary School (K-5) breakfast, the entree is Mini Cinni with Banana. Tomorrow for Elementary School (K-5) lunch, the main hot entree is French Toast Slice, accompanied by Potato Smiles."*

---

## 🌐 REST API Reference

All endpoints accept `format=json` (default) or `format=text`.

| Endpoint | Method | Query Parameters | Description |
| :--- | :---: | :--- | :--- |
| **`/api/lunch`** | `GET` | `level=ES\|MS\|HS`<br>`date=YYYY-MM-DD\|YYYY-Www`<br>`meal=breakfast\|lunch\|both` | Primary menu endpoint. Defaults to lunch. |
| **`/api/breakfast`** | `GET` | `level=ES\|MS\|HS`<br>`date=YYYY-MM-DD\|YYYY-Www` | Dedicated convenience endpoint for breakfast. |
| **`/api/menu`** | `GET` | `level=ES\|MS\|HS`<br>`date=YYYY-MM-DD\|YYYY-Www` | Dedicated convenience endpoint for combined menu (both). |
| **`/api/alexa`** | `POST` | *Alexa JSON Request Envelope* | Webhook handler for the Amazon Alexa Custom Skill. |
| **`/api/briefing`** | `GET` | `level=ES\|MS\|HS` | Flash Briefing JSON feed for Amazon Echo devices. |
| **`/api/debug`** | `GET` | `level=ES\|MS\|HS`<br>`date=YYYY-MM-DD`<br>`meal=breakfast\|lunch\|both` | Raw unsummarized scraped JSON items directly from Health-e Pro. |

### Example API Request & Response
```bash
curl "https://your-domain.vercel.app/api/lunch?level=ES&meal=breakfast"
```
```json
{
  "date": "2026-09-24",
  "level": "ES",
  "levelName": "Elementary School (K-5)",
  "mealType": "breakfast",
  "speechText": "Today for Elementary School (K-5) breakfast, the entree is Birthday Cake Bar or Campfire S'mores Bar with Dried Cranberries.",
  "summary": "Today for Elementary School (K-5) breakfast, the entree is Birthday Cake Bar or Campfire S'mores Bar with Dried Cranberries.",
  "cached": true,
  "details": {
    "specialEntrees": ["Birthday Cake Bar", "Campfire S'mores Bar"],
    "sides": ["Dried Cranberries", "Juice Box Variety"],
    "treats": [],
    "stapleEntrees": []
  }
}
```

---

## 🔒 Security & Privacy

This codebase has undergone a comprehensive security sweep:
* **Zero Prompt Injection**: User query parameters (`level`, `date`, `meal`) are strictly validated against strict regex / enum allowlists before internal use. No user text is ever concatenated into AI prompts.
* **No Secret Leaks**: All credentials (`GEMINI_API_KEY`, Upstash Redis tokens) are strictly server-side environment variables and are excluded from public client builds. `.env` is permanently excluded via `.gitignore`.
* **Bounded Input Validation**: Dates and week numbers are strictly bound to valid ranges (`2020` to `2050`, weeks `1` to `53`), eliminating SSRF and parameter pollution.
* **Safe Error Handling**: Error messages never expose database credentials or internal stack traces to client callers.

---

## 🚀 Getting Started & Self-Hosting

### 1. Clone & Install
```bash
git clone https://github.com/chrispauly/vasd-lunch.git
cd vasd-lunch/vercel
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
NEXT_PUBLIC_GEMINI_MODEL=gemini-3.5-flash-lite
```
*(Get a free API key from [Google AI Studio](https://aistudio.google.com/)).*

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel
Deploy with the Vercel CLI or connect your GitHub repository to Vercel:
```bash
npx vercel
```
Make sure to add `GEMINI_API_KEY` and `GEMINI_MODEL` to your Vercel Project Environment Variables.

### 5. Setup Amazon Alexa Skill
1. Log into the [Amazon Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Create a **Custom Skill** named `Verona School Lunch` (Model: Custom, Hosting: Provision your own).
3. Navigate to **Interaction Model -> JSON Editor**, paste the contents of [`alexa/interactionModels/custom/en-US.json`](alexa/interactionModels/custom/en-US.json), and click **Save** then **Build skill**.
4. In **Endpoint**, select **HTTPS** and enter your Vercel deployment URL:
   `https://<your-vercel-domain>.vercel.app/api/alexa`
   Select SSL certificate type: *My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority*.
5. In the **Test** tab, enable testing in **Development** mode and test with your voice or simulator!

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
