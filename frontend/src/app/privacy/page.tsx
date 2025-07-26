'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: December 2022</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Collection</h3>
                <p>We collect the e-mail addresses of those who communicate with us via e-mail, aggregate information on what pages consumers access or visit, and information volunteered by the consumer (such as survey information and/or site registrations). The information we collect is used to improve the content of our Web pages and the quality of our service, and is not shared with or sold to other organizations for commercial purposes, except to provide products or services you have requested, when we have your permission, or under the following circumstances:</p>
                
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>It is necessary to share information in order to investigate, prevent, or take action regarding illegal activities, suspected fraud, situations involving potential threats to the physical safety of any person, violations of Terms of Service, or as otherwise required by law.</li>
                  <li>We transfer information about you if Delivery Partners is acquired by or merged with another company. In this event, Delivery Partners will notify you before information about you is transferred and becomes subject to a different privacy policy.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Gathering and Usage</h3>
                <p>When you register for Delivery Partners we ask for information such as your name, email address, billing address, credit card information.</p>
                <p className="mt-3">Delivery Partners uses collected information for the following general purposes: products and services provision, billing, identification and authentication, services improvement, contact, and research.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h3>
                <p>A cookie is a small amount of data, which often includes an anonymous unique identifier, that is sent to your browser from a web site's computers and stored on your computer's hard drive.</p>
                
                <div className="mt-4 space-y-3">
                  <p><strong>Cookies are required to use Delivery Partners.</strong></p>
                  <p>We use cookies to record current session information, but do not use permanent cookies. You are required to log-in to your Delivery Partners Project Site after a certain period of time has elapsed to protect you against others accidentally accessing your account contents.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Storage</h3>
                <p>Delivery Partners uses third party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run Delivery Partners. Although Delivery Partners owns the code, databases, and all rights to the Delivery Partners application, you retain all rights to your data.</p>
                <p className="mt-3">Delivery Partners may disclose personally identifiable information under special circumstances, such as to comply with subpoenas or when your actions violate the Terms of Service.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes internal reviews of our data collection, storage, and processing practices and security measures.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h3>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to the processing of your personal information</li>
                  <li>Request data portability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Services</h3>
                <p>Our service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party services. We encourage you to review the privacy policies of any third-party services you use.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Children's Privacy</h3>
                <p>Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Changes to This Privacy Policy</h3>
                <p>Delivery Partners may periodically update this policy. We will notify you about significant changes in the way we treat personal information by sending a notice to the primary email address specified in your Delivery Partners primary account holder account or by placing a prominent notice on our site.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@deliverypartners.in</p>
                  <p><strong>Address:</strong> 201, 2nd Floor, Suman Punj, Jagdeo path, Piller no. 10, Bailey Road, Patna, Bihar 800014</p>
                  <p><strong>Phone:</strong> +91 9905722121</p>
                </div>
              </div>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  By using our service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
