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
            const qrCanvas = qrRef.current?.querySelector('canvas');

            if (qrCanvas) {
                const padding = 50; // Margen extra alrededor del QR (en píxeles)
                const originalSize = qrCanvas.width;
                const newSize = originalSize + 2 * padding;

                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = newSize;
                finalCanvas.height = newSize;
                const ctx = finalCanvas.getContext('2d');

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, newSize, newSize);

                ctx.drawImage(
                    qrCanvas,
                    padding, // Coordenada X de inicio
                    padding, // Coordenada Y de inicio
                    originalSize,
                    originalSize
                );

                const url = finalCanvas.toDataURL('image/png');
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

                <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "16px" }}>
                    Scan this QR code to update the package status when it arrives at a depot or final destination.
                </Paragraph>
            </div>
        </Modal>
    );
}

