import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Providers from "./Provider.jsx";
import { BrowserRouter } from "react-router-dom";
import { CandidateProvider } from "./contexts/candidateContext.jsx";
import { PositionsProvider } from "./contexts/positionsContext.jsx";

if (typeof global === "undefined") {
  var global = window;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <CandidateProvider>
          <PositionsProvider>
            <App />
          </PositionsProvider>
        </CandidateProvider>
      </Providers>
    </BrowserRouter>
  </StrictMode>
);
