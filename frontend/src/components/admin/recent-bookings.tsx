import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface RecentBookingsProps {
  bookings?: any[]
}

export function RecentBookings({ bookings: propBookings }: RecentBookingsProps) {
  // Use provided bookings or fallback to mock data
  const bookings = propBookings || [
    {
      id: "B-1234",
      customer: "John Smith",
      driver: "David Johnson",
      date: "2023-05-21",
      amount: "₹45.00",
      status: "completed",
    },
    {
      id: "B-1235",
      customer: "Sarah Williams",
      driver: "Michael Brown",
      date: "2023-05-21",
      amount: "₹32.50",
      status: "completed",
    },
    {
      id: "B-1236",
      customer: "Robert Davis",
      driver: "James Wilson",
      date: "2023-05-21",
      amount: "₹28.75",
      status: "in-progress",
    },
    {
      id: "B-1237",
      customer: "Jennifer Miller",
      driver: "Pending Assignment",
      date: "2023-05-22",
      amount: "₹52.25",
      status: "pending",
    },
    {
      id: "B-1238",
      customer: "Michael Garcia",
      driver: "Pending Assignment",
      date: "2023-05-22",
      amount: "₹38.00",
      status: "pending",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Bookings</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.driver}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.amount}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
