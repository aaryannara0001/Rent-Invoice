import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { initializeMockData } from "@/utils/mockData";

// Initialize mock data on app startup
initializeMockData();

createRoot(document.getElementById("root")!).render(<App />);
