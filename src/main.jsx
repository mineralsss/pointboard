import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./base.css";

// Temporary cleanup function - remove after running once
(() => {
  const userData = localStorage.getItem("user");
  if (userData === "user" || userData === '"user"' || userData === '""') {
    console.log("Cleaning up invalid user data from localStorage...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("Cleanup complete. Please login again.");
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
