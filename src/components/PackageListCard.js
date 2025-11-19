import React, { useState } from "react";
import { Card, List, Button, Space, Tag, Select, message, Image } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

const STATUS_MAP = {
    CREATED: { label: "Created (pending action)", color: "blue" },
    IN_TRANSIT: { label: "In Transit", color: "orange" },
    ON_HOLD: { label: "At Depot (On Hold)", color: "gold" },
    DELIVERED: { label: "Delivered", color: "green" },
    CANCELLED: { label: "Cancelled", color: "red" },
};

const ACTION_MAP = {
    CREATE: { label: "Package created", color: "gray" },
    SEND_DEPOT: { label: "Sent to depot", color: "gray" },
    ARRIVED_DEPOT: { label: "Arrived at depot", color: "gray" },
    SEND_FINAL: { label: "Sent to final destination", color: "gray" },
    ARRIVED_FINAL: { label: "Arrived at final destination", color: "gray" },
    CANCELLED: { label: "Package cancelled", color: "gray" },
};


export default function PackageListCard({
                                            packages,
                                            onSelectPackage,
                                            depotsMap,
                                            onUpdatePackage,
                                            onShowQR,
                                            onSavePriority,
                                        }) {
    const PrioritySelector = ({ pkg }) => {
        const [localPriority, setLocalPriority] = useState(pkg.priority || "NORMAL");
        const [dirty, setDirty] = useState(false);
        const [saving, setSaving] = useState(false);

        const handleChange = (val) => {
            setLocalPriority(val);
            setDirty(true);
        };

        const handleSave = async () => {
            try {
                setSaving(true);
                await onSavePriority(pkg, localPriority);
                setDirty(false);
                message.success("Priority updated");
            } catch (e) {
                message.error("Failed to update priority");
            } finally {
                setSaving(false);
            }
        };

        return (
            <Space 
                direction="vertical"
                className="w-full md:w-auto md:flex-row"
                size="small"
            >
                <Select
                    size="small"
                    value={localPriority}
                    className="w-full md:w-[140px]"
                    onChange={handleChange}
                    options={[
                        { value: "NORMAL", label: "Normal" },
                        { value: "PRIORITY", label: "Priority" },
                        { value: "HIGH_PRIORITY", label: "High Priority" },
                    ]}
                />
                <Button
                    size="small"
                    type="primary"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    loading={saving}
                    className="w-full md:w-auto"
                >
                    Save
                </Button>
            </Space>
        );
    };

    return (
        <Card title="Registered Packages" className="max-w-[800px] mx-auto w-full">
            <List
                dataSource={packages}
                renderItem={(pkg) => {
                    // Get the first image or the CREATION purpose image
                    const packageImage = pkg.images && pkg.images.length > 0 
                        ? (pkg.images.find(img => img.purpose === 'CREATION') || pkg.images[0])
                        : null;
                    // Try different possible URL fields, or construct from image_id
                    const imageUrl = packageImage?.url || packageImage?.image_url || packageImage?.download_url ||
                        (packageImage?.image_id ? `${process.env.REACT_APP_API_URL || ''}/packages/${pkg.code}/images/${packageImage.image_id}` : null);
                    
                    return (
                    <List.Item className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 py-3 px-2 md:py-4 md:px-6">
                        <div className="cursor-default flex-1 w-full md:w-auto flex gap-3">
                            {imageUrl && (
                                <div className="flex-shrink-0">
                                    <Image
                                        src={imageUrl}
                                        alt={`Package ${pkg.code}`}
                                        width={80}
                                        height={80}
                                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f0f0f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                            <List.Item.Meta
                                title={
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 flex-wrap">
                                        <span className="text-sm md:text-base break-words">
                                            <span className="md:hidden">
                                                <div><strong>Code:</strong> {pkg.code}</div>
                                                <div><strong>State:</strong> {STATUS_MAP[pkg.state]?.label || pkg.state || "Pending"}</div>
                                            </span>
                                            <span className="hidden md:inline">
                                                Package Code: {pkg.code} | State: {STATUS_MAP[pkg.state]?.label || pkg.state || "Pending"}
                                            </span>
                                        </span>
                                        <Tag
                                            color={
                                                pkg.priority === "HIGH_PRIORITY"
                                                    ? "red"
                                                    : pkg.priority === "PRIORITY"
                                                        ? "orange"
                                                        : "blue"
                                            }
                                        >
                                            {pkg.priority === "HIGH_PRIORITY"
                                                ? "High Priority"
                                                : pkg.priority === "PRIORITY"
                                                    ? "Priority"
                                                    : "Normal"}
                                        </Tag>
                                    </div>
                                }
                                description={
                                    <>
                                        <p className="text-xs md:text-sm break-words mb-1 mt-1 md:mt-0">
                                            <span className="md:hidden">
                                                <div><strong>Origin:</strong> {pkg.origin?.street} {pkg.origin?.number}, {pkg.origin?.city}</div>
                                                <div><strong>Destination:</strong> {pkg.destination?.street} {pkg.destination?.number}, {pkg.destination?.city}</div>
                                            </span>
                                            <span className="hidden md:inline">
                                                Origin: {pkg.origin?.street} {pkg.origin?.number}, {pkg.origin?.city} → Destination: {pkg.destination?.street} {pkg.destination?.number}, {pkg.destination?.city}
                                            </span>
                                        </p>
                                        {(pkg.track || []).filter(t => t.depot_id != null).length > 0 && (
                                            <div className="mt-1 md:mt-2">
                                                <strong className="text-xs md:text-sm">Tracking History:</strong>
                                                <ul className="text-[11px] md:text-[13px] pl-5 md:pl-6 mt-1 md:mt-2 mb-0 md:mb-1">
                                                    {(pkg.track || []).map((t, i) => {
                                                        const actionInfo = ACTION_MAP[t.action] || { label: t.action, color: "gray" };
                                                        return (
                                                            <li key={i} className="mb-1" style={{ color: actionInfo.color }}>
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
                        </div>

                        <Space 
                            direction="vertical"
                            className="w-full md:w-auto md:flex-row justify-stretch md:justify-end"
                            size="small"
                        >
                            {onSavePriority && (
                                <PrioritySelector pkg={pkg} />
                            )}
                            {onUpdatePackage && !(pkg.state === "CANCELLED" || pkg.state === "DELIVERED") && (
                                <>
                                    <Button
                                        icon={<QrcodeOutlined />}
                                        onClick={() => onShowQR && onShowQR(pkg)}
                                        className="w-full md:w-auto"
                                        size="small"
                                    >
                                        QR Code
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => onUpdatePackage(pkg)}
                                        className="w-full md:w-auto"
                                        size="small"
                                    >
                                        Update
                                    </Button>
                                </>
                            )}
                        </Space>
                    </List.Item>
                    );
                }}
            />
        </Card>
    );
}
