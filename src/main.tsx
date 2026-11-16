
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./index.css";

// Register the PWA service worker.
registerSW({
  immediate: true,

  onNeedRefresh() {
    console.log("A new application version is available.");
  },

  onOfflineReady() {
    console.log("Student Portal is ready for offline use.");
  },

  onRegisterError(error) {
    console.error("Service worker registration failed:", error);
  }
});

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);