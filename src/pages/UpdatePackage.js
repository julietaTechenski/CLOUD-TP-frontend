import { useState } from "react"
import { Modal, Button, Card, Badge, Select, Typography } from "antd"
import { EnvironmentOutlined, ClockCircleOutlined, CheckCircleTwoTone } from "@ant-design/icons"

const { Title, Text } = Typography

export default function UpdatePackage({ isOpen, onClose, packageData }) {
    const [modalState, setModalState] = useState("send-to")
    const [destinationType, setDestinationType] = useState("")
    const [selectedDepot, setSelectedDepot] = useState("")

    const depots = [
        { id: "depot-a", name: "Depot A - Norte" },
        { id: "depot-b", name: "Depot B - Sur" },
        { id: "depot-c", name: "Depot C - Este" },
        { id: "depot-d", name: "Depot D - Oeste" },
    ]

    const handleArrivedClick = () => setModalState("arrived-at")

    const handleConfirm = () => {
        console.log("Confirmando actualización:", {
            modalState,
            destinationType,
            selectedDepot,
        })
        onClose()
        resetForm()
    }

    const handleCancel = () => {
        onClose()
        resetForm()
    }

    const resetForm = () => {
        setModalState("send-to")
        setDestinationType("")
        setSelectedDepot("")
    }

    const getDestinationText = () => {
        const isGoingToFinal = packageData.destination.includes("Cliente")
        return isGoingToFinal ? "destino final" : "depósito"
    }

    return (
        <Modal
            title={`Actualizar Paquete ${packageData.id}`}
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width={700}
        >
            {/* Recorrido */}
            <Card title="Recorrido Realizado" style={{ marginBottom: 16 }}>
                {packageData.route.map((step, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        {step.status === "completed" ? (
                            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20, marginRight: 8 }} />
                        ) : step.status === "current" ? (
                            <ClockCircleOutlined style={{ fontSize: 20, color: "#1890ff", marginRight: 8 }} />
                        ) : (
                            <ClockCircleOutlined style={{ fontSize: 20, color: "#ccc", marginRight: 8 }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Text strong>{step.location}</Text>
                                <Text type="secondary">{step.time}</Text>
                            </div>
                        </div>
                        <Badge
                            status={
                                step.status === "completed"
                                    ? "success"
                                    : step.status === "current"
                                        ? "processing"
                                        : "default"
                            }
                            text={
                                step.status === "completed"
                                    ? "Completado"
                                    : step.status === "current"
                                        ? "Actual"
                                        : "Pendiente"
                            }
                        />
                    </div>
                ))}
            </Card>

            {/* Estado send-to */}
            {modalState === "send-to" && (
                <>
                    <Card title="Hacia donde va ahora" style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <EnvironmentOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                            <Text strong>Enviando a: {getDestinationText()}</Text>
                        </div>
                        <Text type="secondary">Destino: {packageData.destination}</Text>
                    </Card>

                    <div style={{ textAlign: "right" }}>
                        <Button type="primary" onClick={handleArrivedClick}>
                            Marcar como Llegado
                        </Button>
                    </div>
                </>
            )}

            {/* Estado arrived-at */}
            {modalState === "arrived-at" && (
                <>
                    <Card title="Paquete ha llegado" style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
                            <Text strong>Llegó a: {packageData.currentLocation}</Text>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <Text strong>Seleccionar próximo destino:</Text>
                            <Select
                                style={{ width: "100%", marginTop: 8 }}
                                placeholder="Seleccionar tipo de destino"
                                value={destinationType || undefined}
                                onChange={setDestinationType}
                            >
                                <Select.Option value="final">Destino Final</Select.Option>
                                <Select.Option value="depot">Depósito</Select.Option>
                            </Select>
                        </div>

                        {destinationType === "depot" && (
                            <div>
                                <Text strong>Seleccionar depósito:</Text>
                                <Select
                                    style={{ width: "100%", marginTop: 8 }}
                                    placeholder="Seleccionar depósito"
                                    value={selectedDepot || undefined}
                                    onChange={setSelectedDepot}
                                >
                                    {depots.map((depot) => (
                                        <Select.Option key={depot.id} value={depot.id}>
                                            {depot.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </Card>

                    <div style={{ textAlign: "right" }}>
                        <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleConfirm}
                            disabled={!destinationType || (destinationType === "depot" && !selectedDepot)}
                        >
                            Confirmar
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    )
}
