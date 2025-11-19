import React, { useState, useMemo } from "react";
import { Card, List, Button, Space, Tag, Select, message } from "antd";
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
                    const packageImage = useMemo(() => {
                        if (!pkg.images || pkg.images.length === 0) return null;
                        const img = pkg.images.find(img => img.purpose === 'CREATION') || pkg.images[0];
                        // Debug logging
                        if (img && process.env.NODE_ENV === 'development') {
                            console.log(`Package ${pkg.code} image data:`, img);
                        }
                        return img;
                    }, [pkg.images, pkg.code]);
                    
                    // Try different possible URL fields, or construct from image_id
                    const imageUrl = useMemo(() => {
                        if (!packageImage) return null;
                        // Backend returns presigned_url (pre-signed S3 URL)
                        if (packageImage.presigned_url) return packageImage.presigned_url;
                        // Fallback to other possible URL fields
                        if (packageImage.url) return packageImage.url;
                        if (packageImage.image_url) return packageImage.image_url;
                        if (packageImage.download_url) return packageImage.download_url;
                        if (packageImage.s3_url) return packageImage.s3_url;
                        // If no URL available, return null (image won't be displayed)
                        if (process.env.NODE_ENV === 'development') {
                            console.warn(`No URL found for package ${pkg.code} image:`, packageImage);
                        }
                        return null;
                    }, [packageImage, pkg.code]);
                    
                    return (
                    <List.Item className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 py-3 px-2 md:py-4 md:px-6">
                        <div className="cursor-default flex-1 w-full md:w-auto flex gap-3">
                            {imageUrl && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={imageUrl}
                                        alt={`Package ${pkg.code}`}
                                        style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover', 
                                            borderRadius: '4px',
                                            backgroundColor: '#f0f0f0'
                                        }}
                                        onError={(e) => {
                                            // Hide image on error instead of showing fallback
                                            e.target.style.display = 'none';
                                        }}
                                        loading="lazy"
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
