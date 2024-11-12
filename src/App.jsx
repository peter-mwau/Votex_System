import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WeglotProvider from "./providers/weglotProvider";
import Sidebar from "./components/Sidebar";
import AddVoterForm from "./components/AddVoterForm";

if (typeof global === "undefined") {
  var global = window;
}

function App() {
  return (
    <>
      <WeglotProvider />
      <Navbar />
      <Sidebar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/register-voter" element={<AddVoterForm />} />
      </Routes>
    </>
  );
}

export default App;
