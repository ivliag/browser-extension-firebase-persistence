# Browser Extension Firebase Persistence

A custom Firebase persistence implementation for browser extensions that stores authentication data in Chrome storage.

## Purpose

This library provides a custom [Firebase Auth state persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence) solution specifically designed for browser extension contexts.

Browser extensions have unique requirements when it comes to sharing authentication state across different origins. Traditional web storage mechanisms don't work across extension contexts, making it necessary to use [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) to persist and share Firebase authentication data between different parts of the extension.

## Installation

```bash
npm install browser-extension-firebase-persistence
```

## Usage

```javascript
import { createBrowserExtensionPersistence } from 'browser-extension-firebase-persistence';
import { initializeAuth } from '@firebase/auth';

const browserStoragePersistence = createBrowserExtensionPersistence();

const auth = initializeAuth(firebaseApp, {
  persistence: browserStoragePersistence
});
```

## Why This Is Needed

In browser extensions, Firebase authentication data needs to be shared between:
- Content scripts
- Background scripts
- Popup pages
- Options pages

Chrome Storage is the only reliable way to share this authentication state across all these contexts, as regular web storage (localStorage, sessionStorage) is isolated per origin and not accessible across extension components.
