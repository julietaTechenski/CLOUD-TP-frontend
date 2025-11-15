import { Modal, Button, QRCode, Typography, Space, Divider } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useRef } from "react";

const { Text, Paragraph } = Typography;

export default function QRCodeModal({ visible, onClose, packageCode, packageData }) {
    const qrRef = useRef(null);

    // Generate the scan URL
    const scanUrl = `${window.location.origin}/scan/${packageCode}`;

    const handleDownload = () => {
        setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas');
            if (canvas) {
                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `QR-${packageCode}.png`;
                link.href = url;
                link.click();
            }
        }, 100);
    };

    return (
        <Modal
            title={
                <Space>
                    <QrcodeOutlined />
                    <span>Package QR Code</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                <Button key="download" type="primary" onClick={handleDownload}>
                    Download QR
                </Button>
            ]}
            width={500}
        >
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                {packageData && (
                    <div style={{ marginBottom: "20px" }}>
                        <Text strong>Package Code: </Text>
                        <Text code style={{ fontSize: "18px" }}>{packageCode}</Text>
                        {packageData.state && (
                            <div style={{ marginTop: "8px" }}>
                                <Text type="secondary">Status: {packageData.state}</Text>
                            </div>
                        )}
                    </div>
                )}

                <div ref={qrRef} style={{ display: "inline-block" }}>
                    <QRCode
                        value={scanUrl}
                        size={256}
                        errorLevel="M"
                        style={{ margin: "0 auto" }}
                    />
                </div>

                <Divider />

                <Paragraph>
                    <Text strong>Scan URL:</Text>
                </Paragraph>
                <Paragraph copyable={{ text: scanUrl }}>
                    <Text code style={{ fontSize: "12px", wordBreak: "break-all" }}>
                        {scanUrl}
                    </Text>
                </Paragraph>

                <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "16px" }}>
                    Scan this QR code to update the package status when it arrives at a depot or final destination.
                </Paragraph>
            </div>
        </Modal>
    );
}

