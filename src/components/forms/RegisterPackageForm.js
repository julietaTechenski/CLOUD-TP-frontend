import React from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import {HomeOutlined, FlagOutlined, MailOutlined, UserOutlined, BoxPlotOutlined} from "@ant-design/icons";

export function RegisterPackageForm({ onSubmit }) {
    const [form] = Form.useForm();
    // TODO -> esto esta estatico para probar, una vez que este lo de auth cambiar por    const { userId } = useContext(AuthContext);
    const { userId } = "1";


    const handleFinish = (values) => {
        const packageData = {
            ...values,
            sender: userId,
            status: "CREATED",
        };
        onSubmit(packageData, form.resetFields);
    };

    const addressFields = ["Street", "Number", "Apartment (optional)", "City", "Province", "Zip Code"];

    const renderAddressFields = (prefix) =>
        addressFields.map((field) => (
            <Col key={`${prefix}-${field}`} span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                <Form.Item
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={[prefix, field]}
                    rules={field === "Apartment (optional)" ? [] : [{ required: true, message: `Please enter ${prefix} ${field}` }]}
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
                <Row gutter={16}>
                    <Col span={24} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Comments"
                            name="comments"
                        >
                            <Input.TextArea placeholder="Add any additional notes or comments here..." rows={4} />
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

            {/* Sender */}
            <Card
                title={<span style={{ color: "#fa8c16" }}><UserOutlined /> Sender</span>}
                style={{ marginBottom: 16, borderLeft: "5px solid #fa8c16" }}
            >
                <Row gutter={16}>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Name"
                            name="sender"
                            rules={[{ required: true, message: "Please enter the sender's name" }]}
                        >
                            <Input placeholder="Sender name" />
                        </Form.Item>
                    </Col>
                    <Col span={12} style={{ paddingRight: 12, paddingBottom: 12 }}>
                        <Form.Item
                            label="Email"
                            name="senderEmail"
                            rules={[
                                { required: true, message: "Please enter sender email" },
                                { type: "email", message: "Please enter a valid email" }
                            ]}
                        >
                            <Input placeholder="Sender email" prefix={<MailOutlined />} />
                        </Form.Item>
                    </Col>
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
