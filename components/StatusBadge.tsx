interface StatusBadgeProps {
  status: "CONNECTED" | "RECONNECTING" | "ERROR" | "DISCONNECTED"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return { color: "bg-green-500", text: "CONNECTED", pulse: false }
      case "RECONNECTING":
        return { color: "bg-yellow-500", text: "RECONNECTING...", pulse: true }
      case "ERROR":
        return { color: "bg-red-500", text: "ERROR", pulse: false }
      default:
        return { color: "bg-gray-500", text: "DISCONNECTED", pulse: false }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`}></div>
      <span className="text-sm font-medium text-gray-700">{config.text}</span>
    </div>
  )
}
