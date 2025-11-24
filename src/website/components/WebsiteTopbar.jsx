import { Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const WebsiteTopbar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <a href="mailto:info@school.com" className="flex items-center gap-2 hover:text-blue-200 transition-colors">
              <Mail className="w-4 h-4" />
              <span>info@school.com</span>
            </a>
            <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-blue-200 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+1 (234) 567-890</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/profile.php?id=100063597144066" className="hover:text-blue-200 transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://x.com/kaderyousif1" className="hover:text-blue-200 transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/kaderyousif1/" className="hover:text-blue-200 transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com/@kaderyousif1" className="hover:text-blue-200 transition-colors" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTopbar;

