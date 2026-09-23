# Verona Area School District (VASD) Lunch Summarizer & Alexa Skill

A voice and web service that fetches daily and weekly school lunch menus for the Verona Area School District (VASD) from Health-e Pro, filters out daily staples, uses Google Gemini to generate voice-optimized spoken announcements, and provides multi-format outputs:
- **Amazon Alexa Custom Skill:** Invocation `"v a s d lunch"` with interactive dialog and multi-turn support.
- **Amazon Alexa Flash Briefing Feed:** Daily text briefing feed for Echo devices.
- **Interactive Web UI:** Next.js dashboard with voice playback preview.
- **REST API:** JSON and plain text endpoints with edge caching.

---

## 📂 Repository Structure

- [`vercel/`](vercel/): The Next.js web application and serverless API backend, ready to deploy to Vercel.
  - `/api/alexa`: Alexa Custom Skill HTTPS endpoint (`POST`)
  - `/api/lunch`: Main JSON / text lunch API with date and week support (`GET`)
  - `/api/briefing`: Alexa Flash Briefing feed (`GET`)
  - `/api/debug`: Raw menu data endpoint (`GET`)
- [`alexa/`](alexa/): Complete Amazon Alexa Custom Skill package and setup instructions.
  - `interactionModels/custom/en-US.json`: Interaction model for `"v a s d lunch"`
  - `skill.json`: Alexa Skill manifest
  - `README.md`: Step-by-step setup guide for the Amazon Alexa Developer Console

---

## 🎙️ Alexa Skill Quick Start

1. Deploy the `vercel/` project to Vercel (or your custom domain).
2. Go to the [Amazon Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) and create a **Custom Skill** named `V A S D Lunch`.
3. In **Interaction Model -> JSON Editor**, paste [`alexa/interactionModels/custom/en-US.json`](alexa/interactionModels/custom/en-US.json) and click **Build Model**.
4. In **Endpoint**, set HTTPS to `https://<your-vercel-domain>.vercel.app/api/alexa` with the Wildcard Certificate option.
5. In the **Test** tab (Development mode), test commands like:
   - *"open v a s d lunch"*
   - *"ask v a s d lunch what's for lunch tomorrow for elementary school"*
   - *"ask v a s d lunch what's for lunch next week for high school"*

For detailed instructions, see [`alexa/README.md`](alexa/README.md).
