# Alexa NLU Evaluation & Annotation Sets

This directory contains test suites (annotation sets) for evaluating the Natural Language Understanding (NLU) model of the **Unofficial Verona Wisconsin School Lunch** skill.

Both **JSON** and **CSV** formats are provided for direct import into the **Alexa Developer Console NLU Evaluation** tool or third-party automated testing pipelines.

---

## 📁 Files Included

| File | Type | Description | Count | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| [`good-phrases.json`](./good-phrases.json) | JSON | Valid skill utterances & slot combinations | 38 | Routes to `GetLunchIntent`, `SeeMoreIntent`, `BackToMenuIntent`, or built-in intents with correct slots |
| [`good-phrases.csv`](./good-phrases.csv) | CSV | Spreadsheet version of valid utterances | 38 | Same as above |
| [`jibberish-phrases.json`](./jibberish-phrases.json) | JSON | Out-of-domain, gibberish & noise phrases | 33 | Routes to `AMAZON.FallbackIntent` (no meal/menu action executed) |
| [`jibberish-phrases.csv`](./jibberish-phrases.csv) | CSV | Spreadsheet version of jibberish phrases | 33 | Same as above |

---

## 🎯 Coverage Breakdown

### 1. Good Phrases Set (`good-phrases.json` / `.csv`)
Tests all supported interaction pathways:
* **One-Shot Full Queries**: School level + meal type + date (e.g., *"what's the menu for tomorrow for elementary"*, *"what are they having for lunch next week for middle school"*).
* **Grade-Level Synonyms**: K–5, 6–8, 9–12, VAHS, Sugar Creek.
* **Meal Resolution Rules**:
  * Asking specifically for *"lunch"* -> `mealType = lunch`
  * Asking specifically for *"breakfast"* -> `mealType = breakfast`
  * Asking for *"the menu"* or *"both"* -> `mealType = both` (returns both breakfast & lunch)
* **Date Variety**: `"today"`, `"tomorrow"`, `"yesterday"`, `"next week"`, `"on october fifth"`, `"Friday"`.
* **Partial Queries / Slot Filling Wizard**:
  * Missing date (e.g., *"what's for lunch at elementary school"*)
  * Missing school (e.g., *"what's for lunch today"*)
  * Single slot wizard inputs (e.g., *"elementary"*, *"high school"*, *"lunch"*, *"today"*)
* **APL Touch & Voice Navigation**:
  * Photo gallery browsing: *"see more"*, *"show photos"*, *"view pictures"*, *"photo gallery"* (`SeeMoreIntent`)
  * Returning to menu: *"back"*, *"back to menu"*, *"show the dinner menu"* (`BackToMenuIntent`)
* **Standard Built-In Intents**:
  * `AMAZON.HelpIntent` (*"help"*)
  * `AMAZON.CancelIntent` (*"cancel"*)
  * `AMAZON.StopIntent` (*"stop"*)

### 2. Jibberish & Negative Set (`jibberish-phrases.json` / `.csv`)
Ensures off-topic speech is safely ignored or caught by `AMAZON.FallbackIntent`:
* **Phonetic Babble & Keyboard Mashes**: *"asdf jkl semicolon qwerty"*, *"blip blop beep boop zorp"*, *"skibidi toilet rizz"*.
* **Smart Home / Device Controls**: *"turn off the living room lights"*, *"set a timer for ten minutes"*, *"play music on Spotify"*, *"what's the weather in Seattle"*.
* **Commercial Fast Food Orders**: *"order a large pepperoni pizza from domino's"*, *"can I get a big mac and fries"*, *"how much does a chipotle burrito cost"*.
* **Non-Cafeteria School Queries**: *"who won the high school football game last night"*, *"what time does the school bus arrive"*, *"who is the high school principal"*.
* **Conversational Ambient Chatter**: *"um yeah whatever"*, *"testing one two three is this thing on"*, *"tell me a joke"*, *"flip a coin"*.

---

## 🚀 How to Run NLU Evaluation in Alexa Developer Console

### Step 1: Open the Console
1. Navigate to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Click on **Unofficial Verona Wisconsin School Lunch**.
3. Go to the **Build** tab at the top.

### Step 2: Upload the Annotation Set
1. In the left navigation menu, expand **Tools** and select **NLU Evaluation** (or **Annotation Sets**).
2. Click **Create Annotation Set** (in the top right).
3. Name your set:
   * Example: `VASD-Valid-Phrases` or `VASD-Jibberish-Fallback`
4. Choose **Upload File**:
   * Select `good-phrases.csv` (or `.json`) for valid queries.
   * Select `jibberish-phrases.csv` (or `.json`) for jibberish queries.
5. Click **Save**.

### Step 3: Run the Evaluation
1. Find your uploaded annotation set in the list.
2. Click **Run** (or select the set and choose **Run Evaluation**).
3. Select the stage to evaluate: **Development**.
4. The evaluation will run across your trained interaction model.

### Step 4: Analyze the Results
* **Pass Rate / Accuracy**: High percentage indicates strong voice recognition.
* **Intent Misclassifications**: Highlights if any utterance routed to the wrong intent.
* **Slot Mismatches**: Confirms if entity values (e.g. `elementary`, `lunch`, `tomorrow`) resolved to the expected slot values.
* **Fallback Verification**: Confirms that 100% of phrases in `jibberish-phrases` route to `AMAZON.FallbackIntent`.
