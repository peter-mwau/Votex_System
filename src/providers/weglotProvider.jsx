// src/components/WeglotProvider.js
import { useEffect } from "react";

function WeglotProvider() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.weglot.com/weglot.min.js";
    script.async = true;
    script.onload = () => {
      window.Weglot.initialize({
        api_key: import.meta.env.VITE_APP_WEGLOT_API_KEY,
        originalLanguage: "en",
        destinationLanguages: ["fr", "es"], // Replace with your target languages
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  console.log("api_key: ", import.meta.env.VITE_APP_WEGLOT_API_KEY);

  return null;
}

export default WeglotProvider;
