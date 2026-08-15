# ⏱ Timewise

A premium productivity mobile app built with **React Native** and **Expo**. Timewise helps you manage tasks, build habits, and visualise your progress — all wrapped in a sleek, dark-themed UI.

<div align="center">
  <!-- Replace the src below with your actual GIF URL or local path -->
  <img src="./assets/demo.gif" alt="Timewise App Demo" width="300" />
</div>
---

## ✨ Features

| Feature | Description |
|---|---|
| **Task Manager** | Create, edit, complete and delete tasks with priorities, dates, times and subtasks |
| **Habit Tracker** | Build daily habits, track streaks and view a 7-day completion history |
| **Calendar View** | Visualise your scheduled tasks on a monthly calendar |
| **Statistics** | See weekly/monthly completion rates, focus hours and productivity trends |
| **AI Assistant** | (Preview) Conversational assistant UI for schedule insights |
| **Authentication** | Firebase email/password auth with persistent sessions |
| **User Profile** | Editable display name and email |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev) 0.81 + [Expo](https://expo.dev) ~54 |
| Language | TypeScript ~5.9 |
| Navigation | React Navigation v7 (Native Stack + Bottom Tabs) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) v5 with AsyncStorage persistence |
| Backend / Auth | [Firebase](https://firebase.google.com/) v12 (Authentication) |
| Animations | React Native Reanimated ~4, React Native Gesture Handler ~2 |
| Icons | [Lucide React Native](https://lucide.dev/) |
| Date Picker | `@react-native-community/datetimepicker` |
| Calendar | `react-native-calendars` |
| Bottom Sheet | `@gorhom/bottom-sheet` |
| Haptics | `expo-haptics` |

---

## 📂 Project Structure

```
timewise/
├── assets/                  # App icons, splash, favicon
├── src/
│   ├── components/
│   │   └── ui/              # Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Header.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingScreen.tsx
│   │       └── Logo.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   └── screens/     # Login, Register, ForgotPassword
│   │   ├── tasks/
│   │   │   ├── screens/     # TasksScreen (Today / Upcoming / Past / All / Inbox tabs)
│   │   │   └── components/  # AddTaskModal
│   │   ├── habits/
│   │   │   ├── screens/     # HabitsScreen with streak tracking
│   │   │   └── components/  # AddHabitModal
│   │   ├── calendar/
│   │   │   └── screens/     # CalendarScreen
│   │   ├── statistics/
│   │   │   └── screens/     # StatisticsScreen with animated charts
│   │   ├── assistant/
│   │   │   └── screens/     # AssistantScreen (preview UI)
│   │   └── profile/
│   │       ├── screens/     # ProfileScreen
│   │       └── components/  # EditProfileModal
│   ├── navigation/
│   │   ├── RootNavigator.tsx  # Auth gate (Firebase onAuthStateChanged)
│   │   └── MainTabNavigator.tsx  # Custom bottom tab bar
│   ├── store/
│   │   └── useStore.ts      # Global Zustand store (tasks, habits, profile)
│   └── lib/
│       └── firebase.ts      # Firebase app + auth initialisation
├── App.tsx                  # Root component with ErrorBoundary
├── app.json                 # Expo config (package name, icons, EAS project)
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── eas.json                 # EAS Build / Submit config
└── .env                     # Firebase credentials (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) – installed automatically via `npx`
- **Expo Go** app on your iOS or Android device (for local development)

### 1. Clone the repository

```bash
git clone https://github.com/Favouridowu02/timewise-mobile.git
cd timewise-mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and fill in your Firebase project credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Tip:** All `EXPO_PUBLIC_` prefixed variables are automatically inlined by Expo at build time and are safe to use in client-side code.

### 4. Start the development server

```bash
npx expo start
```

Then scan the QR code with **Expo Go**, or press:

| Key | Action |
|-----|--------|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |

---

## 📱 Running on Specific Platforms

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## 🔐 Authentication Flow

The app uses **Firebase Authentication** (email & password). On launch:

1. A splash/loading screen is shown for a minimum of 2.5 seconds while the Firebase session is resolved.
2. If a valid session exists → user is taken directly to the **Main** tab navigator.
3. Otherwise → user lands on the **Login** screen, with links to **Register** and **Forgot Password**.

---

## 🗃 State Management

Global state is managed by **Zustand** and persisted to device storage via `AsyncStorage`:

```
timewise-storage  ←  AsyncStorage key
└── tasks[]       ─  Task items (title, priority, date, subtasks, completion status)
└── habits[]      ─  Habit items (title, frequency, streak, 7-day history)
└── profile{}     ─  User display name and email
```

The store exposes typed actions for all CRUD operations and is accessible from any component via the `useStore` hook.

---

## 🏗 Building for Production (EAS)

This project is configured for [Expo Application Services (EAS)](https://expo.dev/eas).

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android (APK / AAB)
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

EAS project ID: `a20e02c8-53a0-4961-acc7-af232ffd2814`

---

## 🎨 Design System

The app uses a **premium dark theme**:

| Token | Value |
|---|---|
| Background | `#000000` (true black) |
| Surface | `#1c1c1e` / `#1f1f1f` |
| Text Primary | `#ffffff` |
| Text Secondary | `#9ca3af` |
| Accent | White with opacity layers |
| Priority High | Red tones |
| Priority Med | Yellow/amber tones |
| Priority Low | Blue tones |

---

## 📄 License

[MIT](./LICENSE)
