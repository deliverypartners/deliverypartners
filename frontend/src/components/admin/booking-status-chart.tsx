"use client"

import { useEffect, useRef } from "react"

export function BookingStatusChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mock data
    const data = {
      labels: ["Completed", "In Progress", "Pending", "Cancelled"],
      datasets: [
        {
          data: [65, 20, 10, 5],
          backgroundColor: [
            "rgba(34, 197, 94, 0.7)",
            "rgba(59, 130, 246, 0.7)",
            "rgba(234, 179, 8, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(234, 179, 8, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    // Simple pie chart rendering
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    let total = 0
    data.datasets[0].data.forEach((value) => {
      total += value
    })

    let startAngle = 0
    for (let i = 0; i < data.datasets[0].data.length; i++) {
      const value = data.datasets[0].data[i]
      const sliceAngle = (2 * Math.PI * value) / total

      ctx.beginPath()
      ctx.fillStyle = data.datasets[0].backgroundColor[i]
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = data.datasets[0].borderColor[i]
      ctx.lineWidth = data.datasets[0].borderWidth
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.stroke()

      startAngle += sliceAngle
    }

    // Add legend
    const legendY = canvas.height - 20
    for (let i = 0; i < data.labels.length; i++) {
      const x = 20 + i * (canvas.width / data.labels.length)

      ctx.fillStyle = data.datasets[0].backgroundColor[i]
      ctx.fillRect(x, legendY, 10, 10)

      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.fillText(data.labels[i], x + 15, legendY + 8)
    }
  }, [])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-auto" />
}
