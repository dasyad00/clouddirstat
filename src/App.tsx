import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import SelectProviderPage from "./pages/SelectProviderPage";
import FileManagerPage from "./pages/FileManagerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SelectProviderPage />} />
        <Route path="/explorer" element={<FileManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
