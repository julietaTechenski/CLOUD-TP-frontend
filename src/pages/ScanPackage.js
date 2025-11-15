import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Alert, Result } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, LockOutlined } from "@ant-design/icons";
import { useTracks } from "../hooks/services/useTracks";
import { useAuth } from "../hooks/services/useAuth";

export default function ScanPackage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { getScanInfo, handleQrScan } = useTracks();
    const { authenticated, role } = useAuth();

    const [loading, setLoading] = useState(true);
    const [scanInfo, setScanInfo] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check authentication and admin role
        if (!authenticated) {
            setError("Authentication required. Please log in to scan packages.");
            setLoading(false);
            return;
        }

        if (role !== 'admin') {
            setError("Only administrators can scan QR codes to update package status.");
            setLoading(false);
            return;
        }

        const fetchScanInfo = async () => {
            try {
                setLoading(true);
                const response = await getScanInfo(code);
                setScanInfo(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching scan info:", err);
                if (err.response?.status === 403) {
                    setError("Only administrators can scan QR codes to update package status.");
                } else if (err.response?.status === 401) {
                    setError("Authentication required. Please log in to scan packages.");
                } else {
                    setError(err.response?.data?.error || "Failed to load package information");
                }
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchScanInfo();
        }
    }, [code, getScanInfo, authenticated, role]);

    const handleConfirm = async () => {
        try {
            setConfirming(true);
            setError(null);
            const response = await handleQrScan(code);

            if (response.status === 201 || response.status === 200) {
                setConfirmed(true);
                // Refresh scan info after confirmation
                setTimeout(async () => {
                    const newInfo = await getScanInfo(code);
                    setScanInfo(newInfo.data);
                }, 1000);
            }
        } catch (err) {
            console.error("Error confirming scan:", err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to confirm scan");
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error && !scanInfo) {
        return (
            <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
                <Result
                    status="error"
                    icon={<LockOutlined />}
                    title="Access Denied"
                    subTitle={error}
                    extra={[
                        !authenticated && (
                            <Button key="login" type="primary" onClick={() => navigate("/auth")}>
                                Log In
                            </Button>
                        ),
                        <Button key="track" onClick={() => navigate("/track")}>
                            Go to Track Package
                        </Button>
                    ]}
                />
            </div>
        );
    }

    if (confirmed) {
        return (
            <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
                <Result
                    status="success"
                    title="Package Status Updated!"
                    subTitle="The package status has been successfully updated."
                    extra={[
                        <Button type="primary" key="track" onClick={() => navigate(`/track?code=${code}`)}>
                            View Package Details
                        </Button>,
                        <Button key="scan" onClick={() => window.location.reload()}>
                            Scan Another
                        </Button>
                    ]}
                />
            </div>
        );
    }

    const canAutoConfirm = scanInfo?.can_auto_confirm;
    const message = scanInfo?.message || "Processing...";

    return (
        <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
            <Card>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h2>Package Scan</h2>
                    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}>
                        Code: {code}
                    </p>
                </div>

                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: "16px" }}
                    />
                )}

                <Card style={{ marginBottom: "16px" }}>
                    <div style={{ marginBottom: "16px" }}>
                        <strong>Current Status:</strong> {scanInfo?.current_state || "Unknown"}
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                        <strong>Message:</strong> {message}
                    </div>
                </Card>

                {canAutoConfirm ? (
                    <div>
                        <Alert
                            message="Ready to Confirm"
                            description="This package is in transit. Click the button below to confirm arrival."
                            type="info"
                            showIcon
                            style={{ marginBottom: "16px" }}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={confirming ? <LoadingOutlined /> : <CheckCircleOutlined />}
                            onClick={handleConfirm}
                            loading={confirming}
                            disabled={confirming}
                        >
                            {confirming ? "Confirming..." : "Confirm Arrival"}
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Alert
                            message="Manual Action Required"
                            description={message}
                            type="warning"
                            showIcon
                            style={{ marginBottom: "16px" }}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={() => navigate("/packages")}
                        >
                            Go to Package Management
                        </Button>
                        <Button
                            size="large"
                            block
                            style={{ marginTop: "8px" }}
                            onClick={() => navigate(`/track?code=${code}`)}
                        >
                            View Package Details
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

