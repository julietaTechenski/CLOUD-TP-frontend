"use client"

import { useState } from "react"
import { createElement as h } from "react"

const API_BASE_URL = "http://localhost:8001/api"

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

const getActionDetails = (action) => {
    const actionMap = {
        CREATE: {
            title: "Paquete creado",
            description: "El paquete ha sido registrado en el sistema",
            icon: "📦",
        },
        SEND_DEPOT: {
            title: "Enviado a depósito",
            description: "El paquete está en camino al centro de distribución",
            icon: "🚛",
        },
        ARRIVED_DEPOT: {
            title: "Llegó al depósito",
            description: "El paquete ha llegado al centro de distribución",
            icon: "📍",
        },
        SEND_FINAL: {
            title: "En camino al destino",
            description: "El paquete está siendo enviado al destino final",
            icon: "🚛",
        },
        ARRIVED_FINAL: {
            title: "Entregado",
            description: "El paquete ha sido entregado exitosamente",
            icon: "✅",
        },
        CANCELLED: {
            title: "Cancelado",
            description: "El envío ha sido cancelado",
            icon: "❌",
        },
    }

    return (
        actionMap[action] || {
            title: action,
            description: "Actualización del estado del paquete",
            icon: "📦",
        }
    )
}

const mapPackageState = (state) => {
    const stateMap = {
        CREATED: "Creado",
        IN_TRANSIT: "En tránsito",
        ON_HOLD: "En depósito",
        DELIVERED: "Entregado",
        CANCELLED: "Cancelado",
    }
    return stateMap[state] || state
}

export default function TrackPackage() {
    const [trackingNumber, setTrackingNumber] = useState("")
    const [packageData, setPackageData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!trackingNumber.trim()) {
            setError("Por favor ingresa un código de seguimiento")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const packageResponse = await fetch(`${API_BASE_URL}/packages/${trackingNumber}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!packageResponse.ok) {
                if (packageResponse.status === 404) {
                    throw new Error("Código de seguimiento no encontrado")
                }
                throw new Error("Error al buscar el paquete")
            }

            const packageInfo = await packageResponse.json()

            const tracksResponse = await fetch(`${API_BASE_URL}/packages/${trackingNumber}/tracks/`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!tracksResponse.ok) {
                throw new Error("Error al obtener el historial de seguimiento")
            }

            const tracks = await tracksResponse.json()

            const [originResponse, destinationResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/addresses/${packageInfo.origin}/`, {
                    headers: { "Content-Type": "application/json" },
                }),
                fetch(`${API_BASE_URL}/addresses/${packageInfo.destination}/`, {
                    headers: { "Content-Type": "application/json" },
                }),
            ])

            const origin = originResponse.ok ? await originResponse.json() : null
            const destination = destinationResponse.ok ? await destinationResponse.json() : null

            const steps = tracks.map((track, index) => {
                const actionDetails = getActionDetails(track.action)
                const isLast = index === tracks.length - 1
                const isCompleted = !isLast || track.action === "ARRIVED_FINAL"

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

            const processedPackageData = {
                trackingNumber: packageInfo.code,
                status: mapPackageState(packageInfo.state),
                estimatedDelivery: formatDate(estimatedDelivery.toISOString()),
                currentLocation: destination ? `${destination.city}, ${destination.province}` : "En tránsito",
                recipient: packageInfo.receiver_name,
                receiverEmail: packageInfo.receiver_email,
                size: packageInfo.size,
                weight: `${packageInfo.weight} kg`,
                createdAt: formatDate(packageInfo.created_at),
                steps: steps.reverse(),
            }

            setPackageData(processedPackageData)
        } catch (err) {
            console.error("[v0] Error fetching package data:", err)
            setError(err instanceof Error ? err.message : "Error al buscar el paquete")
            setPackageData(null)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "entregado":
                return {
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "en tránsito":
                return {
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "en depósito":
                return {
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                }
            case "cancelado":
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
                    "Seguimiento de Paquetes",
                ),
                h(
                    "p",
                    {
                        style: {
                            color: "#6b7280",
                            fontSize: "18px",
                        },
                    },
                    "Rastrea tu paquete en tiempo real",
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
                        "🔍 Buscar Paquete",
                    ),
                    h(
                        "p",
                        {
                            style: {
                                color: "#6b7280",
                                fontSize: "14px",
                            },
                        },
                        "Ingresa tu código de seguimiento para ver el estado de tu envío",
                    ),
                ),
                h(
                    "div",
                    { style: { display: "flex", gap: "16px", marginBottom: "16px" } },
                    h("input", {
                        type: "text",
                        placeholder: "Ej: 10000001",
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
                        isLoading ? "⏳ Buscando..." : "Rastrear",
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
                            "Información del Paquete",
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
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Código de seguimiento"),
                            h("p", { style: { fontFamily: "monospace", fontWeight: "600" } }, packageData.trackingNumber),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Destinatario"),
                            h("p", { style: { fontWeight: "600" } }, packageData.recipient),
                        ),
                        h(
                            "div",
                            null,
                            h(
                                "p",
                                { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } },
                                "Email del destinatario",
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
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Tamaño"),
                            h("p", { style: { fontWeight: "600" } }, packageData.size),
                        ),
                        h(
                            "div",
                            null,
                            h("p", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" } }, "Peso"),
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
                            "Historial de Seguimiento",
                        ),
                        h(
                            "p",
                            {
                                style: {
                                    color: "#6b7280",
                                    fontSize: "14px",
                                },
                            },
                            "Sigue el progreso de tu paquete paso a paso",
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
                        "¿Cómo usar el seguimiento?",
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
                        "Ingresa tu código de seguimiento en el campo de búsqueda para ver el estado de tu paquete",
                    ),
                ),
            ),
        ),
    )
}
