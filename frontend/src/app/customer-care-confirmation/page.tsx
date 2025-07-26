'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Phone, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// Create a separate component that uses useSearchParams
function CustomerCareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: '',
    pickupDate: '',
    serviceType: '',
    bookingId: ''
  });

  useEffect(() => {
    // Get data from URL parameters
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';
    const pickup = searchParams.get('pickup') || '';
    const drop = searchParams.get('drop') || '';
    const pickupDate = searchParams.get('pickupDate') || '';
    const serviceType = searchParams.get('serviceType') || '';
    const bookingId = searchParams.get('bookingId') || '';

    setCustomerData({
      name,
      phone,
      pickup,
      drop,
      pickupDate,
      serviceType,
      bookingId
    });
  }, [searchParams]);

  const formatServiceType = (type: string) => {
    switch (type) {
      case 'pm': return 'Packers & Movers';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              Request Submitted Successfully!
            </CardTitle>
            <p className="text-green-100 text-lg">
              Our Customer Care will reach you soon
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Main Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Thank you for choosing our {formatServiceType(customerData.serviceType)} service!
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We have received your booking request. Our dedicated customer care team will contact you within 
                <span className="font-semibold text-blue-600"> 30 minutes </span>
                to discuss your requirements and provide you with a detailed quote.
              </p>
            </div>

            {/* Customer Details */}
            {customerData.name && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Your Booking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerData.bookingId && (
                    <div className="md:col-span-2 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-600 font-medium">Booking Reference ID</p>
                      <p className="font-mono text-lg text-blue-800">{customerData.bookingId}</p>
                      <p className="text-xs text-blue-600 mt-1">Please keep this ID for future reference</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium text-gray-800">{customerData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{customerData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium text-gray-800">{customerData.pickup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Drop Location</p>
                    <p className="font-medium text-gray-800">{customerData.drop}</p>
                  </div>
                  {customerData.pickupDate && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Preferred Date & Time</p>
                      <p className="font-medium text-gray-800">{formatDate(customerData.pickupDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                What happens next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <p className="text-gray-700">Our customer care executive will call you within 30 minutes</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <p className="text-gray-700">We'll discuss your specific requirements and provide a detailed quote</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <p className="text-gray-700">Upon confirmation, we'll schedule your service at your convenience</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Need immediate assistance?
              </h3>
              <p className="text-gray-600 mb-4">
                Feel free to call us directly at
              </p>
              <a 
                href="tel:+911234567890" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                +91 99057 22121
              </a>
            </div>

            {/* Back to Home Button */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="px-8 py-3 text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingCustomerCare() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              Loading...
            </CardTitle>
            <p className="text-green-100 text-lg">
              Please wait while we load your confirmation details
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main exported component with Suspense wrapper
export default function CustomerCareConfirmationPage() {
  return (
    <Suspense fallback={<LoadingCustomerCare />}>
      <CustomerCareContent />
    </Suspense>
  );
}