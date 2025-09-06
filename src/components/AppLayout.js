// Layout.tsx
import React, {useState} from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "antd/dist/reset.css";
import UserProfileDrawer from "./UserProfileDrawer";

const { Header, Content } = Layout;

const ROUTES = {
    HOME: "/",
    PROFILE: "/profile",
    TEST: "/test",
    PACKAGES: "/packages",
    TRACK: "/track",
    AUTH: "/auth",
};

const MOCK_USER = {
    name: "Valentina Marti",
    role: "Admin",
    email: "valentina@example.com",
};

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isProfileDrawerVisible, setProfileDrawerVisible] = useState(false);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold" }}>
                    FastTrack Delivery
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
                >
                    <Menu.Item key={ROUTES.HOME} onClick={() => navigate(ROUTES.HOME)}>
                        Home
                    </Menu.Item>
                    <Menu.Item key={ROUTES.PACKAGES} onClick={() => navigate(ROUTES.PACKAGES)}>
                        Manage Package
                    </Menu.Item>
                    <Menu.Item key={ROUTES.TEST} onClick={() => navigate(ROUTES.TEST)}>
                        Test
                    </Menu.Item>
                    <Menu.Item key={ROUTES.TRACK} onClick={() => navigate(ROUTES.TRACK)}>
                        Track
                    </Menu.Item>
                    <Menu.Item key={ROUTES.PROFILE} onClick={() => setProfileDrawerVisible(true)}>
                        Profile
                    </Menu.Item>
                    <Menu.Item key="auth">
                        <Button type="primary" onClick={() => navigate(ROUTES.AUTH)}>
                            Log In
                        </Button>
                    </Menu.Item>
                </Menu>
            </Header>

            <Content style={{ padding: "2rem" }}>
                <Outlet />
            </Content>

            <UserProfileDrawer
                visible={isProfileDrawerVisible}
                onClose={() => setProfileDrawerVisible(false)}
                user={MOCK_USER}
            />
        </Layout>
    );
}
