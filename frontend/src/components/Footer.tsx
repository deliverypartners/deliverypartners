
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img
                  src="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/Screenshot_2025-07-19_234547-removebg-preview.png?updatedAt=1752949895120"
                  alt="Delivery Partners Logo"
                  className="w-8 h-8 rounded-lg object-cover"
                />
              </div>
              <span className="text-xl font-bold">Delivery Partners®</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              India's largest intra-state logistics platform. Move anything, anywhere within the city at the tap of a button.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/deliverypartners01/" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              
              <a href="https://x.com/DeliveryPartn10" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              
              <a href="https://www.instagram.com/deliverypartners2020?igsh=MXJkbXF5MmVnYzI1cw==" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              
              <a href="https://www.youtube.com/channel/UCBi5qtEbvj0QPpgsuW2zrAA?view_as=subscriber" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6">Services</h3>
            <ul className="space-y-4">
              <li><a className="text-gray-300 hover:text-white transition-colors font-medium">City Trucks</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors font-medium">City Bikes</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors font-medium">Packers & Movers</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-xl font-bold mb-6">Company</h3>
            <div className="space-y-4">
              <div className="text-gray-300 leading-relaxed">
                <div className="font-semibold text-white mb-2">
                  Hyperlocal Delivery Partners Private Limited
                </div>
                <div className="text-sm">
                  <span className="font-medium">CIN:</span> U53200BR2023PTC064506
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-1" />
                <span className="text-gray-300 leading-relaxed">
                  Delivery Partners Head-Office<br />
                  201,2nd Floor,Suman Punj,Jagdeo path,Piller no, 10<br />
                  Bailley Road, Patna<br />
                  Bihar 800014
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3" />
                <span className="text-gray-300 font-medium">+91 9905722121</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3" />
                <span className="text-gray-300 font-medium">info@deliverypartners.in</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2025 Delivery Partners. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
