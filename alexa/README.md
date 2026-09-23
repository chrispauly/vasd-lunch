# 🎙️ Verona School Lunch – Alexa Custom Skill Setup Guide

This guide walks you through setting up the **"Verona School Lunch"** Alexa Custom Skill using the Amazon Developer Console so you can talk to Alexa on any Echo device or the Alexa app.

---

## 📋 Features

- **Invocation Name:** `verona school lunch` (natural, crystal-clear spoken words).
- **Conversational Launch:**
  - *"Alexa, open Verona School Lunch"*
  - Alexa asks: *"Welcome to Verona School Lunch! Would you like the lunch menu for elementary, middle, or high school?"*
  - You answer: *"Elementary"* (or *"Middle school for tomorrow"*, etc.)
- **One-Shot Direct Invocations:**
  - *"Alexa, ask Verona School Lunch what's for lunch today for elementary school"*
  - *"Alexa, ask Verona School Lunch what's for lunch tomorrow for middle school"*
  - *"Alexa, ask Verona School Lunch what's for lunch next week for high school"*
  - *"Alexa, ask Verona School Lunch what was for lunch yesterday for elementary school"*
- **Timeframes Supported:**
  - `today`
  - `tomorrow`
  - `yesterday`
  - `next week` (speaks Monday through Friday hot entrees)
  - `this week`
  - Specific days (e.g. `Friday`, `next Monday`, or exact dates)
- **School Levels:**
  - Elementary Schools (K-5)
  - Middle Schools (6-8)
  - High School (9-12)

---

## 🚀 Step-by-Step Setup

### Step 1: Deploy or Run Your Vercel App
Your Alexa custom skill endpoint is hosted directly on your Vercel deployment:
- **Endpoint URL:** `https://vasd-lunch.vercel.app/api/alexa`

---

### Step 2: Create or Update the Skill in Amazon Developer Console

1. Navigate to the [Amazon Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Sign in with the **same Amazon account** you use on your Echo devices or Alexa mobile app.
3. Open your skill (or click **Create Skill** with name `Verona School Lunch`).

---

### Step 3: Update the Interaction Model

1. In the skill editor, on the left navigation under **Interaction Model**, click **JSON Editor**.
2. Open the file [`alexa/interactionModels/custom/en-US.json`](interactionModels/custom/en-US.json) from this repository.
3. Copy its entire JSON contents and paste it into the JSON Editor in the Alexa Developer Console (notice `"invocationName": "verona school lunch"`).
4. Click **Save Model** at the top.
5. Click **Build Model**. Wait 15–30 seconds until the build completes with a green success notification.

---

### Step 4: Configure the HTTPS Endpoint

1. In the left navigation, click **Endpoint**.
2. Select **HTTPS**.
3. Under **Default Region**, enter your Vercel URL:
   ```
   https://vasd-lunch.vercel.app/api/alexa
   ```
4. In the SSL certificate dropdown below it, choose:
   - **"My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority"**
5. Click **Save Endpoints** at the top.

---

### Step 5: Test the Skill

1. Click on the **Test** tab at the top of the Alexa Developer Console.
2. In the top-left dropdown where it says *"Skill testing is enabled in:"*, change it from **Off** to **Development**.
3. In the input box, type:
   ```text
   open verona school lunch
   ```

#### Test Scenarios:

**Scenario A: Interactive Invocation**
> **You:** `open verona school lunch`
>
> **Alexa:** `Welcome to Verona School Lunch! Would you like the lunch menu for elementary, middle, or high school?`
>
> **You:** `elementary`
>
> **Alexa:** `Today for elementary lunch, the main hot entree is...`

**Scenario B: Tomorrow's Middle School Lunch**
> **You:** `ask verona school lunch what's for lunch tomorrow for middle school`
>
> **Alexa:** `Tomorrow for Middle School (6-8) lunch, ...`

**Scenario C: Next Week's High School Lunch**
> **You:** `ask verona school lunch what's for lunch next week for high school`
>
> **Alexa:** `Here is the lunch menu for High School (9-12): on Monday, ...; on Tuesday, ...; on Wednesday, ...; on Thursday, ...; on Friday, ...`

**Scenario D: Yesterday's Lunch**
> **You:** `ask verona school lunch what was for lunch yesterday for elementary school`
>
> **Alexa:** `Yesterday for Elementary School (K-5) lunch, ...`

---

## 📱 Using on your Physical Echo Devices

Because you created the skill with the same Amazon account registered to your Echo / Alexa devices, the skill is **automatically available in Development mode on your physical Echo speakers**:
- Just say: **"Alexa, open Verona School Lunch"** to your Echo speaker!
