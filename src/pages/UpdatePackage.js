import {useEffect, useState} from "react"
import { Modal, Button, Card, Badge, Select, Typography } from "antd"
import { EnvironmentOutlined, ClockCircleOutlined, CheckCircleTwoTone } from "@ant-design/icons"

const { Title, Text } = Typography


const packageStates = Object.freeze({
    created: "CREATED",
    onHold: "ON_HOLD",
    inTransit: "IN_TRANSIT",
    delivered: "DELIVERED",
    cancelled: "CANCELLED",
});


const actions = Object.freeze({
    sentToDepot: "SEND_DEPOT",
    arrivedDepot: "ARRIVED_DEPOT",
    sentToFinal: "SEND_FINAL",
    arrivedFinal: "ARRIVED_FINAL",
    cancelled: "CANCELLED",
});

// /depots
// /depots/{id}
export default function UpdatePackage({ isOpen, onClose, packageData }) {
    const [modalState, setModalState] = useState("send-to");

    useEffect(() => {
        if (packageData?.tracks?.length) {
            setModalState(
                packageData.tracks[packageData.tracks.length - 1].action === actions.arrivedDepot
                    ? "arrived-at"
                    : "send-to"
            );
        }
    }, [packageData]);

    const [destinationType, setDestinationType] = useState("")
    const [selectedDepot, setSelectedDepot] = useState("")
    const [shipmentStatus, setShipmentStatus] = useState("");


    const depots = [
        { id: "depot-a", name: "Depot A - Norte" },
        { id: "depot-b", name: "Depot B - Sur" },
        { id: "depot-c", name: "Depot C - Este" },
        { id: "depot-d", name: "Depot D - Oeste" },
    ]

    const handleConfirm = () => {
        console.log("Confirmando actualización:", {
            modalState,
            destinationType,
            selectedDepot,
        })
        onClose()
        resetForm()
    }

    const handleConfirmShipment = () => {
        console.log("Confirmando envío del paquete")
        onClose()
        resetForm()
    }

    const handleCancelShipment = () => {
        console.log("Cancelando envío del paquete")
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
        const isGoingToFinal =true
        return isGoingToFinal ? "destino final" : "depósito"
    }

    const handleArrivedClick = () => {
        setModalState("sent-to")
    }

    return (
        <Modal
            title={`Actualizar Paquete ${packageData.id}`}
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width={700}
        >
            {/* Estado send-to */}
            {modalState === "send-to" && (
                <>
                    <Card style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {/* Contenedor de textos a la izquierda */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <EnvironmentOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                                    <Text strong>Enviando a: {packageData.destination?.street}, {packageData.destination?.city}</Text>
                                </div>
                                <Text type="secondary">Destino: {packageData.destination?.street}, {packageData.destination?.city}</Text>
                            </div>

                            {/* Dropdown a la derecha */}
                            <Select
                                style={{ width: 120 }}
                                placeholder="Estado"
                                value={shipmentStatus || undefined}
                                onChange={setShipmentStatus}
                            >
                                <Select.Option value="pending">Pendiente</Select.Option>
                                <Select.Option value="received">Recibido</Select.Option>
                            </Select>
                        </div>
                    </Card>

                    <div style={{ textAlign: "right" }}>
                        <Button style={{ marginRight: 8 }} onClick={handleCancelShipment}>
                            Cancelar Envío
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                if (shipmentStatus === "received") {
                                    console.log("Paquete marcado como recibido");
                                    handleConfirmShipment();
                                } else {
                                    console.log("Paquete sigue pendiente");
                                    handleConfirmShipment();
                                }
                            }}
                            disabled={!shipmentStatus} // deshabilitado hasta seleccionar
                        >
                            Confirmar Envío
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
