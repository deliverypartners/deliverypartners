
'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start w-full">
          {/* Left Content */}
          <div className="text-left pt-2">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Now live in multiple cities across India
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              <span className="block">India's Largest</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Intra-State Logistics
              </span>
              <span className="block">Platform</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
              Move anything, anywhere within the city at the tap of a button
            </p>
            
            
            
            {/* Stats */}
            
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative pt-4 lg:pt-8">
            <div className="relative z-10">
              <img
                src="https://img.freepik.com/free-vector/loaders-carrying-armchair-boxes-new-house_74855-14095.jpg?semt=ais_hybrid&w=740"
                alt="Delivery Partner with package"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
