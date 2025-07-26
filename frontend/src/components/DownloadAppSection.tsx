
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Percent, DollarSign, Calendar, Users, CheckCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscount?: number | null;
  validFrom: string;
  validTo: string;
  usageLimitPerUser?: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

const DownloadAppSection = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch active coupons for public display
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make a public API call to get active coupons (without authentication)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/coupons/public`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons')
      }
      
      const data = await response.json()
      setCoupons(data.coupons || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch coupons')
      console.error('Failed to fetch coupons:', err)
      // Set empty array on error to show the section without coupons
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Coupon code copied!",
      description: `${code} has been copied to your clipboard`,
    })
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`
    } else {
      return `$${coupon.discountValue} OFF`
    }
  }

  const formatValidPeriod = (validFrom: string, validTo: string) => {
    const fromDate = new Date(validFrom).toLocaleDateString()
    const toDate = new Date(validTo).toLocaleDateString()
    return `${fromDate} - ${toDate}`
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const isExpiringSoon = (validTo: string) => {
    const today = new Date()
    const validToDate = new Date(validTo)
    const diffTime = validToDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  return (
    <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <Percent className="w-4 h-4 mr-2" />
            Special Offers
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Exclusive Coupon Codes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Save on Every Delivery
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
            Get amazing discounts on your delivery orders with our exclusive coupon codes. 
            Copy and use them at checkout to save money on your next booking.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-white text-lg">Loading coupons...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center">
            <div className="text-red-300 mb-4">Unable to load coupons at the moment</div>
            <Button 
              onClick={fetchCoupons}
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-purple-900"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Coupons Grid */}
        {!loading && !error && (
          <>
            {coupons.length === 0 ? (
              <div className="text-center">
                <div className="text-white text-lg mb-4">No active coupons available at the moment</div>
                <p className="text-blue-200">Check back soon for exciting new offers!</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {coupons
                    .filter(coupon => coupon.status === 'ACTIVE' && !isExpired(coupon.validTo))
                    .map((coupon) => (
                    <Card key={coupon.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            className={`${
                              isExpiringSoon(coupon.validTo) 
                                ? 'bg-orange-500 hover:bg-orange-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            {isExpiringSoon(coupon.validTo) ? 'Expiring Soon' : 'Active'}
                          </Badge>
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <CardTitle className="text-white text-2xl font-bold">
                          {formatDiscount(coupon)}
                        </CardTitle>
                        {coupon.maxDiscount && coupon.discountType === 'PERCENTAGE' && (
                          <CardDescription className="text-blue-200">
                            Max discount: ${coupon.maxDiscount}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Coupon Code */}
                          <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                            <div>
                              <div className="text-xs text-blue-200 uppercase tracking-wide">Coupon Code</div>
                              <div className="text-white font-mono font-bold text-lg">{coupon.code}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCode(coupon.code)}
                              className="text-white hover:bg-white/20"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Valid Period */}
                          <div className="flex items-center text-blue-200 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Valid: {formatValidPeriod(coupon.validFrom, coupon.validTo)}
                          </div>

                          {/* Usage Limit */}
                          {coupon.usageLimitPerUser && (
                            <div className="flex items-center text-blue-200 text-sm">
                              <Users className="h-4 w-4 mr-2" />
                              Use {coupon.usageLimitPerUser} time{coupon.usageLimitPerUser > 1 ? 's' : ''} per user
                            </div>
                          )}

                          {/* Copy Button */}
                          <Button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* How to Use Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">How to Use Your Coupons</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Copy className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">1. Copy Code</h4>
                      <p className="text-blue-200 text-sm">Click on any coupon above to copy the code to your clipboard</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">2. Book Service</h4>
                      <p className="text-blue-200 text-sm">Place your delivery order and proceed to checkout</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">3. Apply & Save</h4>
                      <p className="text-blue-200 text-sm">Paste the coupon code at checkout and enjoy your discount</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DownloadAppSection;
