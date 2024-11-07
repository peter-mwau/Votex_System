import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WeglotProvider from "./providers/weglotProvider";

function App() {
  return (
    <>
      <WeglotProvider />
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
