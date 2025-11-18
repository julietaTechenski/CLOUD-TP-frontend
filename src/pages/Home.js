import { useNavigate } from "react-router-dom";
import { Button, Typography, Card } from "antd";
import "antd/dist/reset.css";

const ROUTES = {
    TRACK: "/track",
};

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#6C63FF] to-[#FF6584] p-2 md:p-8">
            <Card className="text-center rounded-2xl p-6 md:p-12 max-w-[500px] w-full shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <Typography.Title className="text-[#333] text-[1.8rem] md:text-[2.5rem]">
                    Welcome to FastTrack Delivery
                </Typography.Title>
                <Typography.Paragraph className="text-base md:text-xl text-[#555]">
                    Track your packages and get updates instantly. Just click below to get started!
                </Typography.Paragraph>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate(ROUTES.TRACK)}
                    className="mt-4 md:mt-8 px-6 md:px-8 w-full md:w-auto"
                >
                    Track Package
                </Button>
            </Card>
        </div>
    );
}
