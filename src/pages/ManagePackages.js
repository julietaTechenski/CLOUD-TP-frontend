import React, {useState, useEffect, useContext} from "react";
import { Button, Card, Modal, List, Select, Input, message } from "antd";
import { RegisterPackageForm } from "../components/forms/RegisterPackageForm";
import UpdatePackage from "./UpdatePackage";

const { Search } = Input;


// Mock data for testing
const MOCK_PACKAGES = [
    {
        id: "1",
        origin: { street: "Main St", city: "New York" },
        destination: { street: "2nd Ave", city: "Boston" },
        state: "in-transit",
        size: "Medium",
        weight: "2kg",
        track: [
            { date: "2025-09-05", location: "New York", status: "Picked up" },
            { date: "2025-09-06", location: "Philadelphia", status: "In transit" },
        ],
    }
];

export default function ManagePackages() {
    // TODO -> esto esta estatico para probar, una vez que este lo de auth cambiar por    const { role } = useContext(AuthContext);
    // roles -> admin | user
    const  role  = "user"

    const [packages, setPackages] = useState(MOCK_PACKAGES);
    const [filteredPackages, setFilteredPackages] = useState(MOCK_PACKAGES);
    const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
    const [ setUpdateModalVisible] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [filterText, setFilterText] = useState("");

    // Filter packages based on input
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
                    pkg.origin.city.toLowerCase().includes(lower) ||
                    pkg.destination.city.toLowerCase().includes(lower) ||
                    (pkg.state && pkg.state.toLowerCase().includes(lower))
            )
        );
    }, [filterText, packages]);

    const handleNewPackage = (pkg) => {
        setPackages((prev) => [...prev, pkg]);
        message.success(`Package ${pkg.id} registered!`);
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
            {role ==="admin" && filteredPackages && filteredPackages.length > 0 && (
                <Card title="Registered Packages" style={{ maxWidth: 800, margin: "0 auto" }}>
                    <List
                        dataSource={filteredPackages}
                        renderItem={(pkg) => (
                            <List.Item
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <div onClick={() => setSelectedPackage(pkg)} style={{ cursor: "pointer", flex: 1 }}>
                                    <List.Item.Meta
                                        title={`Package ID: ${pkg.id} | State: ${pkg.state || "pending"}`}
                                        description={
                                            <>
                                                <p>
                                                    Origin: {pkg.origin?.street}, {pkg.origin?.city} → Destination: {pkg.destination?.street}, {pkg.destination?.city}
                                                </p>
                                                {pkg.track && pkg.track.length > 0 && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <strong>Tracking History:</strong>
                                                        <ul>
                                                            {pkg.track.map((t, i) => (
                                                                <li key={i}>
                                                                    {t.date} - {t.location} ({t.status})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        }
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setSelectedPackage(pkg);
                                        setUpdateModalVisible(true);
                                    }}
                                >
                                    Update
                                </Button>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Register Modal */}
            <Modal
                title="Register Delivery Package"
                open={isRegisterModalVisible}
                onCancel={() => setRegisterModalVisible(false)}
                footer={null}
                width={800} // make it wider
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
                    <UpdatePackage/>
                )}
            </Modal>
        </div>
    );
}
