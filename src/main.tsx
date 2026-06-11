// main.tsx — bootstrap only: init Firebase, mount <App />.
import React from "react";
import { createRoot } from "react-dom/client";

import { firebaseConfig } from "./firebase/config.ts";
import { initializeApp } from "firebase/app";

import App from "./App";
import "./index.css";

initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
