// Layout.tsx
import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "antd/dist/reset.css";
import UserProfileDrawer from "./UserProfileDrawer";
import { useAuth } from "../hooks/services/useAuth";

const { Header, Content } = Layout;

const ROUTES = {
    HOME: "/",
    PROFILE: "/profile",
    TEST: "/test",
    PACKAGES: "/packages",
    TRACK: "/track",
    AUTH: "/auth",
};

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authenticated, setUserDetails } = useAuth();
    const [isProfileDrawerVisible, setProfileDrawerVisible] = useState(false);

    const menuItems = [
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
    ];

    if (authenticated) {
        menuItems.push({
            key: ROUTES.PROFILE,
            label: "Profile",
            onClick:  () => {
                setProfileDrawerVisible(true);
            },
        });
    } else {
        menuItems.push({
            key: "auth",
            label: (
                <Button type="primary" onClick={() => navigate(ROUTES.AUTH)}>
                    Log In
                </Button>
            ),
        });
    }

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
                    style={{ flex: 1, justifyContent: "flex-end" }}
                    items={menuItems}
                />
            </Header>

            <Content style={{ padding: "2rem" }}>
                <Outlet />
            </Content>

            <UserProfileDrawer
                visible={isProfileDrawerVisible}
                onClose={() => setProfileDrawerVisible(false)}
            />
        </Layout>
    );
}
