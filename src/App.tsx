import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import SelectProviderPage from "./pages/SelectProviderPage";
import FileManagerPage from "./pages/FileManagerPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/select-provider" element={<SelectProviderPage />} />
        <Route path="/explorer" element={<FileManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
