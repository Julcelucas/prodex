
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Package, User, Shield, Truck, Clock, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <Helmet>
        <title>{pt.home.title}</title>
        <meta name="description" content={pt.home.descriptionMeta} />
      </Helmet>

      <div className="relative min-h-[60vh] md:min-h-[70vh] py-8 md:py-12 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a"
            alt="Logistics background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="relative z-10 w-full px-4 max-w-6xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
          
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-full border border-white/20">
              <Package className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight md:leading-tight lg:leading-tight">
              {pt.home.heading1}
              <br />
              <span className="text-blue-400">{pt.home.heading2}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed md:leading-relaxed">
              {pt.home.subheading}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center mt-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-5 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <User className="h-5 w-5 mr-2" />
              {pt.home.employeeLoginBtn}
            </Button>

            <Button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Shield className="h-5 w-5 mr-2" />
              {pt.home.managerLoginBtn}
            </Button>
          </div>

          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/20 flex flex-col items-center text-center">
              <Truck className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-white font-bold text-base md:text-lg mb-2">{pt.home.feat1Title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{pt.home.feat1Desc}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/20 flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-red-400 mb-3" />
              <h3 className="text-white font-bold text-base md:text-lg mb-2">{pt.home.feat2Title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{pt.home.feat2Desc}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/20 flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
              <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="text-white font-bold text-base md:text-lg mb-2">{pt.home.feat3Title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{pt.home.feat3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
