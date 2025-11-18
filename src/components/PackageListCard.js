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

const ACTION_MAP = {
    CREATE: { label: "Package created", color: "blue" },
    SEND_DEPOT: { label: "Sent to depot", color: "orange" },
    ARRIVED_DEPOT: { label: "Arrived at depot", color: "gold" },
    SEND_FINAL: { label: "Sent to final destination", color: "purple" },
    ARRIVED_FINAL: { label: "Arrived at final destination", color: "green" },
    CANCELLED: { label: "Package cancelled", color: "red" },
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
                                                    {(pkg.track || []).map((t, i) => {
                                                        const actionInfo = ACTION_MAP[t.action] || { label: t.action, color: "gray" };
                                                        return (
                                                            <li key={i} style={{ color: actionInfo.color }}>
                                                                <strong>{actionInfo.label}</strong>
                                                                {t.comment && ` — ${t.comment}`}
                                                                {t.depot && depotsMap[t.depot] && (
                                                                    <> (Depot: {depotsMap[t.depot].name})</>
                                                                )}
                                                                {t.action === "ARRIVED_FINAL" && (
                                                                    <> (Final destination)</>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
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
