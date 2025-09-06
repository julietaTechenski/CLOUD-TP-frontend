import React from "react";
import { Drawer, Avatar } from "antd";

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
                    {getInitials(user?.name)}
                </Avatar>
                <h3 style={{ marginTop: 16 }}>{user?.name}</h3>
                <p>{user?.role}</p>
            </div>
            <div>
                <strong>Email:</strong>
                <p>{user?.email}</p>
            </div>
        </Drawer>
    );
}
