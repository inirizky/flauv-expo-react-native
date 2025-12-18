# Flauv Mobile - AI-Powered Plant Care Assistant

**Flauv Mobile** is a cross-platform mobile application built with **React Native** and **Expo**. It serves as a companion for plant enthusiasts, leveraging AI to identify plant species and monitor plant health in real-time.

## Project Overview

The application allows users to capture photos of plants directly through their mobile devices to receive instant identification, including care requirements such as watering and sunlight. It also enables users to maintain a personal plant library and track the growth progress of their plants over time.

---

## Key Features

* **AI Plant Identification:** Instantly identify plants using the device camera.
* **Growth Tracking & Progress:** Log plant growth stages and conditions with photo-based AI analysis.
* **Personal Plant Library:** Save and manage a custom collection of plants.
* **Care Instructions:** View specific care guides, including watering frequency and sunlight needs, for each plant in your collection.
* **Secure Authentication:** Integrated login and registration system.

---

## Tech Stack

* **Framework:** React Native with Expo SDK.
* **Navigation:** Expo Router (File-based routing).
* **State Management:** Zustand.
* **API Client:** Axios.
* **Language:** TypeScript.

---

## Folder Structure

* `app/`: Main application routes, including tabs and authentication screens.
* `components/`: Reusable UI components such as Camera, UI Dialogs, and Drawers.
* `lib/`: API configurations and Authentication Providers.
* `stores/`: Global state management using Zustand.
* `assets/`: Visual resources including images and icons.

---

## Getting Started

### 1. Prerequisites

* Node.js and npm installed.
* Expo Go app installed on your mobile device (Android/iOS).

### 2. Installation

1. **Clone the Repository:**
```bash
git clone https://github.com/inirizky/flauv-expo-react-native.git
cd flauv-expo-react-native

```


2. **Install Dependencies:**
```bash
npm install

```



### 3. Configuration

Ensure your backend server (**Flauv Express**) is running. Configure the API base URL in `lib/api.ts` to match your backend server's IP address.

Create a `.env` file in the root directory and add the following variables:
```env
EXPO_PUBLIC_BASE_URL = "your backend url"


```

### 4. Running the App

* **Start the Development Server:**
```bash
npx expo start

```


* Scan the QR code shown in your terminal with the **Expo Go** app (Android) or the Camera app (iOS) to launch the application.

### 5. Building for Production (Optional)

To build a standalone APK or IPA, use EAS Build:

```bash
eas build --platform android

```

---

## Author

* **M. Rizki Reza Pahlevi**

---
