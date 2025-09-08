import {useEffect, useState} from "react"
import {Modal, Button, Card, Select, Typography, Divider} from "antd"
import {EnvironmentOutlined, CheckCircleTwoTone} from "@ant-design/icons"
import {useTracks} from "../hooks/services/useTracks";
import {useDepots} from "../hooks/services/useDepots";
import {useAddresses} from "../hooks/services/useAddresses";

const {Text} = Typography


const actions = Object.freeze({
    create: "CREATE", // arrived-at
    sentToDepot: "SEND_DEPOT", // send-to
    arrivedDepot: "ARRIVED_DEPOT", // arrived-at
    sentToFinal: "SEND_FINAL", // send-to
    arrivedFinal: "ARRIVED_FINAL", // update botton should not be shown
    cancelled: "CANCEL", // update botton should not be shown
});

export default function UpdatePackageModal({onClose, packageData}) {
    const [modalState, setModalState] = useState("send-to");
    const [lastLocation, setLastLocation] = useState([]);
    const [lastDepotName, setLastDepotName] = useState("")


    const { getLatestPackageTrack } = useTracks();
    const { getDepots, getDepotById } = useDepots();
    const { getAddress } = useAddresses();

    const { postPackageTrack } = useTracks();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const warehouses = await getDepots();
                const lastTrack = await getLatestPackageTrack(packageData.code);
                console.log("LAST_TRACK",lastTrack);
                const depot = await getDepotById(lastTrack.data.depot);

                console.log("DEPOT:", depot)
                setModalState(
                    lastTrack.data.action === actions.arrivedDepot || lastTrack.data.action === actions.create
                        ? "arrived-at"
                        : "send-to"
                );

                setLastLocation(lastTrack.data);
                setDepots(warehouses.data);
                setLastDepotName(depot.data.name);

            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [getAddress, getDepotById, getDepots, getLatestPackageTrack, packageData, packageData.code]);

    const [destinationType, setDestinationType] = useState("")
    const [selectedDepot, setSelectedDepot] = useState("")
    const [shipmentStatus, setShipmentStatus] = useState("");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);


    const [depots, setDepots] = useState([]);

    const handleConfirm = () => {
        console.log("Confirming new destination:", {
            modalState,
            destinationType,
            selectedDepot,
        })
        postPackageTrack(packageData.code, {
            action: destinationType === "depot" ?  actions.sentToDepot : actions.sentToFinal,
            comment: "Package sent to " + (destinationType === "depot" ? "depot " + selectedDepot : "final destination"),
        })
        onClose()
        resetForm()
    }

    const handleConfirmShipment = () => {

        postPackageTrack(packageData.code, {
            action: lastLocation.action === actions.sentToFinal ? actions.arrivedFinal : actions.arrivedDepot,
            depot: lastLocation.action === actions.sentToFinal ? null : lastLocation.id,
            comment: "Package has arrived at " + (lastLocation.action === actions.sentToFinal ? "final destination" : "depot " + lastLocation.name),
        })
        console.log("Confirming shipment")
        onClose()
        resetForm()
    }

    const handleCancelShipment = () => {
        postPackageTrack(packageData.code, {
            action: actions.cancelled,
            depot:  null,
            comment: "Shipment cancelled, package is being returned to sender.",
        })
        console.log("Cancelling shipment")
        onClose()
        resetForm()
    }

    const handleCancel = () => {
        onClose()
        resetForm()
    }

    const resetForm = () => {
        setModalState(lastLocation.action === actions.arrivedDepot
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
                                <Text strong>Package on the way to: {lastDepotName}</Text>
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
                        Arrived at: {lastLocation.name || "One of our depots"}
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

                <Divider />
                <Card style={{marginBottom: 16, border: '1px solid #ff4d4f'}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
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
