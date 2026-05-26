import { SignInLayout } from "./pages/public/SignInLayout";
import { SignUpLayout } from "./pages/public/SignUpLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignInLayout />} />
                <Route path="/signup" element={<SignUpLayout />} />
                <Route path="*" element={<SignInLayout />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
