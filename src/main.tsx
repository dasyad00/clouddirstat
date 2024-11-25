import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID}>
    <React.StrictMode>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
