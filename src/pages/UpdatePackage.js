import {useEffect, useState} from "react"
import {Modal, Button, Card, Select, Typography, Divider} from "antd"
import {EnvironmentOutlined, CheckCircleTwoTone} from "@ant-design/icons"
import DepotsService from "../services/package";
import {getDepots} from "../services/depots";

const {Text} = Typography


const actions = Object.freeze({
    sentToDepot: "SEND_DEPOT",
    arrivedDepot: "ARRIVED_DEPOT",
    sentToFinal: "SEND_FINAL",
    arrivedFinal: "ARRIVED_FINAL",
    cancelled: "CANCELLED",
});

// /depots
// /depots/{id}
export default function UpdatePackageModal({onClose, packageData}) {
    const [modalState, setModalState] = useState("send-to");
    const [lastLocation, setLastLocation] = useState([]);

    useEffect(() => {
        if (packageData?.tracks?.length) {
            setModalState(
                packageData.tracks[packageData.tracks.length - 1].action === actions.arrivedDepot
                    ? "arrived-at"
                    : "send-to"
            );
            setIsCancelModalOpen(false);
            setLastLocation(packageData.tracks[packageData.tracks.length - 1]);
        }
    }, [packageData]);

    const [destinationType, setDestinationType] = useState("")
    const [selectedDepot, setSelectedDepot] = useState("")
    const [shipmentStatus, setShipmentStatus] = useState("");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);


    const [depots, setDepots] = useState([]);
    const [depotsLoading, setDepotsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadDepots = async () => {
            setDepotsLoading(true);
            try {
                const data = await getDepots();
                if (mounted) setDepots(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando depots:", err);
                if (mounted) setDepots([]);
            } finally {
                if (mounted) setDepotsLoading(false);
            }
        };
        loadDepots();
        return () => { mounted = false; };
    }, []);

    const handleConfirm = () => {
        console.log("Confirming new destination:", {
            modalState,
            destinationType,
            selectedDepot,
        })
        // TODO: update package destination API call -> package needs to be sent to...
        onClose()
        resetForm()
    }

    const handleConfirmShipment = () => {
        // TODO: update shipment status API call -> package has arrived
        console.log("Confirming shipment with status:", shipmentStatus)
        onClose()
        resetForm()
    }

    const handleCancelShipment = () => {
        // TODO: cancel shipment API call -> package shipment cancelled
        console.log("Cancelling shipment")
        onClose()
        resetForm()
    }

    const handleCancel = () => {
        onClose()
        resetForm()
    }

    const resetForm = () => {
        setModalState(packageData.tracks[packageData.tracks.length - 1].action === actions.arrivedDepot
            ? "arrived-at"
            : "send-to")
        setDestinationType("")
        setSelectedDepot("")
        setShipmentStatus("")
        setIsCancelModalOpen(false)

    }


    return (
        <>
        {/* Estado send-to */}
        {modalState === "send-to" && (
            <>
                <Card style={{marginBottom: 16}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        {/* Contenedor de textos a la izquierda */}
                        <div>
                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                <EnvironmentOutlined style={{fontSize: 18, color: "#1890ff"}}/>
                                <Text strong>Package on the way to: {packageData.destination?.street}, {packageData.destination?.city}</Text>
                            </div>
                            <Text
                                type="secondary">Final destination: {packageData.destination?.street}, {packageData.destination?.city}</Text>

                            { lastLocation.action === actions.sentToFinal &&
                            <div style={{marginTop: 8, color: "#749be8"}}>
                                <span>This the package's final destination.</span>
                            </div>
                            }
                        </div>

                        {/* Dropdown a la derecha */}
                        <Select
                            style={{width: 120}}
                            placeholder="Status"
                            value={shipmentStatus || "pending"}
                            onChange={setShipmentStatus}
                        >
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option className={"confirmation-dropdown-item"}
                                           value="received">Received</Select.Option>
                        </Select>
                    </div>
                </Card>

                <div style={{textAlign: "right"}}>
                    <Button style={{marginRight: 8}} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (shipmentStatus === "received") {
                                console.log("Package received at destination");
                                handleConfirmShipment();
                            } else {
                                console.log("Package is still pending");
                                handleConfirmShipment();
                            }
                        }}
                        disabled={!shipmentStatus} // deshabilitado hasta seleccionar
                    >
                        Confirm Arrival
                    </Button>
                </div>

                <Divider />
                <Card style={{marginBottom: 16, border: '1px solid #ff4d4f'}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        {/* Contenedor de textos a la izquierda */}
                        <div style={{paddingRight: 16}}>
                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                <Text>Cancel package delivery</Text>
                            </div>
                            <Text
                                type="secondary">When pressing this botton you're cancelling the delivery of the package. It will be sent back to the origin location.</Text>
                        </div>
                        <Button
                            type="primary"
                            danger
                            style={{ marginRight: 8 }}
                            onClick={() => setIsCancelModalOpen(true)}
                        >
                            Cancel delivery
                        </Button>

                    </div>
                </Card>
            </>
        )}


        {/* Estado arrived-at */}
        {modalState === "arrived-at" && (
            <>
                <Card title="Package has arrived at one of our warehouses" style={{marginBottom: 16}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 16}}>
                        <CheckCircleTwoTone twoToneColor="#52c41a" style={{fontSize: 20}}/>
                        Arrived at: {lastLocation.depot?.name || "One of our depotss"}
                    </div>

                    <div style={{marginBottom: 12}}>
                        <Text strong>Select where the package should go next:</Text>
                        <Select
                            style={{width: "100%", marginTop: 8}}
                            placeholder="Select destination type"
                            value={destinationType || undefined}
                            onChange={setDestinationType}
                        >
                            <Select.Option value="final">Final destination</Select.Option>
                            <Select.Option value="depot">Warehouse</Select.Option>
                        </Select>
                    </div>

                    {destinationType === "depot" && (
                        <div>
                            <Text strong>Select a warehouse:</Text>
                            <Select
                                style={{width: "100%", marginTop: 8}}
                                placeholder="Select warehouse"
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

                <div style={{textAlign: "right"}}>
                    <Button style={{marginRight: 8}} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        disabled={!destinationType || (destinationType === "depot" && !selectedDepot)}
                    >
                        Confirm destination
                    </Button>
                </div>
            </>
        )}
            {/* Modal de confirmación de cancelación */}
            <Modal
                title="Confirm Cancellation"
                open={isCancelModalOpen}
                onOk={() => {
                    handleCancelShipment();
                    setIsCancelModalOpen(false);
                }}
                onCancel={() => setIsCancelModalOpen(false)}
                okText="Yes, Cancel"
                cancelText="No, Go Back"
                okButtonProps={{ danger: true, type: "primary" }}
            >
                <p>
                    Are you sure you want to cancel the delivery of this package?
                    It will be sent back to the sender.
                </p>
            </Modal>

        </>
    )
}
