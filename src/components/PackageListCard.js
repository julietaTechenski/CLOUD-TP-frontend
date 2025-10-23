import React, {useState} from "react";
import { Card, List, Button } from "antd";
import {useDepots} from "../hooks/services/useDepots";

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
                                title={`Package Code: ${pkg.code} | State: ${STATUS_MAP[pkg.state]?.label || pkg.state || "Pending"}`}
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
