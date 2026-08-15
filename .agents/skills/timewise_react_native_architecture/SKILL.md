---
name: Timewise React Native Architecture
description: Applies the feature-first architecture, technology stack, and UI guidelines established for the Timewise React Native mobile application.
---

# Timewise Mobile Architecture

When working on the Timewise mobile application, follow these guidelines:

## Technology Stack
- **Framework:** React Native with Expo (latest)
- **Language:** TypeScript
- **Routing:** Expo Router
- **Styling:** NativeWind (Tailwind CSS) and standard StyleSheet
- **State Management:** Zustand, React Query (TanStack Query)
- **Forms & Validation:** React Hook Form, Zod
- **Storage:** React Native MMKV
- **Animations:** React Native Reanimated, React Native Gesture Handler
- **Network:** Axios

## Feature-First Architecture
Always adhere to the following directory structure inside the `src/` directory:
- `app/`: Expo Router pages and layouts.
- `components/`:
  - `ui/`: Reusable, generic UI components (e.g., Button, Input, Checkbox, Logo).
  - `common/`: Shared components across multiple features.
  - `forms/`: Form wrappers and complex inputs.
- `features/`: Feature-specific modules (e.g., `auth`, `dashboard`, `tasks`, `calendar`, `habits`).
  - Each feature should encapsulate its own `screens/`, `components/`, `api/`, and `store/` if applicable.
- `hooks/`: Global custom hooks.
- `services/`, `api/`: Global API logic and client instances.
- `lib/`: Third-party library initializations and configurations.
- `constants/`: App-wide constants and configurations.
- `theme/`: Theming tokens, colors, and typography.
- `types/`: Global TypeScript definitions.
- `assets/`: Static files (images, icons, svgs).

## Design & UI Guidelines
- **Aesthetics:** The app uses a premium dark theme. Backgrounds are primarily true black (`#000000`), with dark gray components (`#1f1f1f`) and high-contrast white text.
- **Typography:** Use sleek, bold headers. Input labels should be small (`11px`), uppercase, and widely letter-spaced (`1.2px`) with gray colors (e.g., `#9ca3af`).
- **Assets:** Always use the exact assets provided in the `assets/` folder (like `logo.png`) rather than recreating them with views, unless an SVG recreation is explicitly required for scaling.
- **Figma Integration:** When working from Figma, ensure exact pixel matching for border radii, spacing, and layout structures.
