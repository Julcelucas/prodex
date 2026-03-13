
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#091e11] text-gray-300 pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img 
                src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
                alt="PRODEX Logo" 
                className="max-w-[140px] h-auto brightness-0 invert" 
              />
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              PRODEX Angola 🇦🇴<br/>
              A plataforma definitiva para gestão profissional de pedidos, monitorização de funcionários e otimização de processos nacionais.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-primary transition-colors bg-white/5 p-2 rounded-full" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors bg-white/5 p-2 rounded-full" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors bg-white/5 p-2 rounded-full" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors bg-white/5 p-2 rounded-full" aria-label="WhatsApp"><MessageCircle className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Contactos</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 
                <span className="group-hover:text-white transition-colors">Rua da Independência, 123<br/>Luanda, Angola</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-5 w-5 text-primary shrink-0" /> 
                <span className="group-hover:text-white transition-colors">+244 222 123 456</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-5 w-5 text-primary shrink-0" /> 
                <a href="mailto:contato@prodex.ao" className="group-hover:text-primary transition-colors">contato@prodex.ao</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Globe className="h-5 w-5 text-primary shrink-0" /> 
                <a href="https://www.prodex.ao" className="group-hover:text-primary transition-colors">www.prodex.ao</a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Links Rápidos</h3>
            <ul className="space-y-3 text-sm flex flex-col">
              <li><Link to="/home" className="hover:text-primary transition-colors inline-block">Sobre Nós</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors inline-block">Serviços</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors inline-block">Preços e Planos</Link></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer inline-block">Contacte-nos</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm flex flex-col">
              <li><span className="hover:text-primary transition-colors cursor-pointer inline-block">Política de Privacidade</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer inline-block">Termos de Serviço</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer inline-block">Política de Cookies</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PRODEX Angola. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Desenvolvido para excelência em gestão em Angola</span>
            <span role="img" aria-label="Angola Flag">🇦🇴</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
