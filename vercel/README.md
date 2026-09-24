# Verona School Lunch & Breakfast Summarizer (Vercel & Alexa)

An AI-powered serverless webservice deployable to Vercel that fetches daily and weekly breakfast and lunch menus from Health-e Pro for the Verona Area School District (VASD), filters out repetitive staples, uses Google Gemini to generate natural voice-optimized spoken summaries, and caches results to minimize AI usage and costs.

---

## ⚡ Key Features

- **Breakfast, Lunch, or Both Combined:**
  - Query breakfast only (`meal=breakfast` or `/api/breakfast`)
  - Query lunch only (`meal=lunch` or `/api/lunch`)
  - Query both meals together in one unified summary (`meal=both` or `/api/menu`)
- **School Level Support:**
  - `ES`: Elementary Schools (`Country View`, `Glacier Edge`, `New Century`, `Stoner Prairie`, `Sugar Creek`, `VAIS`, `Core Charter K-5`)
  - `MS`: Middle Schools (`Badger Ridge`, `Savanna Oaks`, `Core Charter 6-8`) – merges Line 1 & Line 2
  - `HS`: High School (`Verona High School`) – merges Cafe & Pizza lines
- **Flexible Date & Forecast Options:**
  - Single day queries: `today`, `tomorrow`, `yesterday`, or any specific date (`YYYY-MM-DD`).
  - Full school week forecasts: `next week`, `this week`, or ISO week format (`YYYY-Www`).
- **Smart Filtering:** Automatically ignores everyday staples (daily milk cartons, repetitive wrap bars, standard condiments) and focuses on the day's rotating hot entrees and special treats.
- **Ultra Low-Cost AI:** Uses **`gemini-2.5-flash-lite`** (or `gemini-2.0-flash-lite`) via Google AI Studio. Provides free tier usage, or ~$0.00003 per call on pay-as-you-go.
- **Intelligent In-Memory Caching:** Automatically caches today's summary per school level and meal type. Additional requests for the current day return instantly at **zero AI cost**.
- **Multi-Format Outputs:**
  - Standard JSON (for Alexa Skills, GitHub Actions, custom apps)
  - Amazon Alexa Flash Briefing Feed format
  - Plain text

---

## 🚀 Quick Start (Local Development)

1. Clone or navigate to the `vercel` folder:
   ```bash
   cd vercel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your Google Gemini API key:
   - Create `.env.local` based on `.env.example`:
     ```env
     GEMINI_API_KEY=your_key_from_aistudio.google.com
     GEMINI_MODEL=gemini-2.5-flash-lite
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser to test the interactive dashboard, explore dates/levels/meals, and listen to the speech preview.

---

## 🌐 API Endpoints

### 1. Main Unified Menu API (`/api/menu`)
- **URL:** `GET /api/menu`
- **Query Parameters:**
  - `meal`: `both` (default), `lunch`, or `breakfast`
  - `level`: `ES` (default), `MS`, or `HS`
  - `date`: `YYYY-MM-DD` or `YYYY-Www` (defaults to today's date in Central Time)
  - `format`: `json` (default), `briefing`, or `text`

#### Dedicated Shorthand Endpoints:
- `GET /api/lunch` (alias for `/api/menu?meal=lunch`)
- `GET /api/breakfast` (alias for `/api/menu?meal=breakfast`)

#### Examples:
```bash
# Get combined breakfast and lunch for today's Elementary school
curl "https://your-domain.vercel.app/api/menu?level=ES"

# Get lunch only for Middle School tomorrow
curl "https://your-domain.vercel.app/api/lunch?level=MS&date=2026-10-06"

# Get breakfast only for High School
curl "https://your-domain.vercel.app/api/breakfast?level=HS"

# Get next week's full school week forecast
curl "https://your-domain.vercel.app/api/menu?level=ES&date=2026-W41"

# Get plain text output
curl "https://your-domain.vercel.app/api/lunch?level=ES&format=text"
```

#### Sample JSON Response:
```json
{
  "date": "2026-10-05",
  "level": "ES",
  "levelName": "Elementary School (K-5)",
  "mealType": "both",
  "type": "day",
  "speechText": "Here is today's menu for elementary school. For breakfast, the hot entree is Cinnamon French Toast Sticks. For lunch, the main hot entree is Bosco Sticks with marinara sauce, served with a vanilla frozen yogurt cup.",
  "summary": "Here is today's menu for elementary school. For breakfast, the hot entree is Cinnamon French Toast Sticks. For lunch, the main hot entree is Bosco Sticks with marinara sauce, served with a vanilla frozen yogurt cup.",
  "cached": true,
  "generatedAt": "2026-09-24T12:00:00.000Z",
  "details": {
    "breakfast": {
      "specialEntrees": ["Cinnamon French Toast Sticks"],
      "sides": ["100% Apple Juice", "Applesauce Cup"]
    },
    "lunch": {
      "specialEntrees": ["Bosco Sticks"],
      "sides": ["Leafy Green Salad", "Fresh Vegetable Variety"],
      "treats": ["Vanilla Frozen Yogurt Cup"]
    }
  }
}
```

---

### 2. Amazon Alexa Custom Skill Endpoint (`/api/alexa`)
- **URL:** `POST /api/alexa`
- **Invocation Name:** `verona school lunch`
- **Features:** Full two-way voice skill allowing users to:
  - Say *"Alexa, open Verona School Lunch"* (prompts for elementary, middle, or high school).
  - Ask for breakfast, lunch, or both: *"What's for breakfast tomorrow?"*, *"What's for lunch?"*, *"What's the menu next week?"*
  - Full multi-turn session memory remembering school level.
- See full setup instructions in [`alexa/README.md`](../alexa/README.md).

---

### 3. Amazon Alexa Flash Briefing Feed (`/api/briefing`)
- **URL:** `GET /api/briefing?level=ES&meal=lunch`
- Returns Amazon's official Flash Briefing JSON format:
```json
{
  "uid": "urn:uuid:lunch-ES-2026-10-05",
  "updateDate": "2026-10-05T00:00:00.0Z",
  "titleText": "Today's Elementary School (K-5) Lunch",
  "mainText": "Today for elementary lunch, the main hot entree is Bosco Sticks with marinara sauce, served with a vanilla frozen yogurt cup.",
  "redirectionUrl": "https://menus.healthepro.com/organizations/3368"
}
```

---

### 4. Raw Data Debug Endpoint (`/api/debug`)
- **URL:** `GET /api/debug?level=ES&date=YYYY-MM-DD&meal=both`
- Returns raw scraped data directly from Health-e Pro with zero AI summarization, showing parsed entrees, staples, and sides.

---

## 🔒 Security Best Practices

- **Zero Secret Leakage:** `GEMINI_API_KEY` is strictly server-side and never exposed to client bundles.
- **SSRF & Input Defense:** `level`, `meal`, and `date` parameters are strictly validated and allowlisted before reaching backend fetch logic.
- **Prompt Injection Defense:** Scraped data consists of structured strings from official district menus mapped into strict schemas.
- **Safe Environment Fallback:** Graceful fallback response when API keys are absent or services are unreachable.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the repository (set root directory to `vercel` if prompted).
3. In the project settings, add the environment variables:
   - `GEMINI_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com/)
   - `GEMINI_MODEL`: `gemini-2.5-flash-lite` (optional, default)
4. Click **Deploy**.
