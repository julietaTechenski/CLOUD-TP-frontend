import React from "react";
import {Form, Input, Button, Card, Row, Col, message, Upload} from "antd";
import {HomeOutlined, FlagOutlined, MailOutlined, UserOutlined, BoxPlotOutlined, UploadOutlined} from "@ant-design/icons";
import api from "../../lib/axios";
import {useAddresses} from "../../hooks/services/useAddresses";
import {usePackages} from "../../hooks/services/usePackages";
import {useImages} from "../../hooks/services/useImages";

export function RegisterPackageForm({ onSubmit }) {
    const [form] = Form.useForm();
    const { createPackage } = usePackages();
    const { createAddress } = useAddresses();
    const { uploadImage, loading: imageLoading } = useImages();

    const handleFinish = async (values) => {
        try {
            console.log("Starting package creation process...");
            
            // Step 1: Create addresses
            console.log("Creating addresses...");
            const originAddress = await createAddress(values.origin);
            console.log("Origin address created:", originAddress);
            
            const destinationAddress = await createAddress(values.destination);
            console.log("Destination address created:", destinationAddress);

            // Step 2: Create package
            console.log("Creating package...");
            const pkg = await createPackage({
                origin: originAddress.data.address_id,
                destination: destinationAddress.data.address_id,
                receiver_name: values.receiver,
                receiver_email: values.email,
                size: values.size,
                status: "CREATED",
                weight: values.weight,
                email: values.email,
            });
            console.log("Package created:", pkg);

            // Step 3: Upload image if provided (using pre-signed URL)
            if (values.image && values.image[0]) {
                console.log("Uploading image using pre-signed URL...");
                const file = values.image[0].originFileObj;
                const imageResult = await uploadImage(pkg.data.code, file, 'CREATION');
                console.log("Image uploaded:", imageResult);
            }

            form.resetFields();
            if (onSubmit) onSubmit(pkg.data, () => form.resetFields());
            message.success("Package created successfully!");
        } catch (err) {
            console.error("Error creating package:", err);
            message.error("Something went wrong while creating the package");
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
                xs={24}
                sm={field.name === "details" ? 24 : 12}
                md={field.name === "details" ? 24 : 12}
                className="pr-3 pb-3"
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
            className="max-w-[700px] mx-auto w-full px-0 md:px-0"
        >
            {/* Package Details */}
            <Card
                title={<span className="text-[#faad14]"><BoxPlotOutlined /> Package Details</span>}
                className="mb-4 border-l-[5px] border-l-[#faad14]"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={12} className="pr-3 pb-3">
                        <Form.Item
                            label="Size (LxWxH)"
                            name="size"
                            rules={[{ required: true, message: "Please enter the package size" }]}
                        >
                            <Input placeholder="e.g. 30x20x15 cm" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} className="pr-3 pb-3">
                        <Form.Item
                            label="Weight"
                            name="weight"
                            rules={[{ required: true, message: "Please enter the package weight" }]}
                        >
                            <Input placeholder="e.g. 2.5 kg" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Upload image */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Package Image"
                            name="image"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                            extra="Upload an image of the package (optional)"
                        >
                            <Upload
                                name="image"
                                listType="picture"
                                beforeUpload={() => false}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            {/* Origin */}
            <Card
                title={<span className="text-[#1890ff]"><HomeOutlined /> Origin</span>}
                className="mb-4 border-l-[5px] border-l-[#1890ff]"
            >
                <Row gutter={16}>
                    {renderAddressFields("origin")}
                </Row>
            </Card>

            {/* Destination */}
            <Card
                title={<span className="text-[#52c41a]"><FlagOutlined /> Destination</span>}
                className="mb-4 border-l-[5px] border-l-[#52c41a]"
            >
                <Row gutter={16}>
                    {renderAddressFields("destination")}
                </Row>
            </Card>


            {/* Receiver */}
            <Card
                title={<span className="text-[#722ed1]"><UserOutlined /> Receiver</span>}
                className="mb-4 border-l-[5px] border-l-[#722ed1]"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={12} className="pr-3 pb-3">
                        <Form.Item
                            label="Name"
                            name="receiver"
                            rules={[{ required: true, message: "Please enter the receiver's name" }]}
                        >
                            <Input placeholder="Receiver name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} className="pr-3 pb-3">
                        <Form.Item
                            label="Email"
                            name="email"
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
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full"
                    loading={imageLoading}
                >
                    Register Delivery
                </Button>
            </Form.Item>
        </Form>
    );
}
