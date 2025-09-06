import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Test from "./pages/Test";
import CreatePackage from "./pages/CreatePackage";
import UpdatePackage from "./pages/UpdatePackage";
import Auth from "./pages/Auth";
import TrackPackage from "./pages/TrackPackage";
import AppLayout from "./components/AppLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="test" element={<Test />} />
                    <Route path="package/create" element={<CreatePackage />} />
                    <Route path="package/update" element={<UpdatePackage />} />
                    <Route path="track" element={<TrackPackage />} />
                    <Route path="auth" element={<Auth />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
