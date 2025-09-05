import { useState } from "react";

const apiUrl = process.env.REACT_APP_API_URL;


export default function Test() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTestConnection = async () => {
        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch(`${apiUrl}/test/`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            setResponse(data.message);
        } catch (error) {
            setResponse(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <button
                onClick={handleTestConnection}
                style={{
                    padding: "1rem 2rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    borderRadius: "8px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                }}
            >
                Test Connection
            </button>

            <div style={{ marginTop: "1.5rem", fontSize: "1.2rem" }}>
                {loading ? "Checking..." : response}
            </div>
        </div>
    );
}
