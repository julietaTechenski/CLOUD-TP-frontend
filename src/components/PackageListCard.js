import React from "react";
import { Card, List, Button, Space, Tag, Select, message } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

const STATUS_MAP = {
    CREATED: { label: "Created (pending action)", color: "blue" },
    IN_TRANSIT: { label: "In Transit", color: "orange" },
    ON_HOLD: { label: "At Depot (On Hold)", color: "gold" },
    DELIVERED: { label: "Delivered", color: "green" },
    CANCELLED: { label: "Cancelled", color: "red" },
};

export default function PackageListCard({
                                            packages,
                                            onSelectPackage,
                                            depotsMap,
                                            onUpdatePackage,
                                            onShowQR,
                                            onChangePriority,
                                        }) {
    return (
        <Card title="Registered Packages" style={{ maxWidth: 800, margin: "0 auto" }}>
            <List
                dataSource={packages}
                renderItem={(pkg) => (
                    <List.Item
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <div
                            style={{ cursor: "default", flex: 1 }}
                        >
                            <List.Item.Meta
                                title={
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span>{`Package Code: ${pkg.code} | State: ${STATUS_MAP[pkg.state]?.label || pkg.state || "Pending"}`}</span>
                                        {(pkg.priority === "PRIORITY" || pkg.priority === "HIGH_PRIORITY") && (
                                            <Tag color={pkg.priority === "HIGH_PRIORITY" ? "red" : "orange"}>
                                                {pkg.priority === "HIGH_PRIORITY" ? "High Priority" : "Priority"}
                                            </Tag>
                                        )}
                                    </div>
                                }
                                description={
                                    <>
                                        <p>
                                            Origin: {pkg.origin?.street} {pkg.origin?.number}, {pkg.origin?.city} → Destination: {pkg.destination?.street} {pkg.destination?.number}, {pkg.destination?.city}
                                        </p>
                                        {(pkg.track || []).filter(t => t.depot_id != null).length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <strong>Tracking History:</strong>
                                                <ul>
                                                    {(pkg.track || []).filter(t => t.depot_id != null).map((t, i) => (
                                                        <li key={i}>
                                                            {t.comment || t.action}
                                                            {t.depot_id && depotsMap[t.depot_id] && ` (Depot: ${depotsMap[t.depot_id].name})`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                }
                            />
                        </div>

                        <Space>
                            {onChangePriority && (
                                <Select
                                    size="small"
                                    value={pkg.priority || "NORMAL"}
                                    style={{ width: 140 }}
                                    onChange={async (val) => {
                                        try {
                                            await onChangePriority(pkg, val);
                                            message.success("Priority updated");
                                        } catch (e) {
                                            message.error("Failed to update priority");
                                        }
                                    }}
                                    options={[
                                        { value: "NORMAL", label: "Normal" },
                                        { value: "PRIORITY", label: "Priority" },
                                        { value: "HIGH_PRIORITY", label: "High Priority" },
                                    ]}
                                />
                            )}
                            {!(pkg.state === "CANCELLED" || pkg.state === "DELIVERED") && (
                                <>
                                    <Button
                                        icon={<QrcodeOutlined />}
                                        onClick={() => onShowQR && onShowQR(pkg)}
                                    >
                                        QR Code
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => onUpdatePackage(pkg)}
                                    >
                                        Update
                                    </Button>
                                </>
                            )}
                        </Space>
                    </List.Item>
                )}
            />
        </Card>
    );
}
