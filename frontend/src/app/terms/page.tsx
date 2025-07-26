'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-600 mt-2">Last updated: December 2022</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                <p>Any and all use of this Application is subject to acceptance of the terms and conditions of use laid out in the following clauses. Usage, for the purposes of these terms and conditions, is deemed to be the reading or visiting of this Web Site, and/or the purchase of one or more products from the Web Site and is applicable to all Users, whether human beings, computers or companies and other organizations, incorporated or unincorporated.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Good Faith Usage</h3>
                <p>The Owners of this Application have published it in good faith and to the best of their ability and knowledge in the given subject area. The Users of the application are therefore required to demonstrate similar good faith in their use of the Web Site, by keeping to the Terms and Conditions of Use, not publishing defamatory remarks about the application or the Site's Owners in any media, electronic or otherwise and, should discussion forums be available on the application, by behaving in a considerate and responsible fashion at all times. Failure to comply will result in Users being denied access to the Application and may even result in prosecution, should the behavior breach any laws of privacy, defamation, etc.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Legal Jurisdiction</h3>
                <p>In the event of any legal dispute arising from the use of this Application, irrespective of the country of origin of any third party, all such disputes will be resolved within the jurisdiction of the country of incorporation of the Web Site's owner(s) and not the country in which the Web Site is hosted unless otherwise stated.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Copyright and Intellectual Property</h3>
                <p>All material on this Application, whether in the Web Site itself or any product that may be sold therein, if products are sold via the Web Site, is subject to copyright and may not be reproduced in whole or in part without the Application owner's express permission. You may not modify, copy, or in any way reproduce, publish, distribute, sell, lease, license, create derivative works from, transfer, or sell any information or products obtained from this Web Site. Failure to obtain permission before reproducing such material may result in prosecution.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Information Accuracy</h3>
                <p>We make every endeavor to ensure the information on our application is correct, but it is not always possible to keep everything up to date. The information is therefore provided without warranty or guarantee of any description, and the application owners cannot be held responsible for the use made of such information as may appear within the pages of the application. It is the responsibility of the User to check current legislation and practices pertaining to their area of interest before acting upon information received via the application. If you believe any of the information on this application is inaccurate or incorrect, please contact us by email.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Third Party Contact</h3>
                <p>We may occasionally pass on your contact details to carefully selected third parties who may offer you other products of interest. As per our Privacy Policy, you must contact us if you do NOT want your contact details to be used in this manner.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Discussion Forums</h3>
                <p>Wherever there are discussion forums available on the Application, Users are required to remain polite about each other and about the application itself. We take defamation very seriously and any defamatory remarks found on our forums will be removed and the User denied access.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies Usage</h3>
                <p>In order to improve our site and our service to you, we may occasionally use cookies. The purpose of such cookies is purely to help us personalize the information we deliver to you and does not imply storage of personal data, nor the tracking of your activity on the site. If you wish to delete such cookies after visiting the site, go to your browser's tools menu and select the 'clear cookies' option.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Security Settings</h3>
                <p>For some of the functionalities of the Application, it may occasionally be necessary to use cookies. If your privacy settings are set too high, it may not be possible for you to view parts of our application or complete certain processes on occasion. If this is the case, and you wish to proceed, you must adjust your browser's security settings to accept cookies. We accept no responsibility for Users being unable to see the site if they are unwilling to alter their security settings.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Terms Modification</h3>
                <p>We may occasionally change or vary the contents of these Terms and Conditions. In the event that you purchased a product or service through us, it is the Terms and Conditions that were in place at the time of that purchase that will be valid.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation and Refund Policy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Cancellation and Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>The terms hereof shall constitute Hyperlocal Delivery Partners Private Limited's ("Delivery Partners") cancellation and refund policy in relation to the Solutions rendered on the Website ("Cancellation and Refund Policy"). Capitalized terms not defined herein shall have the meaning ascribed to them in the Terms of Use.</p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation and Refunds by the Company</h3>
                <p>Please note that there may be certain orders that we are unable to accept and must cancel. We reserve the right, at our sole discretion, to refuse or cancel any order for any reason, without any claims or liability to pay finance charges or interest on the amount. Some situations that may result in your order being canceled include but are not limited to inaccuracies or errors in Solutions or pricing information, technical or technological problems or problems identified in relation to credit / debit fraud. We may also require additional verifications or information before accepting any order. We will contact you if all or any portion of your order is canceled or if additional information is required to accept your order. If your order is cancelled by the Company after your credit / debit card has been charged, the said amount will be refunded to that credit / debit card account.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation by You</h3>
                <p>You agree and acknowledge that unless stated otherwise you are not entitled to cancel any orders made by you on this Website. In the event you subscribe to any Solutions, the same may be cancelled by you one month prior to the provision of the Solutions, in such a case you will be refunded in the entire amount after deducting any bank charges that may have been applicable. Further during a period between one month and 14 days from when the Solutions are to be provided, if there is a cancellation request received, we may at our discretion refund 50% of the amount, after deducting any bank charges that may have been applicable, to you. A period of 14 days before the Solutions to be provided no request for cancelation will not be entertained by the Company.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Policy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-sm text-gray-600">Our Shipping Policy was last updated on 03 December 2022</p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Definitions</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>"Delivery Partners"</strong> refers to Hyperlocal Delivery Partners Private Limited</li>
                  <li><strong>"Goods"</strong> refers to the items offered for delivery on the Service</li>
                  <li><strong>"Orders"</strong> means a request by You for delivery services from Us</li>
                  <li><strong>"Service"</strong> refers to the Website</li>
                  <li><strong>"Website"</strong> refers to Delivery Partners, accessible from www.deliverypartners.in</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Domestic Delivery Policy</h3>
                <h4 className="font-semibold text-gray-800 mb-2">Delivery Processing Times</h4>
                <p>All Orders are processed on demand delivery. If We are experiencing a high volume of orders, deliveries may be delayed by a few hours. Please allow additional hours in transit for delivery. If there will be a significant delay in delivery of Your Order, We will contact You via deliverypartners01@gmail.com or telephone.</p>

                <h4 className="font-semibold text-gray-800 mb-2 mt-4">Delivery Rates & Estimates</h4>
                <p>Delivery charges for Your Orders will be calculated and displayed at checkout.</p>

                <h4 className="font-semibold text-gray-800 mb-2 mt-4">Order Confirmation & Tracking</h4>
                <p>You will receive a Delivery Confirmation notification once Your Order has been dispatched. The tracking information will be active within 24 hours.</p>

                <h4 className="font-semibold text-gray-800 mb-2 mt-4">Damages</h4>
                <p>Delivery Partners is not liable for any products damaged or lost during delivery. If You received Your Order damaged, please contact our customer support to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h3>
                <p>If you have any questions about this Shipping Policy, You can contact Us:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>By visiting our contact page on our website</li>
                  <li>By sending us an email: info@deliverypartners.in</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
