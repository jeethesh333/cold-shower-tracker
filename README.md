# Cold Shower Tracker

A modern web application to track your cold shower challenge progress, with features like streak tracking, milestones, and an AI chat assistant for motivation and support.

## Features

- 🚿 Track daily cold shower sessions
- 📊 Visual progress tracking
- 🏆 Achievement milestones
- 💬 AI-powered chat assistant
- ❄️ Beautiful snowfall effects
- 📱 Responsive design
- 📝 Session notes and reflections

## Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/cold-shower-tracker.git
cd cold-shower-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` and add your Gemini API key. You can get one at [Google AI Studio](https://makersuite.google.com/).

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `VITE_GEMINI_API_KEY`: Your Gemini API key for the chat assistant functionality

## Deployment

This project is configured for deployment on Vercel. Make sure to:

1. Set up the required environment variables in your Vercel project settings
2. Connect your repository to Vercel for automatic deployments

## Built With

- React
- TypeScript
- Vite
- Chakra UI
- Google Gemini AI
- Vercel

## License

MIT

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
