import React from "react";
import { Card, List, Button } from "antd";

export default function PackageListCard({
                                            packages,
                                            onSelectPackage,
                                            onUpdatePackage,
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
                            onClick={() => onSelectPackage(pkg)}
                            style={{ cursor: "pointer", flex: 1 }}
                        >
                            <List.Item.Meta
                                title={`Package ID: ${pkg.id} | State: ${pkg.state || "pending"}`}
                                description={
                                    <>
                                        <p>
                                            Origin: {pkg.origin?.street} {pkg.origin?.number}, {pkg.origin?.city} → Destination: {pkg.destination?.street} {pkg.origin?.number}, {pkg.destination?.city}
                                        </p>
                                        {(pkg.track || []).length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <strong>Tracking History:</strong>
                                                <ul>
                                                    {(pkg.track || []).map((t, i) => (
                                                        <li key={i}>
                                                            {t.date} - {t.location} ({t.status})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                }
                            />
                        </div>
                        <Button
                            type="primary"
                            onClick={() => onUpdatePackage(pkg)}
                        >
                            Update
                        </Button>
                    </List.Item>
                )}
            />
        </Card>
    );
}
