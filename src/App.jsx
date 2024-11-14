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
import AddPositionsForm from "./components/AddPositions";
import CandidateViewPage from "./pages/candidateDetails";
import { Provider } from "react-redux";
import store from "../backend/store.js";
import Chatbot from "./components/chatbot.jsx";

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
        <Route path="//admin/add-positions" element={<AddPositionsForm />} />

        <Route
          path="/admin/start-registration"
          element={<StartRegistration />}
        />
        <Route path="/admin/start-voting" element={<StartVoting />} />
        <Route path="/view-voterDetails" element={<VoterDetails />} />
        <Route path="/admin/view-candidates" element={<CandidateViewPage />} />
        <Route
          path="/chatbot"
          element={
            <Provider store={store}>
              <Chatbot />
            </Provider>
          }
        />
      </Routes>
    </>
  );
}

export default App;
