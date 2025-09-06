// Layout.tsx
import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "antd/dist/reset.css";

const { Header, Content } = Layout;

const ROUTES = {
    HOME: "/",
    PROFILE: "/profile",
    TEST: "/test",
    PACKAGE_CREATE: "/package/create",
    PACKAGE_UPDATE: "/package/update",
    TRACK: "/track",
    AUTH: "/auth",
};

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();

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
                    My App
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
                    <Menu.Item key={ROUTES.PROFILE} onClick={() => navigate(ROUTES.PROFILE)}>
                        Profile
                    </Menu.Item>
                    <Menu.Item key={ROUTES.TEST} onClick={() => navigate(ROUTES.TEST)}>
                        Test
                    </Menu.Item>
                    <Menu.Item key={ROUTES.TRACK} onClick={() => navigate(ROUTES.TRACK)}>
                        Track
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
        </Layout>
    );
}
