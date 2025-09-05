import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Test from "./pages/Test";

function App() {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> |{" "}
                <Link to="/profile">Profile</Link>
                <Link to="/test">Test connection</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/test" element={<Test />} />
            </Routes>
        </Router>
    );
}

export default App;
