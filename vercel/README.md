# Verona School Lunch Summarizer (Vercel & Alexa)

An AI-powered serverless webservice deployable to Vercel that fetches daily lunch menus from Health-e Pro for the Verona Area School District, filters out repetitive daily staples, uses Google Gemini to generate voice-optimized spoken summaries, and caches the day's results to minimize AI usage and costs.

---

## ⚡ Key Features

- **School Level Support:**
  - `ES`: Elementary Schools (`Country View`, `Glacier Edge`, `New Century`, `Stoner Prairie`, `Sugar Creek`, `VAIS`, `Core Charter K-5`)
  - `MS`: Middle Schools (`Badger Ridge`, `Savanna Oaks`, `Core Charter 6-8`) – merges Line 1 & Line 2
  - `HS`: High School (`Verona High School`) – merges Cafe & Pizza lines
- **Smart Filtering:** Automatically ignores everyday staples (daily milk cartons, repetitive wrap bars, standard tossed salads) and focuses on the day's rotating hot entrees and special treats.
- **Ultra Low-Cost AI:** Uses **`gemini-2.0-flash-lite`** (or `gemini-1.5-flash-8b`) via Google AI Studio. Provides 1,500 requests/day for **$0.00** on free tier, or ~$0.00003 per call on paid tier.
- **Intelligent Caching:** Automatically caches today's summary. Additional requests for the current day incur **zero AI cost** and return in milliseconds. Past and future date lookups are dynamically generated on demand.
- **Multi-Format Outputs:**
  - Standard JSON (for Alexa Skills, GitHub Actions, custom apps)
  - Amazon Alexa Flash Briefing Feed format
  - Plain text

---

## 🚀 Quick Start (Local Development)

1. Clone or navigate to this folder:
   ```bash
   cd vasd-lunch
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your Google Gemini API key:
   - Create `.env.local` based on `.env.example`:
     ```env
     GEMINI_API_KEY=your_key_from_aistudio.google.com
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser to test the interactive dashboard and listen to the speech preview.

---

## 🌐 API Endpoints

### 1. Main Lunch API (`/api/lunch`)
- **URL:** `GET /api/lunch`
- **Query Parameters:**
  - `level`: `ES` (default), `MS`, or `HS`
  - `date`: `YYYY-MM-DD` (defaults to today's date in Central Time)
  - `format`: `json` (default), `briefing`, or `text`

#### Examples:
```bash
# Get JSON summary for today's Elementary lunch
curl "https://your-domain.vercel.app/api/lunch?level=ES"

# Get Middle School lunch for October 5, 2026
curl "https://your-domain.vercel.app/api/lunch?level=MS&date=2026-10-05"

# Get plain text output
curl "https://your-domain.vercel.app/api/lunch?level=ES&format=text"
```

#### Sample JSON Response:
```json
{
  "date": "2026-10-05",
  "level": "ES",
  "levelName": "Elementary School (K-5)",
  "speechText": "Today for elementary lunch, the main hot entree is Bosco Sticks with marinara sauce, served with a vanilla frozen yogurt cup.",
  "summary": "Today for elementary lunch, the main hot entree is Bosco Sticks with marinara sauce, served with a vanilla frozen yogurt cup.",
  "cached": true,
  "generatedAt": "2026-09-23T04:47:00.000Z",
  "details": {
    "specialEntrees": ["Bosco Sticks"],
    "sides": ["Leafy Green Salad", "Fresh Vegetable Variety"],
    "treats": ["Vanilla Frozen Yogurt Cup"],
    "stapleEntrees": ["Soy Butter Alt Entrée", "Bagel Alt Entrée", "Yogurt/String Cheese/Goldfish Alt Entree"]
  }
}
```

---

### 2. Amazon Alexa Custom Skill Endpoint (`/api/alexa`)
- **URL:** `POST /api/alexa`
- **Invocation Name:** `v a s d lunch`
- **Features:** Full two-way voice skill allowing users to:
  - Say *"Alexa, open V A S D Lunch"* (prompts for elementary, middle, or high school).
  - Ask for specific dates: today, tomorrow, yesterday, Friday, or next week.
  - Multi-turn session memory remembering chosen school level.
- See full setup instructions in [`alexa/README.md`](../alexa/README.md).

---

### 3. Amazon Alexa Flash Briefing Feed (`/api/briefing`)
- **URL:** `GET /api/briefing?level=ES`
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
- **URL:** `GET /api/debug?level=ES&date=YYYY-MM-DD`
- Or via query param: `GET /api/lunch?level=ES&date=YYYY-MM-DD&format=raw`
- Returns the complete raw, scraped data directly from Health-e Pro with zero AI summarization, showing:
  - All raw items and categories scraped from the district menus
  - Identified special rotating entrees vs filtered daily staples
  - Item count statistics for easy debugging

```bash
curl "https://your-domain.vercel.app/api/debug?level=ES&date=2026-10-05"
```

---

## 🎙️ Setting Up Alexa Custom Skill ("V A S D Lunch")

See the dedicated [Alexa Custom Skill Setup Guide](../alexa/README.md) for full instructions on importing the interaction model, configuring the endpoint, and testing on Echo devices.

1. Go to the [Amazon Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Click **Create Skill** -> Name it (e.g. *"Verona School Lunch"*).
3. Select **Flash Briefing** model.
4. Under **Flash Briefing Feeds**, click **Add Feed**:
   - **Feed Name:** Verona Elementary Lunch (or Middle / High)
   - **Update Frequency:** Daily
   - **Content Type:** Text
   - **Feed URL:** `https://your-app.vercel.app/api/briefing?level=ES`
5. Save and test in the Alexa Developer Console Simulator or on your own Echo devices!

---

## 🤖 GitHub Actions Workflow Example

You can easily trigger this webservice from a scheduled GitHub Action (e.g., at 6:30 AM every weekday morning):

```yaml
name: Update Alexa Flash Briefing Cache

on:
  schedule:
    # 6:30 AM Central Time (11:30 UTC), Monday through Friday
    - cron: '30 11 * * 1-5'
  workflow_dispatch:

jobs:
  warm-lunch-cache:
    runs-on: ubuntu-latest
    steps:
      - name: Pre-fetch Elementary Lunch
        run: curl -s "https://your-app.vercel.app/api/lunch?level=ES"

      - name: Pre-fetch Middle School Lunch
        run: curl -s "https://your-app.vercel.app/api/lunch?level=MS"

      - name: Pre-fetch High School Lunch
        run: curl -s "https://your-app.vercel.app/api/lunch?level=HS"
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import your repository.
3. In the project settings, add the environment variable:
   - `GEMINI_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com/)
   - `GEMINI_MODEL`: `gemini-2.0-flash-lite` (optional, default)
4. Click **Deploy**.
