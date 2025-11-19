import {useEffect, useState} from "react"
import {Modal, Button, Card, Select, Typography, Divider} from "antd"
import {EnvironmentOutlined, CheckCircleTwoTone} from "@ant-design/icons"
import {useTracks} from "../hooks/services/useTracks";
import {useDepots} from "../hooks/services/useDepots";

const {Text} = Typography


const actions = Object.freeze({
    create: "CREATE", // arrived-at
    sentToDepot: "SEND_DEPOT", // send-to
    arrivedDepot: "ARRIVED_DEPOT", // arrived-at
    sentToFinal: "SEND_FINAL", // send-to
    arrivedFinal: "ARRIVED_FINAL", // update botton should not be shown
    cancel: "CANCEL", // update botton should not be shown
});

export default function UpdatePackageModal({onClose, packageData, setPackageUpdated}) {
    const [modalState, setModalState] = useState("");
    const [lastLocation, setLastLocation] = useState([]);
    const [lastDepotName, setLastDepotName] = useState("")



    const { getLatestPackageTrack } = useTracks();
    const { getDepots, getDepotById } = useDepots();

    const { postPackageTrack } = useTracks();

    const [currentActionIsCancel, setCurrentActionIsCancel] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const warehouses = await getDepots();
                const lastTrack = await getLatestPackageTrack(packageData.code);
                if ((lastTrack.data.action === actions.sentToDepot ||
                    lastTrack.data.action === actions.arrivedDepot) && !currentActionIsCancel ) {
                    if (lastTrack.data.depot_id) {
                        const depot = await getDepotById(lastTrack.data.depot_id);
                        setLastDepotName(depot.data.name);
                    }
                }
                setModalState(
                    lastTrack.data.action === actions.arrivedDepot || lastTrack.data.action === actions.create
                        ? "arrived-at"
                        : "send-to"
                );

                setLastLocation(lastTrack.data);
                setDepots(warehouses.data);


            } catch (err) {
                console.error(err);
            }
        };
        fetchData();

    }, [currentActionIsCancel, getDepotById, getDepots, getLatestPackageTrack, packageData, packageData.code]);

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

        if (destinationType === "depot") {
            postPackageTrack(packageData.code, {
                action: actions.sentToDepot,
                depot_id: selectedDepot,
                comment: "Package sent to depot",
            })
        } else if (destinationType === "final") {
            postPackageTrack(packageData.code, {
                action: actions.sentToFinal,
                comment: "Package sent to final destination",
            })
        }

        setPackageUpdated(true)
        onClose()
        resetForm()
    }

    const handleConfirmShipment = () => {
        if(lastLocation.action === actions.sentToFinal) {
            postPackageTrack(packageData.code, {
                action: actions.arrivedFinal,
                comment: "Package has arrived at final destination",
            })
        } else if (lastLocation.action === actions.sentToDepot) {
            postPackageTrack(packageData.code, {
                action: actions.arrivedDepot,
                depot_id: lastLocation.depot_id,
                comment: "Package has arrived at depot"
            })
        }

        console.log("Confirming shipment")
        setPackageUpdated(true)
        onClose()
        resetForm()
    }

    const handleCancelShipment = () => {
        postPackageTrack(packageData.code, {
            action: actions.cancel,
            depot_id: null,
            comment: "Shipment cancelled, package is being returned to sender.",
        })
        console.log("Cancelling shipment")
        setPackageUpdated(true)
        setCurrentActionIsCancel(true)
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
                    <Card className="mb-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                            {/* Contenedor de textos a la izquierda */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <EnvironmentOutlined className="text-lg text-[#1890ff]"/>
                                    <Text strong className="text-[13px] md:text-sm break-words">
                                        Package on the way to: { lastLocation.action === actions.sentToDepot ? lastDepotName : `${packageData.destination.street}, ${packageData.destination.city}`}
                                    </Text>
                                </div>
                                <Text
                                    type="secondary" 
                                    className="text-xs md:text-[13px] break-words"
                                >
                                    Final destination: {packageData.destination?.street}, {packageData.destination?.city}
                                </Text>

                                { lastLocation.action === actions.sentToFinal &&
                                    <div className="mt-2 text-[#749be8] text-xs md:text-[13px]">
                                        <span>This the package's final destination.</span>
                                    </div>
                                }
                            </div>

                            {/* Dropdown a la derecha */}
                            <Select
                                className="w-full md:w-[120px]"
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

                    <div className="text-left md:text-right flex flex-col md:flex-row gap-2 md:gap-0">
                        <Button 
                            className="mr-0 md:mr-2 w-full md:w-auto"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                if (shipmentStatus === "received") {
                                    handleConfirmShipment();
                                }
                            }}
                            disabled={!shipmentStatus}
                            className="w-full md:w-auto"
                        >
                            Confirm Arrival
                        </Button>
                    </div>

                    <Divider />
                    <Card className="mb-4 border border-[#ff4d4f]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                            <div className="pr-0 md:pr-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Text className="text-[13px] md:text-sm">Cancel package delivery</Text>
                                </div>
                                <Text
                                    type="secondary"
                                    className="text-[11px] md:text-xs break-words"
                                >
                                    When pressing this botton you're cancelling the delivery of the package. It will be sent back to the origin location.
                                </Text>
                            </div>
                            <Button
                                type="primary"
                                danger
                                className="mr-0 md:mr-2 w-full md:w-auto"
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
                    <Card title={actions.create === lastLocation.action ? "Package is ready to be sent": "Package has arrived at one of our warehouses"} className="mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircleTwoTone twoToneColor="#52c41a" className="text-xl"/>
                            {lastLocation.action === actions.create ? "Package at origin location" : `Arrived at: ${lastDepotName}`}
                        </div>

                        <div className="mb-3">
                            <Text strong>Select where the package should go next:</Text>
                            <Select
                                className="w-full mt-2"
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
                                    className="w-full mt-2"
                                    placeholder="Select warehouse"
                                    value={selectedDepot || undefined}
                                    onChange={setSelectedDepot}
                                >
                                    {depots.map((depot) => (
                                        <Select.Option key={depot.depot_id} value={depot.depot_id}>
                                            {depot.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </Card>

                    <div className="text-left md:text-right flex flex-col md:flex-row gap-2 md:gap-0">
                        <Button 
                            className="mr-0 md:mr-2 w-full md:w-auto"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleConfirm}
                            disabled={!destinationType || (destinationType === "depot" && !selectedDepot)}
                            className="w-full md:w-auto"
                        >
                            Confirm destination
                        </Button>
                    </div>

                    <Divider />
                    <Card className="mb-4 border border-[#ff4d4f]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                            <div className="pr-0 md:pr-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Text className="text-[13px] md:text-sm">Cancel package delivery</Text>
                                </div>
                                <Text
                                    type="secondary"
                                    className="text-[11px] md:text-xs break-words"
                                >
                                    When pressing this botton you're cancelling the delivery of the package. It will be sent back to the origin location.
                                </Text>
                            </div>
                            <Button
                                type="primary"
                                danger
                                className="mr-0 md:mr-2 w-full md:w-auto"
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
