// Layout.tsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import UserProfileDrawer from "./UserProfileDrawer";
import { useAuth } from "../hooks/services/useAuth";

const { Header, Content } = Layout;

const ROUTES = {
    HOME: "/",
    PROFILE: "/profile",
    PACKAGES: "/packages",
    TRACK: "/track",
    AUTH: "/auth",
};

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authenticated } = useAuth();
    const [isProfileDrawerVisible, setProfileDrawerVisible] = useState(false);
    const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        {
            key: ROUTES.HOME,
            label: "Home",
            onClick: () => navigate(ROUTES.HOME),
        },
        {
            key: ROUTES.TRACK,
            label: "Track",
            onClick: () => navigate(ROUTES.TRACK),
        },
    ];

    if (authenticated) {
        menuItems.push(
            {
            key: ROUTES.PACKAGES,
            label: "Manage Package",
            onClick: () => navigate(ROUTES.PACKAGES),
        },
        {
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
        <Layout className="min-h-screen">
            <Header className="flex justify-between items-center px-4">
                <div className="text-white text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    FastTrack Delivery
                </div>

                {/* Desktop Menu */}
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    className={`flex-1 justify-end ${isMobile ? "hidden" : "flex"} min-w-0`}
                    items={menuItems}
                />

                {/* Mobile Menu Button */}
                <Button
                    type="text"
                    icon={<MenuOutlined />}
                    className={`text-white text-xl ${isMobile ? "block" : "hidden"}`}
                    onClick={() => setMobileMenuVisible(true)}
                />

                {/* Mobile Menu Drawer */}
                <Drawer
                    title="Menu"
                    placement="right"
                    onClose={() => setMobileMenuVisible(false)}
                    open={isMobileMenuVisible}
                    bodyStyle={{ padding: 0 }}
                >
                    <Menu
                        mode="vertical"
                        selectedKeys={[location.pathname]}
                        items={menuItems.map(item => ({
                            ...item,
                            onClick: () => {
                                item.onClick();
                                setMobileMenuVisible(false);
                            }
                        }))}
                        className="border-none"
                    />
                </Drawer>
            </Header>

            <Content className={isMobile ? "p-2" : "p-8"}>
                <Outlet />
            </Content>

            <UserProfileDrawer
                visible={isProfileDrawerVisible}
                onClose={() => setProfileDrawerVisible(false)}
            />
        </Layout>
    );
}
