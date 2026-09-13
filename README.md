# NetraX Dashboard

NetraX Dashboard is the React frontend for the NetraX passive network-threat analysis system. It provides a browser interface for uploading captured traffic, viewing the resulting analysis, and inspecting alerts and threat-model results.

The dashboard is a frontend only. Analysis requests are sent to the NetraX API, which is configured through `VITE_API_BASE_URL`.

## What it does

The dashboard currently includes:

- Traffic capture upload and analysis
- One-way traffic monitoring status
- Detection pipeline and threat-model views
- Alert list and alert details
- Traffic-analysis results
- Read-only network-path visualization
- Refresh and connection-status handling

The UI is designed around passive observation: the dashboard presents the results returned by the backend and does not itself capture packets or run the detection models. The frontend API client sends uploaded files to `/api/analyze`. fileciteturn886file0

## Tech stack

- React 19
- Vite 8
- JavaScript (ES modules)
- ESLint

The project scripts are:

```text
npm run dev      # local development server
npm run build    # production build
npm run lint     # ESLint checks
npm run preview  # preview the production build locally
```

These commands and dependencies are defined in `package.json`. fileciteturn883file0

## Requirements

Install:

- Node.js with npm
- A running NetraX backend for traffic-analysis requests

## Run locally

Clone the repository:

```bash
git clone https://github.com/Chetan-code-lrca/NetraX-dashboard.git
cd NetraX-dashboard
```

Install dependencies:

```bash
npm install
```

### Configure the API

The frontend reads the backend URL from `VITE_API_BASE_URL` and falls back to `http://localhost:8000` when the variable is not set. fileciteturn886file0

Create a local `.env` file when the backend is not running on that default address:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Do not commit `.env` files containing private credentials or internal service URLs.

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Production build

Build the dashboard with:

```bash
npm run build
```

To preview the built application locally:

```bash
npm run preview
```

The Vite configuration uses the React plugin and does not require a separate build command beyond the standard Vite scripts. fileciteturn889file0

## Backend connection

The frontend expects the NetraX backend to expose:

```text
POST /api/analyze
```

The uploaded capture is sent as multipart form data under the `file` field. A successful response is returned to the dashboard for rendering. Connection failures are surfaced as a backend-offline error in the UI. fileciteturn886file0

Because this repository contains only the frontend, cloning it by itself is enough to build the interface but not enough to run a real traffic analysis. The backend must be available at the configured API URL.

## Project structure

```text
NetraX-dashboard/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── AlertDetails.jsx
│   │   ├── DetectionPipeline.jsx
│   │   ├── Header.jsx
│   │   ├── NetworkPath.jsx
│   │   └── ...
│   └── services/
│       └── api.js
├── public/
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Linting

Run ESLint with:

```bash
npm run lint
```

Fix lint issues before committing changes.

## Deployment

The frontend can be deployed to a static/Vite-compatible host. The production environment must provide the correct `VITE_API_BASE_URL` at build time so the browser sends analysis requests to the deployed NetraX API rather than the local development default.

The frontend and backend are separate deployment units:

```text
Browser
   │
   ▼
NetraX Dashboard
   │  POST /api/analyze
   ▼
NetraX API
```

## Notes

The dashboard currently presents backend connection state explicitly. When the API is unavailable, analysis actions cannot produce live results because the frontend has no local packet-analysis engine of its own. fileciteturn886file0
