import { useNavigate } from "react-router-dom";
import { Button, Typography, Card } from "antd";
import "antd/dist/reset.css";

const ROUTES = {
    TRACK: "/track",
};

export default function Home() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                padding: "2rem",
            }}
        >
            <Card
                style={{
                    textAlign: "center",
                    borderRadius: "16px",
                    padding: "3rem",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
            >
                <Typography.Title style={{ color: "#333", fontSize: "2.5rem" }}>
                    Welcome to FastTrack Delivery
                </Typography.Title>
                <Typography.Paragraph style={{ fontSize: "1.2rem", color: "#555" }}>
                    Track your packages and get updates instantly. Just click below to get started!
                </Typography.Paragraph>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate(ROUTES.TRACK)}
                    style={{ marginTop: "2rem", padding: "0 2rem" }}
                >
                    Track Package
                </Button>
            </Card>
        </div>
    );
}
