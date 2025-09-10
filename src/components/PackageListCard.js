import React from "react";
import { Card, List, Button } from "antd";

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
                                            onUpdatePackage,
                                        }) {

    console.log(packages);
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
                                title={`Package Code: ${pkg.code} | State: ${STATUS_MAP[pkg.state]?.label || pkg.state || "Pending"}`}
                                description={
                                    <>
                                        <p>
                                            Origin: {pkg.origin?.street} {pkg.origin?.number}, {pkg.origin?.city} → Destination: {pkg.destination?.street} {pkg.destination?.number}, {pkg.destination?.city}
                                        </p>

                                        {(pkg.track || []).filter(t => t.depot != null).length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <strong>Tracking History:</strong>
                                                <ul>
                                                    {(pkg.track || []).filter(t => t.depot != null).map((t, i) => (
                                                        <li key={i}>
                                                            {t.timestamp} - {t.comment || t.action} ({STATUS_MAP[t.status]?.label || t.status})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                }
                            />
                        </div>

                        {!(pkg.state === "CANCELLED" || pkg.state === "DELIVERED") && (
                            <Button
                                type="primary"
                                onClick={() => onUpdatePackage(pkg)}
                            >
                                Update
                            </Button>
                        )}
                    </List.Item>
                )}
            />
        </Card>
    );
}
