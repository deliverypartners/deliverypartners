"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/admin/date-picker"
import { Download, FileText, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminReportsApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reportType, setReportType] = useState("bookings")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      let response

      switch (reportType) {
        case "bookings":
          response = await adminReportsApi.getBookingReport()
          break
        case "earnings":
          response = await adminReportsApi.getEarningsReport()
          break
        case "drivers":
          response = await adminReportsApi.getDriverReport()
          break
        default:
          throw new Error("Invalid report type")
      }

      if (response.success) {
        setReportData(response.data)
        toast({
          title: "Success",
          description: "Report generated successfully"
        })
      } else {
        throw new Error(response.message || 'Failed to generate report')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf') => {
    if (!reportData) {
      toast({
        title: "Error",
        description: "Please generate a report first",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await adminReportsApi.exportReport(reportType, format, {
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0]
      })

      if (response.success) {
        // Handle file download based on the API response
        toast({
          title: "Success",
          description: `Report exported as ${format.toUpperCase()}`
        })
      } else {
        throw new Error(response.message || 'Failed to export report')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive"
      })
    }
  }

  const generateBookingReport = async () => {
    const response = await adminReportsApi.getBookingReport();
    setReportData(response.data);
  };

  const generateEarningsReport = async () => {
    const response = await adminReportsApi.getEarningsReport();
    setReportData(response.data);
  };

  const generateDriverReport = async () => {
    const response = await adminReportsApi.getDriverReport();
    setReportData(response.data);
  };

  const handleBackup = async () => {
    const response = await adminReportsApi.createBackup();
    toast({ title: "Backup", description: response.data.backupTime });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Select date range and report type to generate reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <DatePicker id="end-date" selected={endDate} onSelect={setEndDate} placeholder="Select end date" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="report-type" className="text-sm font-medium">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="bookings">Booking Report</SelectItem>
                  <SelectItem value="earnings">Earnings Report</SelectItem>
                  <SelectItem value="drivers">Driver Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Button onClick={generateReport} disabled={loading} className="mt-6">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Results</CardTitle>
            <CardDescription>
              Report generated for {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}
            </CardDescription>
            <div className="flex gap-2">
              <Button onClick={() => exportReport('csv')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => exportReport('pdf')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportType === 'bookings' && reportData.bookings && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Cancelled</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.bookings.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>{item.completed}</TableCell>
                      <TableCell>{item.cancelled}</TableCell>
                      <TableCell>₹{item.revenue?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'earnings' && reportData.earnings && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Gross Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Driver Payouts</TableHead>
                    <TableHead>Net Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.earnings.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>₹{item.gross?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>₹{item.commission?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>₹{item.driverPayouts?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>₹{item.net?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'drivers' && reportData.drivers && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Total Trips</TableHead>
                    <TableHead>Completed Trips</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.drivers.map((driver: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>{driver.totalTrips}</TableCell>
                      <TableCell>{driver.completedTrips}</TableCell>
                      <TableCell>{driver.rating?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell>₹{driver.earnings?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!reportData[reportType] && (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the selected date range
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
