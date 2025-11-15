import { Modal, Button, QRCode, Typography, Space, Divider } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useRef } from "react";
import { useAuth } from "../hooks/services/useAuth";

const { Text, Paragraph } = Typography;

export default function QRCodeModal({ visible, onClose, packageCode, packageData, mode = "tracking" }) {
    const auth = useAuth();
    const qrRef = useRef(null);

    // Generate URLs based on mode
    // "tracking" = public tracking URL (for users to see package status)
    // "scan" = admin scan URL (for admins to update package status)
    const trackingUrl = `${window.location.origin}/track/${packageCode}`;
    const scanUrl = `${window.location.origin}/scan/${packageCode}`;
    const qrUrl = mode === "scan" ? scanUrl : trackingUrl;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = () => {
        setTimeout(() => {
            const qrCanvas = qrRef.current?.querySelector('canvas');

            if (qrCanvas) {
                const padding = 50; // Margen extra alrededor del QR (en píxeles)
                const textPadding = 20; // Padding para el texto
                const originalSize = qrCanvas.width;
                const qrSize = originalSize + 2 * padding;

                // Calcular altura del texto
                const lineHeight = 30;
                const titleHeight = 50;

                let infoLines = [];
                let instructionText = '';

                if (mode === "scan") {
                    // QR de creación/admin - mostrar toda la info
                    infoLines = packageData ? [
                        `Package Code: ${packageCode}`,
                        packageData.receiver_name ? `Recipient: ${packageData.receiver_name}` : null,
                        packageData.state ? `Status: ${packageData.state}` : null,
                        packageData.size ? `Size: ${packageData.size}` : null,
                        packageData.weight ? `Weight: ${packageData.weight} kg` : null,
                    ].filter(Boolean) : [`Package Code: ${packageCode}`];
                    instructionText = 'Scan this QR code to update package status';
                } else {
                    // QR de tracking - mostrar info específica
                    // Formatear destino
                    let destinationText = null;
                    if (packageData?.destination) {
                        if (typeof packageData.destination === 'object') {
                            // destination es un objeto con street, number, city, etc.
                            const dest = packageData.destination;
                            destinationText = `${dest.street || ''} ${dest.number || ''}, ${dest.city || ''}`.trim();
                        } else if (packageData.destination_detail) {
                            // destination_detail está disponible
                            const dest = packageData.destination_detail;
                            destinationText = `${dest.street || ''} ${dest.number || ''}, ${dest.city || ''}`.trim();
                        }
                    }

                    // Obtener nombre del remitente
                    const senderName = auth?.userEmail || packageData?.sender_email || 'Sender';

                    infoLines = [
                        `Package Code: ${packageCode}`,
                        `From: ${senderName}`,
                        packageData?.receiver_name ? `To: ${packageData.receiver_name}` : null,
                        destinationText ? `Destination: ${destinationText}` : null,
                        packageData?.created_at ? `Created: ${formatDate(packageData.created_at)}` : null,
                    ].filter(Boolean);
                    instructionText = 'Scan this QR code to track your package';
                }

                const textHeight = titleHeight + (infoLines.length * lineHeight) + textPadding;
                const totalHeight = qrSize + textHeight + (padding * 2) + 30; // +30 para el texto de instrucciones
                const totalWidth = Math.max(qrSize, 600); // Mínimo 600px de ancho

                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = totalWidth;
                finalCanvas.height = totalHeight;
                const ctx = finalCanvas.getContext('2d');

                // Fondo blanco
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, totalWidth, totalHeight);

                // Título
                ctx.fillStyle = '#111827';
                ctx.font = 'bold 32px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('FastTrack Delivery', totalWidth / 2, 40);

                // Información del paquete
                let yPos = titleHeight + textPadding;
                ctx.font = '18px Arial, sans-serif';
                ctx.textAlign = 'left';

                infoLines.forEach((line, index) => {
                    if (index === 0) {
                        // Código del paquete más grande
                        ctx.font = 'bold 24px Arial, sans-serif';
                        ctx.fillStyle = '#1e40af';
                    } else {
                        ctx.font = '18px Arial, sans-serif';
                        ctx.fillStyle = '#374151';
                    }
                    const xPos = (totalWidth - qrSize) / 2 + padding;
                    ctx.fillText(line, xPos, yPos);
                    yPos += lineHeight;
                });

                // Dibujar el QR code centrado
                const qrX = (totalWidth - qrSize) / 2;
                const qrY = textHeight + padding;

                ctx.drawImage(
                    qrCanvas,
                    qrX + padding,
                    qrY + padding,
                    originalSize,
                    originalSize
                );

                // Texto de instrucciones debajo del QR
                ctx.fillStyle = '#6b7280';
                ctx.font = '14px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(instructionText, totalWidth / 2, qrY + qrSize + 20);

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
                    <span>{mode === "scan" ? "Admin Scan QR Code" : "Package Tracking QR Code"}</span>
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
                        value={qrUrl}
                        size={256}
                        errorLevel="M"
                        style={{ margin: "0 auto" }}
                    />
                </div>

                <Divider />

                {mode === "scan" ? (
                    <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "16px" }}>
                        Scan this QR code to update the package status when it arrives at a depot or final destination. (Admin only)
                    </Paragraph>
                ) : (
                    <>
                        <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "16px" }}>
                            Share this QR code with the recipient to track the package status in real-time.
                        </Paragraph>
                        <Paragraph copyable={{ text: trackingUrl }} style={{ fontSize: "11px", marginTop: "8px" }}>
                            <Text type="secondary">Tracking Link: </Text>
                            <Text code style={{ fontSize: "10px" }}>{trackingUrl}</Text>
                        </Paragraph>
                    </>
                )}
            </div>
        </Modal>
    );
}

