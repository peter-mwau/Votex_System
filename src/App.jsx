import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WeglotProvider from "./providers/weglotProvider";
import Sidebar from "./components/Sidebar";
import AddVoterForm from "./components/AddVoterForm";
import StartRegistration from "./components/StartRegistration";
import StartVoting from "./components/StartVoting";
import VoterDetails from "./pages/voterDetails";
import AddCandidate from "./components/AddCandidate";

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
        <Route path="/register-candidate" element={<AddCandidate />} />

        <Route
          path="/admin/start-registration"
          element={<StartRegistration />}
        />
        <Route path="/admin/start-voting" element={<StartVoting />} />
        <Route path="/view-voterDetails" element={<VoterDetails />} />
      </Routes>
    </>
  );
}

export default App;
