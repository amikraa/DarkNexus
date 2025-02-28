import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"
import "./styles/mobile.css";
import "./styles/mobile.css";

// Force refresh on load to clear potential caches
const forceRefresh = () => {
  if (window.location.search !== '?refresh=true') {
    window.location.search = 'refresh=true';
  }
};

// Uncomment the next line if you need to force a refresh
// window.addEventListener('load', forceRefresh);

createRoot(document.getElementById("root")!).render(<App />);