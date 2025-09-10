import React, {useState, useEffect} from "react";
import { Button, Card, Modal, Input, message } from "antd";
import { RegisterPackageForm } from "../components/forms/RegisterPackageForm";
import UpdatePackageModal from "./UpdatePackage";
import {useAddresses} from "../hooks/services/useAddresses";
import {usePackages} from "../hooks/services/usePackages";
import PackageListCard from "../components/PackageListCard";
import {useTracks} from "../hooks/services/useTracks";
import {useAuth} from "../hooks/services/useAuth";

const { Search } = Input;

export default function ManagePackages() {
    const auth = useAuth();

    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [filterText, setFilterText] = useState("");

    const [packageUpdated, setPackageUpdated] = useState(false);


    const { getAddresses } = useAddresses();
    const { getPackages } = usePackages();
    const { getPackageTracks } = useTracks();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const addressesRes = await getAddresses();
                const packagesRes = await getPackages();

                const addressesMap = {};
                addressesRes.data.forEach((addr) => {
                    addressesMap[addr.id] = addr;
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
    };

    const userPackages = packages.filter(pkg => String(pkg.sender) === String(auth.userId));

    return (
        <div style={{ padding: "2rem" }}>
            {auth.role === "user" && (
            <Card
                title="Packages Management"
                style={{ maxWidth: 800, margin: "0 auto 2rem auto" }}
            >
                <Button
                    type="primary"
                    style={{ marginRight: 16 }}
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
                            style={{ maxWidth: 800, margin: "1rem auto" }}
                        >
                            <ul>
                                {userPackages.map((pkg) => (
                                    <li key={pkg.id} style={{ marginBottom: "0.5rem" }}>
                                        <strong>Code:</strong> {pkg.code} | <strong>Status:</strong> {pkg.state}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    );
                } else {
                    return (
                        <Card
                            title="Your Packages"
                            style={{ maxWidth: 800, margin: "1rem auto", textAlign: "center" }}
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
                style={{ maxWidth: 800, margin: "0 auto 1rem auto" }}
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
                    onSelectPackage={setSelectedPackage}
                    onUpdatePackage={(pkg) => {
                        setSelectedPackage(pkg);
                        setUpdateModalVisible(true);
                    }}
                />
            )}

            {/* Register Modal */}
            <Modal
                title="Register Delivery Package"
                open={isRegisterModalVisible}
                onCancel={() => setRegisterModalVisible(false)}
                footer={null}
                width={800}
            >
                <RegisterPackageForm
                    onSubmit={(pkg, resetForm) => {
                        handleNewPackage(pkg);
                        resetForm();
                        setRegisterModalVisible(false);
                    }}
                />
            </Modal>

            {/* Update Status Modal */}
            <Modal
                title="Update Package"
                open={!!selectedPackage}
                onCancel={() => setSelectedPackage(null)}
                footer={null}
                width={600}
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
