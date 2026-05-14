# URL Redirect Service

A lightweight, purely frontend URL redirection service hosted on GitHub Pages.

## How It Works

This service uses GitHub Pages' built-in 404 handling to power redirects. When a user visits a path like `/redirect-test/google`, GitHub Pages serves `404.html` (since no matching file exists), which then looks up the path in `redirects.json` and performs a client-side redirect.

## Quick Start

1. **Configure redirects** — edit `redirects.json`:

```json
{
  "redirects": {
    "google": "https://www.google.com",
    "docs": "https://docs.example.com",
    "my-link": "https://destination.example.com/page"
  }
}
```

2. **Set up Google Analytics** — replace `G-XXXXXXXXXX` in `redirects.json` with your GA4 Measurement ID:

```json
{
  "settings": {
    "googleAnalyticsId": "G-YOUR-ID-HERE"
  }
}
```

3. **Push to `main`** — the GitHub Actions workflow automatically deploys to GitHub Pages.

## Usage

| URL | Action |
|-----|--------|
| `https://<user>.github.io/redirect-test/` | Dashboard showing all redirects |
| `https://<user>.github.io/redirect-test/google` | Redirects to https://www.google.com |
| `https://<user>.github.io/redirect-test/<path>` | Redirects based on config |

## Configuration

All configuration lives in `redirects.json`:

| Field | Description |
|-------|-------------|
| `redirects` | Object mapping short paths to destination URLs |
| `settings.googleAnalyticsId` | GA4 Measurement ID for analytics tracking |
| `settings.defaultRedirect` | Fallback URL for unconfigured paths (optional) |
| `settings.redirectDelay` | Delay in milliseconds before redirecting (default: `0`) |

## Analytics

Google Analytics tracks each redirect as a custom event:

- **Event name:** `redirect`
- **Category:** `navigation`
- **Label:** the short path (e.g., `google`)
- **Custom parameter:** `redirect_destination` with the target URL

## GitHub Pages Setup

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on every push to `main`. To enable it:

1. Go to **Settings → Pages** in this repository
2. Under **Build and deployment**, select **GitHub Actions** as the source
