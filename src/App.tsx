import { SignInLayout } from "./pages/public/SignInLayout";
import { SignUpLayout } from "./pages/public/SignUpLayout";

function App() {
    const path = window.location.pathname;

    return path === "/signup" ? <SignUpLayout /> : <SignInLayout />;
}

export default App;
