'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: December 2022</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What Are Cookies</h3>
                <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Use Cookies</h3>
                <p>Delivery Partners uses cookies to improve your experience on our website and mobile application. We use cookies for:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</li>
                  <li><strong>Performance Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                  <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization.</li>
                  <li><strong>Authentication Cookies:</strong> These cookies help us keep you logged in and secure your account.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Session Cookies</h4>
                    <p>These are temporary cookies that remain in the cookie file of your browser until you leave the site. They are used to maintain your session and provide a secure browsing experience.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800">Authentication Cookies</h4>
                    <p>These cookies are essential for logging into your account and keeping you securely logged in during your session. Without these cookies, you would need to log in on every page you visit.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800">Preference Cookies</h4>
                    <p>These cookies allow our website to remember information that changes the way the website behaves or looks, such as your preferred language or the region you are in.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Cookies</h3>
                <p>We may use third-party services that also set cookies on your device. These include:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Google Analytics:</strong> To help us understand how users interact with our website</li>
                  <li><strong>Payment Processors:</strong> To securely process payments</li>
                  <li><strong>Maps Services:</strong> To provide location-based features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Cookies</h3>
                <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit our site, and some services and functionalities may not work properly.</p>
                
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800"><strong>Important:</strong> Some cookies are essential for our website to function properly. Disabling these cookies may prevent you from using certain features of our service, including logging into your account.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p>Most web browsers allow you to control cookies through their settings preferences. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Chrome:</strong> Settings &gt; Advanced &gt; Privacy and security &gt; Site settings &gt; Cookies</li>
                  <li><strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings &gt; Site permissions &gt; Cookies and site data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Retention</h3>
                <p>We retain cookies for different periods depending on their purpose:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Authentication Cookies:</strong> Remain until you log out or after a period of inactivity</li>
                  <li><strong>Preference Cookies:</strong> Remain until you clear them or they expire (typically 1 year)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Updates to This Cookie Policy</h3>
                <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h3>
                <p>If you have any questions about our use of cookies, please contact us at:</p>
                <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@deliverypartners.in</p>
                  <p><strong>Address:</strong> 201, 2nd Floor, Suman Punj, Jagdeo path, Piller no. 10, Bailey Road, Patna, Bihar 800014</p>
                  <p><strong>Phone:</strong> +91 9905722121</p>
                </div>
              </div>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  By continuing to use our website, you agree to our use of cookies as described in this Cookie Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
