import React from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import {HomeOutlined, FlagOutlined, MailOutlined, UserOutlined, BoxPlotOutlined} from "@ant-design/icons";
import api from "../../lib/axios";
import {useReceivers} from "../../hooks/services/useReceivers";
import {useAddresses} from "../../hooks/services/useAddresses";
import {usePackages} from "../../hooks/services/usePackages";

export function RegisterPackageForm() {
    const [form] = Form.useForm();
    const { createPackage } = usePackages(api);
    const { createAddress } = useAddresses(api);
    const { createReceiver } = useReceivers(api);


    const handleFinish = async (values) => {
        try {
            const token = sessionStorage.getItem("access_token");

            const originAddress = await createAddress(values.origin, token);
            const destinationAddress = await createAddress(values.destination, token);

            const receiver = await createReceiver(
                { name: values.receiver, email: values.email },
                token
            );

            const pkg = await createPackage(
                {
                    origin: originAddress.id,
                    destination: destinationAddress.id,
                    receiver: receiver.id,
                    size: values.size,
                    weight: values.weight,
                },
                token
            );

            console.log("Package created:", pkg);
            form.resetFields();
        } catch (err) {
            console.error("Error creating package:", err);
        }
    };


    const addressFields = [
        { label: "Street", name: "street" },
        { label: "Number", name: "number" },
        { label: "Apartment (optional)", name: "apartment", optional: true },
        { label: "City", name: "city" },
        { label: "Province", name: "province" },
        { label: "Zip Code", name: "zip_code" },
        { label: "Details (optional)", name: "details", optional: true },
    ];

    const renderAddressFields = (prefix) =>
        addressFields.map((field) => (
            <Col
                key={`${prefix}-${field.name}`}
                span={field.name === "details" ? 24 : 12} // full width for details
                style={{ paddingRight: 12, paddingBottom: 12 }}
            >
                <Form.Item
                    label={field.label}
                    name={[prefix, field.name]}
                    rules={
                        field.optional ? [] : [{ required: true, message: `Please enter ${prefix} ${field.label}` }]
                    }
                >
                    {field.name === "details" ? (
                        <Input.TextArea placeholder={field.label} rows={3} />
                    ) : (
                        <Input placeholder={field.label} size="middle" />
                    )}
                </Form.Item>
            </Col>
        ));

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            style={{ maxWidth: 700, margin: "0 auto" }}
        >
            {/* Package Details */}
            <Card
                title={<span style={{ color: "#faad14" }}><BoxPlotOutlined /> Package Details</span>}
                style={{ marginBottom: 16, borderLeft: "5px solid #faad14" }}
            >
                <Row gutter={16}>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Size (LxWxH)"
                            name="size"
                            rules={[{ required: true, message: "Please enter the package size" }]}
                        >
                            <Input placeholder="e.g. 30x20x15 cm" />
                        </Form.Item>
                    </Col>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Weight"
                            name="weight"
                            rules={[{ required: true, message: "Please enter the package weight" }]}
                        >
                            <Input placeholder="e.g. 2.5 kg" />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            {/* Origin */}
            <Card
                title={<span style={{ color: "#1890ff" }}><HomeOutlined /> Origin</span>}
                style={{ marginBottom: 16, borderLeft: "5px solid #1890ff" }}
            >
                <Row gutter={16}>
                    {renderAddressFields("origin")}
                </Row>
            </Card>

            {/* Destination */}
            <Card
                title={<span style={{ color: "#52c41a" }}><FlagOutlined /> Destination</span>}
                style={{ marginBottom: 16, borderLeft: "5px solid #52c41a" }}
            >
                <Row gutter={16}>
                    {renderAddressFields("destination")}
                </Row>
            </Card>


            {/* Receiver */}
            <Card
                title={<span style={{ color: "#722ed1" }}><UserOutlined /> Receiver</span>}
                style={{ marginBottom: 16, borderLeft: "5px solid #722ed1" }}
            >
                <Row gutter={16}>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Name"
                            name="receiver"
                            rules={[{ required: true, message: "Please enter the receiver's name" }]}
                        >
                            <Input placeholder="Receiver name" />
                        </Form.Item>
                    </Col>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Email"
                            name="receiverEmail"
                            rules={[
                                { required: true, message: "Please enter receiver email" },
                                { type: "email", message: "Please enter a valid email" }
                            ]}
                        >
                            <Input placeholder="Receiver email" prefix={<MailOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                    Register Delivery
                </Button>
            </Form.Item>
        </Form>
    );
}
