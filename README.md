# Tiny Robot Chat Demo

A simple chat demo built with [@opentiny/tiny-robot](https://www.npmjs.com/package/@opentiny/tiny-robot), Vue 3 and Vite.

## Tech Stack

- **Vue 3** + **TypeScript** + **Vite**
- **@opentiny/tiny-robot** – Chat UI components (bubble list, sender)
- **@opentiny/tiny-robot-kit** – `useMessage` hook, SSE streaming
- **@opentiny/tiny-robot-svgs** – Icons
- **OpenAI-compatible API** – LLM backend (DeepSeek, Qwen, etc.)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` , add your API key and API URL:

   ```txt
   VITE_API_URL=your_api_url
   VITE_API_KEY=your_api_key
   ```

   for example:

   ```txt
   VITE_API_URL=https://api.deepseek.com/chat/completions
   VITE_API_KEY=sk-xxxx
   ```

3. Run dev server:

   ```bash
   pnpm dev
   ```

4. Build for production:

   ```bash
   pnpm build
   ```
