import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Compose from "./pages/compose";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/compose" element={<Compose onBack={() => {}} />} />
    </Routes>
  );
}

export default App;