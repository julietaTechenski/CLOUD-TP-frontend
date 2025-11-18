import React, {useState, useEffect} from "react";
import { Button, Card, Modal, Input, message } from "antd";
import { RegisterPackageForm } from "../components/forms/RegisterPackageForm";
import UpdatePackageModal from "./UpdatePackage";
import QRCodeModal from "../components/QRCodeModal";
import {useAddresses} from "../hooks/services/useAddresses";
import {usePackages} from "../hooks/services/usePackages";
import PackageListCard from "../components/PackageListCard";
import {useTracks} from "../hooks/services/useTracks";
import {useAuth} from "../hooks/services/useAuth";
import {useDepots} from "../hooks/services/useDepots";

const { Search } = Input;

export default function ManagePackages() {
    const auth = useAuth();

    const [packages, setPackages] = useState([]);
    const [depotsMap, setDepotsMap] = useState({});
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
    const [setUpdateModalVisible] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrPackageCode, setQrPackageCode] = useState(null);
    const [qrPackageData, setQrPackageData] = useState(null);

    const [packageUpdated, setPackageUpdated] = useState(false);


    const { getAddresses } = useAddresses();
    const { getPackages, updatePackagePriority } = usePackages();
    const { getPackageTracks } = useTracks();
    const { getDepotById } = useDepots();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const addressesRes = await getAddresses();
                const packagesRes = await getPackages();

                const addressesMap = {};

                addressesRes.data.forEach((addr) => {
                    addressesMap[addr.address_id] = addr;
                });

                let packagesWithAddresses = packagesRes.data.map((pkg) => ({
                    ...pkg,
                    origin: addressesMap[pkg.origin],
                    destination: addressesMap[pkg.destination],
                }));

                packagesWithAddresses = await Promise.all(
                    packagesWithAddresses.map(async (pkg) => {
                        try {
                            const tracksRes = await getPackageTracks(pkg.code);
                            return {
                                ...pkg,
                                track: tracksRes.data || [],
                            };
                        } catch {
                            return { ...pkg, track: [] };
                        }
                    })
                );

                setPackages(packagesWithAddresses);
                setFilteredPackages(packagesWithAddresses);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
        setPackageUpdated(false);
    }, [packageUpdated]);

    useEffect(() => {
        const fetchDepots = async () => {
            const depotIds = new Set();
            packages.forEach(pkg => {
                (pkg.track || []).forEach(t => {
                    if (t.depot_id) depotIds.add(t.depot_id);
                });
            });

            const results = await Promise.allSettled(
                Array.from(depotIds).map(id => getDepotById(id))
            );

            const map = {};
            results.forEach((res, idx) => {
                if (res.status === "fulfilled") {
                    map[Array.from(depotIds)[idx]] = res.value.data;
                }
            });

            setDepotsMap(map);
        };

        fetchDepots();
    }, [packages, getDepotById]);


    useEffect(() => {
        if (!filterText) {
            setFilteredPackages(packages);
            return;
        }
        const lower = filterText.toLowerCase();
        setFilteredPackages(
            packages.filter(
                (pkg) =>
                    pkg.code.toLowerCase().includes(lower) ||
                    pkg.origin?.city.toLowerCase().includes(lower) ||
                    pkg.destination?.city.toLowerCase().includes(lower) ||
                    (pkg.state && pkg.state.toLowerCase().includes(lower))
            )
        );
    }, [filterText, packages]);

    const handleNewPackage = (pkg) => {
        setPackages((prev) => [...prev, pkg]);
        setFilteredPackages((prev) => [...prev, pkg]);
        message.success(`Package ${pkg.code} registered!`);
        // Show tracking QR code modal after creating package
        setQrPackageCode(pkg.code);
        setQrPackageData(pkg);
        setQrModalVisible(true);
    };

    const showQRCode = (pkg) => {
        setQrPackageCode(pkg.code);
        setQrPackageData(pkg);
        setQrModalVisible(true);
    };

    const userPackages = packages.filter(pkg => String(pkg.sender_id) === String(auth.userId));

    return (
        <div className="p-2 md:p-8">
            {auth.role === "user" && (
                <Card
                    title="Packages Management"
                    className="max-w-[800px] mx-auto mb-4 md:mb-8 w-full"
                >
                    <Button
                        type="primary"
                        className="mr-4"
                        onClick={() => setRegisterModalVisible(true)}
                    >
                        Register Package
                    </Button>
                </Card>
            )}

            {/* Packages list for current user */}
            {auth.role === "user" && (() => {
                if (userPackages.length > 0) {
                    return (
                        <Card
                            title="Your Packages"
                            className="max-w-[800px] my-2 md:my-4 mx-auto w-full"
                        >
                            <PackageListCard
                                packages={userPackages}
                                depotsMap={depotsMap}
                                onShowQR={showQRCode}
                                onSavePriority={async (pkg, prio) => {
                                    await updatePackagePriority(pkg.code, prio);
                                    setPackageUpdated(true);
                                }}
                            />
                        </Card>
                    );
                } else {
                    return (
                        <Card
                            title="Your Packages"
                            className="max-w-[800px] my-2 md:my-4 mx-auto text-center w-full"
                        >
                            You don’t have any packages yet
                        </Card>
                    );
                }
            })()}

            {/* Filter input */}
            {auth.role === "admin" && (
                <Card
                    title="Filter Packages"
                    className="max-w-[800px] mx-auto mb-2 md:mb-4 w-full"
                >
                    <Search
                        placeholder="Search by code, city, or state"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        allowClear
                    />
                </Card>
            )}

            {/* Packages list */}
            {auth.role === "admin" && filteredPackages.length > 0 && (
                <PackageListCard
                    packages={filteredPackages}
                    depotsMap={depotsMap}
                    onSelectPackage={setSelectedPackage}
                    onUpdatePackage={(pkg) => {
                        setSelectedPackage(pkg);
                        setUpdateModalVisible(true);
                    }}
                    onShowQR={showQRCode}
                />
            )}

            {/* Register Modal */}
            <Modal
                title="Register Delivery Package"
                open={isRegisterModalVisible}
                onCancel={() => setRegisterModalVisible(false)}
                footer={null}
                className="[&_.ant-modal]:w-[95%] md:[&_.ant-modal]:w-[800px]"
                width={window.innerWidth <= 768 ? "95%" : 800}
            >
                <RegisterPackageForm
                    onSubmit={(pkg, resetForm) => {
                        handleNewPackage(pkg);
                        resetForm();
                        setRegisterModalVisible(false);
                    }}
                />
            </Modal>

            {/* QR Code Modal */}
            <QRCodeModal
                visible={qrModalVisible}
                onClose={() => setQrModalVisible(false)}
                packageCode={qrPackageCode}
                packageData={qrPackageData}
                mode="tracking"
            />

            {/* Update Status Modal */}
            <Modal
                title="Update Package"
                open={!!selectedPackage}
                onCancel={() => setSelectedPackage(null)}
                footer={null}
                className="[&_.ant-modal]:w-[95%] md:[&_.ant-modal]:w-[600px]"
                width={window.innerWidth <= 768 ? "95%" : 600}
            >
                {selectedPackage !== null && (
                    <UpdatePackageModal
                        onClose={() => {
                            setUpdateModalVisible(false);
                            setSelectedPackage(null);
                        }}
                        packageData={selectedPackage}
                        setPackageUpdated={setPackageUpdated}
                    />
                )}
            </Modal>
        </div>
    );
}
