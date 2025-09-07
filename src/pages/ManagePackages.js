import React, {useState, useEffect} from "react";
import { Button, Card, Modal, List, Input, message } from "antd";
import { RegisterPackageForm } from "../components/forms/RegisterPackageForm";
import UpdatePackageModal from "./UpdatePackage";
import {useAddresses} from "../hooks/services/useAddresses";
import {usePackages} from "../hooks/services/usePackages";
import api from "../lib/axios";
import PackageListCard from "../components/PackageListCard";
import {useTracks} from "../hooks/services/useTracks";

const { Search } = Input;

export default function ManagePackages() {
    // TODO -> esto esta estatico para probar, una vez que este lo de auth cambiar por    const { role } = useContext(AuthContext);
    // roles -> admin | user
    const role = "user";

    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
    const [setUpdateModalVisible] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [filterText, setFilterText] = useState("");

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
    }, []);


    useEffect(() => {
        if (!filterText) {
            setFilteredPackages(packages);
            return;
        }
        const lower = filterText.toLowerCase();
        setFilteredPackages(
            packages.filter(
                (pkg) =>
                    pkg.id.toLowerCase().includes(lower) ||
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
    return (
        <div style={{ padding: "2rem" }}>
            {role === "user" && (
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

            {/* Filter input */}
            {role === "admin" && (
            <Card
                title="Filter Packages"
                style={{ maxWidth: 800, margin: "0 auto 1rem auto" }}
            >
                <Search
                    placeholder="Search by ID, city, or state"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    allowClear
                />
            </Card>
            )}

            {/* Packages list */}
            {role === "admin" && filteredPackages.length > 0 && (
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
                {selectedPackage && (
                    <UpdatePackageModal
                        onClose={() => {
                            setUpdateModalVisible(false);
                            setSelectedPackage(null);
                        }}
                        packageData={selectedPackage}
                    />
                )}
            </Modal>
        </div>
    );
}
