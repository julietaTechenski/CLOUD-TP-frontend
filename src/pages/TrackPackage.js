"use client"

import { useState } from "react"
import { createElement as h } from "react"
import {useTracks} from "../hooks/services/useTracks";
import {usePackages} from "../hooks/services/usePackages";
import {useAddresses} from "../hooks/services/useAddresses";
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

const getActionDetails = (action) => {
    const actionMap = {
        CREATE: {
            title: "Package Created",
            description: "The package has been registered in the system",
            icon: "📦",
        },
        SEND_DEPOT: {
            title: "Sent to Depot",
            description: "The package is on its way to the distribution center",
            icon: "🚛",
        },
        ARRIVED_DEPOT: {
            title: "Arrived at Depot",
            description: "The package has arrived at the distribution center",
            icon: "📍",
        },
        SEND_FINAL: {
            title: "On the Way to Destination",
            description: "The package is being sent to its final destination",
            icon: "🚛",
        },
        ARRIVED_FINAL: {
            title: "Delivered",
            description: "The package has been successfully delivered",
            icon: "✅",
        },
        CANCELLED: {
            title: "Cancelled",
            description: "The shipment has been cancelled",
            icon: "❌",
        },
    }

    return (
        actionMap[action] || {
            title: action,
            description: "Package status update",
            icon: "📦",
        }
    )
}

const mapPackageState = (state) => {
    const stateMap = {
        CREATED: "Created",
        IN_TRANSIT: "In Transit",
        ON_HOLD: "On Hold",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
    }
    return stateMap[state] || state
}

export default function TrackPackage() {
    const [trackingNumber, setTrackingNumber] = useState("")
    const [packageData, setPackageData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const {getPackageTracks} = useTracks()
    const {getPackageById} = usePackages()
    const {getAddress} = useAddresses()
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!trackingNumber.trim()) {
            setError("Please enter a tracking code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            var where = 0
            const packageResponse = await getPackageById(trackingNumber);

            if (!packageResponse) {
                if (packageResponse.status === 404) {
                    throw new Error("Tracking code not found")
                }
                throw new Error("Error fetching the package")
            }
            where = 1
            const packageInfo =  packageResponse.data
            where = 2
            const tracksResponse = await getPackageTracks(trackingNumber);
            where = 3
            const tracks = tracksResponse.data
            where = 4
            const originResponse= await getAddress(packageInfo.origin);
            const  destinationResponse = await getAddress(packageInfo.destination);
            where = 5
            const origin = originResponse.data
            const destination = destinationResponse.data
            where = 6
            const steps = tracks.map((track, index) => {
                const actionDetails = getActionDetails(track.action)
                const isLast = index === tracks.length - 1
                const isCompleted = !isLast || track.action === "ARRIVED_FINAL"
                where = 7
                return {
                    id: track.id.toString(),
                    title: actionDetails.title,
                    description: track.comment || actionDetails.description,
                    date: formatDate(track.timestamp),
                    time: formatTime(track.timestamp),
                    location: track.depot
                        ? `Depósito ${track.depot}`
                        : origin
                            ? `${origin.city}, ${origin.province}`
                            : "Ubicación desconocida",
                    status: isCompleted ? "completed" : isLast ? "current" : "pending",
                    icon: actionDetails.icon,
                }
            })

            const lastTrack = tracks[tracks.length - 1]
            const estimatedDelivery = new Date(lastTrack.timestamp)
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)
            where = 8
            const processedPackageData = {
                trackingNumber: packageInfo.code,
                status: mapPackageState(packageInfo.state),
                estimatedDelivery: formatDate(estimatedDelivery.toISOString()),
                currentLocation: destination ? `${destination.city}, ${destination.province}` : "In Transit",
                recipient: packageInfo.receiver_name,
                receiverEmail: packageInfo.receiver_email,
                size: packageInfo.size,
                weight: `${packageInfo.weight} kg`,
                createdAt: formatDate(packageInfo.created_at),
                steps: steps.reverse(),
            }
            where = 9
            setPackageData(processedPackageData)
        } catch (err) {
            console.error(`Error fetching package data: ${where}`, err)
            setError(err instanceof Error ? err.message : "Error fetching the package")
            setPackageData(null)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return {
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "in transit":
                return {
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "on hold":
                return {
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "cancelled":
                return {
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            default:
                return {
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
        }
    }

    const getStepStatus = (status) => {
        switch (status) {
            case "completed":
                return { backgroundColor: "#10b981", color: "white" }
            case "current":
                return { backgroundColor: "#3b82f6", color: "white" }
            case "pending":
                return { backgroundColor: "#e5e7eb", color: "#6b7280" }
            default:
               return { backgroundColor: "#e5e7eb", color: "#6b7280"}
        }
    }

    return h(
        "div",
        {
            style: {
                minHeight: "100vh",
                backgroundColor: "#f9fafb",
                fontFamily: "system-ui, -apple-system, sans-serif",
            },
        },
        h(
            "div",
            {
                style: {
                    maxWidth: "1024px",
                    margin: "0 auto",
                    padding: "32px 16px",
                },
            },
            h(
                "div",
                { style: { textAlign: "center", marginBottom: "32px" } },
                h(
                    "h1",
                    {
                        style: {
                            fontSize: "36px",
                            fontWeight: "bold",
                            color: "#111827",
                            marginBottom: "8px",
                        },
                    },
                    "Package Tracking",
                ),
                h(
                    "p",
                    {
                        style: {
                            color: "#6b7280",
                            fontSize: "18px",
                        },
                    },
                    "Track your package in real time",
                ),
            ),

            h(
                "div",
                {
                    style: {
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        marginBottom: "32px",
                    },
                },
                h(
                    "div",
                    { style: { marginBottom: "16px" } },
                    h(
                        "h2",
                        {
                            style: {
                                fontSize: "20px",
                                fontWeight: "600",
                                marginBottom: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            },
                        },
                        "🔍 Search Package",
                    ),
                    h(
                        "p",
                        {
                            style: {
                                color: "#6b7280",
                                fontSize: "14px",
                            },
                        },
                        "Enter your tracking code to see the status of your shipment",
                    ),
                ),
                h(
                    "div",
                    { style: { display: "flex", gap: "16px", marginBottom: "16px" } },
                    h("input", {
                        type: "text",
                        placeholder: "e.g. 10000001",
                        value: trackingNumber,
                        onChange: (e) => setTrackingNumber(e.target.value),
                        onKeyPress: (e) => e.key === "Enter" && handleSearch(),
                        style: {
                            flex: 1,
                            padding: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "16px",
                        },
                    }),
                    h(
                        "button",
                        {
                            onClick: handleSearch,
                            disabled: isLoading,
                            style: {
                                padding: "12px 24px",
                                backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "16px",
                                fontWeight: "500",
                                cursor: isLoading ? "not-allowed" : "pointer",
                            },
                        },
                        isLoading ? "⏳ Searching..." : "Track",
                    ),
                ),
                error &&
                h(
                    "div",
                    {
                        style: {
                            padding: "12px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        },
                    },
                    h("span", { style: { color: "#dc2626" } }, "⚠️"),
                    h("span", { style: { color: "#dc2626", fontSize: "14px" } }, error),
                ),
            ),

            packageData &&
            h(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "24px" } },
                h(
                    "div",
                    {
                        style: {
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "24px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        },
                    },
                    h(
                        "div",
                        {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                            },
                        },
                        h(
                            "h2",
                            {
                                style: {
                                    fontSize: "20px",
                                    fontWeight: "600",
                                },
                            },
                            "Package Information",
                        ),
                        h("span", { style: getStatusColor(packageData.status) }, packageData.status),
                    ),
                    h(
                        "div",
                        {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "16px",
                            },
                        },
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Tracking code"),
                            h("p", { style: { fontFamily: "monospace", fontWeight: "600" } }, packageData.trackingNumber),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Recipient"),
                            h("p", { style: { fontWeight: "600" } }, packageData.recipient),
                        ),
                        h(
                            "div",
                            null,
                            h(
                                "p",
                                { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } },
                                "Recipient Email",
                            ),
                            h("p", { style: { fontWeight: "600" } }, packageData.receiverEmail),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Entrega estimada"),
                            h("p", { style: { fontWeight: "600" } }, packageData.estimatedDelivery),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Size"),
                            h("p", { style: { fontWeight: "600" } }, packageData.size),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Weight"),
                            h("p", { style: { fontWeight: "600" } }, packageData.weight),
                        ),
                    ),
                ),

                h(
                    "div",
                    {
                        style: {
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "24px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        },
                    },
                    h(
                        "div",
                        { style: { marginBottom: "16px" } },
                        h(
                            "h2",
                            {
                                style: {
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    marginBottom: "4px",
                                },
                            },
                            "Tracking History",
                        ),
                        h(
                            "p",
                            {
                                style: {
                                    color: "#6b7280",
                                    fontSize: "14px",
                                },
                            },
                            "Follow the progress of your package step by step",
                        ),
                    ),
                    h(
                        "div",
                        { style: { display: "flex", flexDirection: "column", gap: "16px" } },
                        packageData.steps.map((step, index) =>
                            h(
                                "div",
                                { key: step.id, style: { display: "flex", gap: "16px" } },
                                h(
                                    "div",
                                    { style: { display: "flex", flexDirection: "column", alignItems: "center" } },
                                    h(
                                        "div",
                                        {
                                            style: {
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "18px",
                                                ...getStepStatus(step.status),
                                            },
                                        },
                                        step.icon,
                                    ),
                                    index < packageData.steps.length - 1 &&
                                    h("div", {
                                        style: {
                                            width: "2px",
                                            height: "48px",
                                            marginTop: "8px",
                                            backgroundColor: step.status === "completed" ? "#10b981" : "#e5e7eb",
                                        },
                                    }),
                                ),
                                h(
                                    "div",
                                    { style: { flex: 1, paddingBottom: "32px" } },
                                    h(
                                        "div",
                                        {
                                            style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                marginBottom: "4px",
                                            },
                                        },
                                        h(
                                            "h3",
                                            {
                                                style: {
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                },
                                            },
                                            step.title,
                                        ),
                                        h(
                                            "div",
                                            { style: { textAlign: "right" } },
                                            h(
                                                "p",
                                                {
                                                    style: {
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                    },
                                                },
                                                step.date,
                                            ),
                                            h(
                                                "p",
                                                {
                                                    style: {
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                    },
                                                },
                                                step.time,
                                            ),
                                        ),
                                    ),
                                    h(
                                        "p",
                                        {
                                            style: {
                                                fontSize: "14px",
                                                color: "#6b7280",
                                                marginBottom: "4px",
                                            },
                                        },
                                        step.description,
                                    ),
                                    h(
                                        "p",
                                        {
                                            style: {
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            },
                                        },
                                        "📍",
                                        step.location,
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),

            !packageData &&
            !error &&
            h(
                "div",
                {
                    style: {
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    },
                },
                h(
                    "div",
                    { style: { textAlign: "center" } },
                    h(
                        "div",
                        {
                            style: {
                                fontSize: "48px",
                                marginBottom: "16px",
                            },
                        },
                        "📦",
                    ),
                    h(
                        "h3",
                        {
                            style: {
                                fontWeight: "600",
                                marginBottom: "8px",
                            },
                        },
                        "How to use the tracker?",
                    ),
                    h(
                        "p",
                        {
                            style: {
                                fontSize: "14px",
                                color: "#6b7280",
                                marginBottom: "16px",
                            },
                        },
                        "Enter your tracking code in the search field to see your package status",
                    ),
                ),
            ),
        ),
    )
}
