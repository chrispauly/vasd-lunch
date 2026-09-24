# Alexa Presentation Language (APL) Models for Verona School Lunch

This folder contains the complete, responsive multimodal Alexa Presentation Language (APL) documents and sample datasources for the **Verona School Lunch** skill.

The skill detects when an Echo Show or Fire TV device is in use (`context.System.device.supportedInterfaces['Alexa.Presentation.APL']`) and automatically renders tailored visual layouts with high-resolution food photography pulled directly from the Verona Area School District's Health-e Pro platform.

---

## 📱 Device Profiles & Responsive Layouts

The single APL document (`menu-document.json`) dynamically adapts to all Amazon Echo screen sizes using APL 2023.3 viewport conditional expressions:

### 1. Small Screens: Echo Show 5 & Echo Spot
- **Viewport Profiles:** `@hubSmall` (960×480), `@hubRound` (480×480), or width < 1000dp.
- **Visual Design:**
  - **Hero Main Course Spotlight**: Large, crisp photograph of the day's primary rotating entree (e.g., *Mini Corn Dogs*, *Bosco Sticks*, *Cinnamon French Toast Sticks*).
  - **Quick Glance Information**: VASD Paw logo, School Level badge (*Elementary K-5*), Meal Type (*Lunch* or *Breakfast*), and large bold title.
  - **Category & Item Count**: Clear pill badge indicating the total number of items served today.
  - **Contrast & Legibility**: High-contrast typography designed to be easily read from across the bedside table or desk.

### 2. Medium Screens: Echo Show 8
- **Viewport Profile:** `@hubMedium` (1280×800).
- **Visual Design:**
  - **Split Dual-Pane Experience**:
    - **Left Hero Card (40% width)**: Full-featured card with large food photo, "FEATURED ENTRÉE" badge, entree name, allergen tags (Eggs, Milk, Soy, Wheat), and date banner.
    - **Right Interactive Column (60% width)**: Vertical touch-scrollable `Sequence` displaying every item served today.
  - **Touch & Scroll Ability**: Users can swipe or scroll through all alternative entrees (Soy Butter Alt, Bagel Alt, Yogurt Box), vegetable sides (Baked Beans, Green Salad), fresh fruits, juices, and milks with individual thumbnail photos and food group tags.

### 3. Large Screens & TVs: Echo Show 10, Echo Show 15 & Fire TV
- **Viewport Profiles:** `@hubLarge`, `@hubExtraLarge` (1920×1080), `@tvLandscape`.
- **Visual Design:**
  - **Widescreen Command Center**:
    - **Top Header Bar**: VASD Wildcat logo, school district banner, school level badge, and date.
    - **Top Featured Entrée Banner**: High-resolution wide photograph of the main course with Gemini speech description snippet and allergen indicators.
    - **Bottom Full-Menu Carousel**: Horizontal touch-scrollable gallery cards (260dp wide each) showcasing every item served today with full-width food photos, food group tags, and titles.
  - **Full Touch Interactivity**: Designed for wall-mounted kitchen hubs where parents and students can browse the daily menu at their own pace.

### 4. 5-Day Weekly Forecast View (`buildWeeklyAplDocument()`)
- Displayed when a user asks for weekly menus (e.g., *"Alexa, ask Verona School Lunch what's the menu next week"*).
- Presents a 5-day horizontal card sequence (Monday through Friday) showing each day's date, featured entree, and photo.

---

## 🎨 Files in this Directory

| File | Purpose |
| :--- | :--- |
| [`menu-document.json`](menu-document.json) | The standalone APL document JSON for daily menus. Compatible with APL 1.6+ and 2023.3. |
| [`sample-datasource.json`](sample-datasource.json) | Sample datasource containing real Health-e Pro CloudFront image URLs for local testing and simulator preview. |

---

## 🧪 Testing in the Alexa Developer Console

1. Open the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Select your **Verona School Lunch** skill.
3. Click on the **Multimodal** tab (or **APL** in the left sidebar) $\rightarrow$ **Authoring Tool**.
4. Click **Create Document** $\rightarrow$ **Start from scratch**.
5. Paste the contents of [`menu-document.json`](menu-document.json) into the document editor.
6. In the **Data** pane (bottom-left), paste the contents of [`sample-datasource.json`](sample-datasource.json).
7. Use the device selector dropdown in the top bar to switch between:
   - **Echo Show 5** (Small Landscape)
   - **Echo Show 8** (Medium Landscape)
   - **Echo Show 10** (Large Landscape)
   - **Echo Show 15** (Extra Large Landscape)
   - **Fire TV 1080p** (TV Landscape)
8. Verify the responsive layouts and touch scrolling in the simulator!
