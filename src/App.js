import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Auth from "./pages/Auth";
import VerifyCode from "./pages/VerifyCode";
import TrackPackage from "./pages/TrackPackage";
import ScanPackage from "./pages/ScanPackage";
import AppLayout from "./components/AppLayout";
import ManagePackages from "./pages/ManagePackages";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="test" element={<Test />} />
                    <Route path="packages" element={<ManagePackages />} />
                    <Route path="track" element={<TrackPackage />} />
                    <Route path="scan/:code" element={<ScanPackage />} />
                    <Route path="auth" element={<Auth />} />
                    <Route path="verify" element={<VerifyCode />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
