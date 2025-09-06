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
                    items={[
                        {
                            key: ROUTES.HOME,
                            label: "Home",
                            onClick: () => navigate(ROUTES.HOME),
                        },
                        {
                            key: ROUTES.PACKAGES,
                            label: "Manage Package",
                            onClick: () => navigate(ROUTES.PACKAGES),
                        },
                        {
                            key: ROUTES.TEST,
                            label: "Test",
                            onClick: () => navigate(ROUTES.TEST),
                        },
                        {
                            key: ROUTES.TRACK,
                            label: "Track",
                            onClick: () => navigate(ROUTES.TRACK),
                        },
                        {
                            key: ROUTES.PROFILE,
                            label: "Profile",
                            onClick: () => setProfileDrawerVisible(true),
                        },
                        {
                            key: "auth",
                            label: (
                                <Button type="primary" onClick={() => navigate(ROUTES.AUTH)}>
                                    Log In
                                </Button>
                            ),
                        },
                    ]}
                />
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
