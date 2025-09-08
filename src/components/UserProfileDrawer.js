import React from "react";
import { Drawer, Avatar, Button } from "antd";
import {useAuth} from "../hooks/services/useAuth";

/*
 Props:
 - visible: boolean (whether the drawer is open)
 - onClose: function (called to close the drawer)
 - user: object with { name, role, email }
*/

export default function UserProfileDrawer({ visible, onClose, user }) {
    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        return names.map((n) => n[0].toUpperCase()).join("");
    };
    const { handleLogout,email, firstName, lastName,role} = useAuth()

    return (
        <Drawer
            title="User Profile"
            placement="right"
            onClose={onClose}
            open={visible}
            width={300}
        >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Avatar size={64} style={{ backgroundColor: "#1890ff" }}>
                    {getInitials(firstName)}
                </Avatar>
                <h3 style={{ marginTop: 16 }}>{firstName}</h3>
                <p>{role}</p>
            </div>
            <div>
                <strong>Email:</strong>
                <p>{email}</p>
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
                <Button danger block   onClick={() => {
                    handleLogout();
                    onClose();
                }}>
                    Logout
                </Button>
            </div>
        </Drawer>
    );
}
