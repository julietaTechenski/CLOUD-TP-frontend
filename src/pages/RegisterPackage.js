import React from "react";
import { Card } from "antd";
import {RegisterPackageForm} from "../components/forms/RegisterPackageForm";

export default function RegisterPackage() {

    return (
        <div style={{ padding: "2rem" }}>
            <Card title="Register a New Package" style={{ maxWidth: 700, margin: "0 auto" }}>
                <RegisterPackageForm/>
            </Card>
        </div>
    );
}
