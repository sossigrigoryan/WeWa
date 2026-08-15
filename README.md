# WeWa

## AI Sustainable Wardrobe Assistant

> **Fall in love with your wardrobe again.**

**WeWa** is an AI-powered Telegram wardrobe assistant designed to help people organize, understand, and make better use of the clothes they already own.

Instead of encouraging constant shopping, WeWa starts with a different question:

> **What can you do with the wardrobe you already have?**

The project combines AI-powered image analysis, digital wardrobe management, personalization, and conscious-consumption principles in a practical everyday assistant.

---

## Mission

To help people rediscover the value of their existing wardrobe and use artificial intelligence to make wardrobe management easier, more personal, and more sustainable.

Two principles guide the product:

> **AI suggests. The user decides.**

> **Use what you already own before buying more.**

---

## The Problem

Many people know the feeling:

> **“My wardrobe is full, but I have nothing to wear.”**

The problem is often not simply a lack of clothes. People may:

- forget what they already own;
- repeatedly wear only a small part of their wardrobe;
- struggle to make use of individual items;
- buy items similar to things they already have;
- spend unnecessary time deciding what to wear;
- keep difficult or sentimental items without knowing what to do with them.

A wardrobe is personal. It reflects a person's lifestyle, work, habits, preferences, memories, and history. WeWa is designed around that reality rather than around replacing an existing wardrobe with a generic trend-based one.

---

## The Solution

WeWa creates a digital representation of the user's real wardrobe.

In the current MVP, a user can send a photo of a clothing item to the Telegram bot. AI analyzes the image, extracts structured characteristics, and stores the item in the user's digital wardrobe.

The long-term direction is to make the wardrobe itself more useful: easier to manage, explore, combine, and understand.

---

## Current MVP

The following functionality is implemented:

- Telegram-based user interaction;
- user identification through Telegram ID;
- multilingual interface in **English, Russian, and Armenian**;
- persistent language preference;
- clothing photo upload;
- AI-powered image analysis;
- automatic identification of clothing characteristics including category, color, material, and style;
- structured storage of wardrobe items;
- digital wardrobe browsing;
- graceful fallback when AI analysis fails — the item can still be saved;
- centralized error handling and logging;
- rate limiting;
- automated tests for key application behavior.

The MVP intentionally focuses on a small, stable core rather than attempting to implement the complete product vision at once.

---

## How AI Analysis Works

```text
User sends clothing photo
          |
          v
Telegram Bot
          |
          v
Bot Handler
          |
          v
Wardrobe Service
       /       \
      v         v
 AI Client    Prisma
      |         |
      v         v
Gemini API   SQLite
      |
      v
Structured clothing attributes
```

The AI integration is isolated behind a dedicated client, separating external AI communication from wardrobe business logic. This makes the application easier to maintain and allows the AI model or compatible provider to be changed without redesigning the entire system.

AI responses are requested in structured JSON format and validated before being stored.

---

## Technology Stack

- **JavaScript** — ES Modules
- **Node.js**
- **grammY** — Telegram Bot framework
- **Google Gemini API** — multimodal clothing analysis
- **OpenAI JavaScript SDK** — OpenAI-compatible Gemini API client
- **Prisma ORM**
- **SQLite**
- **Zod** — configuration and validation
- **Pino** — application logging
- **Vitest** — automated testing
- **dotenv**
- **Git / GitHub**

---

## Project Structure

```text
src/
├── bot/
│   ├── handlers/
│   └── keyboards/
├── common/
├── config/
├── lib/
├── locales/
├── modules/
├── repositories/
├── services/
└── utils/

prisma/
tests/
uploads/
```

The project follows a modular structure that separates Telegram interaction, business logic, data access, AI integration, configuration, and localization.

---

## Product Principles

- **Existing wardrobe first.** Help users get more value from clothes they already own.
- **AI suggests; the user decides.** AI-generated information should remain subject to user correction and control.
- **Personal context matters.** A useful wardrobe assistant should reflect the user's real life rather than generic fashion rules.
- **Low-friction interaction.** Managing a wardrobe should require as little unnecessary manual work as possible.
- **Graceful failure.** A temporary AI failure should not prevent basic wardrobe functionality.
- **Modular architecture.** External services should be replaceable without rewriting the whole application.
- **Conscious consumption.** The product is designed to encourage better use of existing clothing rather than unnecessary consumption.

---

## Roadmap

Future development directions include:

- advanced wardrobe management and user-editable item attributes;
- richer AI-powered wardrobe assistance and personalization;
- outfit planning and wardrobe-based recommendations;
- travel-oriented wardrobe assistance;
- flexible item import and wardrobe organization;
- wardrobe-based shopping assistance;
- personal wardrobe insights;
- sustainable reuse and circular-wardrobe functionality;
- web and mobile experiences.

Detailed product concepts and feature specifications are maintained privately.

---

## Getting Started

### Prerequisites

To run the project locally you need:

- Node.js;
- npm;
- a Telegram bot token created through BotFather;
- a Gemini API key.

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd WeWa
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file based on `.env.example`.

Example:

```env
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DATABASE_URL="file:./dev.db"

AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-3.6-flash
AI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/openai/

ADMIN_TELEGRAM_ID=
LOG_LEVEL=info
```

Never commit the real `.env` file or API keys to the repository.

Prepare the Prisma database as required by the project configuration, then start the development server:

```bash
npm run dev
```

---

## Tests

Run the automated test suite with:

```bash
npm test
```

The test suite covers key application behavior including wardrobe handling, error handling, and rate limiting.

---

## Current Status

**Stage: Working Portfolio MVP**

### Implemented

- ✅ Digital wardrobe
- ✅ Clothing photo upload
- ✅ Gemini-powered image analysis
- ✅ Structured AI output
- ✅ English / Russian / Armenian interface
- ✅ Persistent user language
- ✅ Modular application architecture
- ✅ Database persistence
- ✅ Error handling and logging
- ✅ Rate limiting
- ✅ Automated tests

---

## About the Project

WeWa is an independently developed MVP and portfolio project exploring how AI can support practical wardrobe management and more conscious clothing consumption.

It began as a development project, but its product direction is broader than a technical demonstration. The long-term vision is a personal wardrobe assistant that understands what a user already owns and helps them make better use of it.

---

> **Fall in love with your wardrobe again.**
