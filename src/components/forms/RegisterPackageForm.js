import React from "react";
import { Form, Input, Button, Card, Row, Col, Divider } from "antd";
import { HomeOutlined, FlagOutlined } from "@ant-design/icons";

export function RegisterPackageForm({ onSubmit }) {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit(values, form.resetFields);
    };

    const addressFields = ["Street", "Number", "Apartment (optional)", "City", "Province", "Zip Code"];

    const renderAddressFields = (prefix) =>
        addressFields.map((field) => (
            <Col key={`${prefix}-${field}`} span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                <Form.Item
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={[prefix, field]}
                    rules={field === "apartment" ? [] : [{ required: true, message: `Please enter ${prefix} ${field}` }]}
                >
                    <Input placeholder={field} size="middle" />
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

            <Divider>Package Details</Divider>

            {/* Package features */}
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

            <Row gutter={16}>
                <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                    <Form.Item
                        label="Sender"
                        name="sender"
                        rules={[{ required: true, message: "Please enter the sender's name" }]}
                    >
                        <Input placeholder="Sender name" />
                    </Form.Item>
                </Col>
                <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                    <Form.Item
                        label="Receiver"
                        name="receiver"
                        rules={[{ required: true, message: "Please enter the receiver's name" }]}
                    >
                        <Input placeholder="Receiver name" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                    Register Delivery
                </Button>
            </Form.Item>
        </Form>
    );
}
