import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Social Links */}
          <div className="flex gap-6">
            <a
              href="https://instagram.com/calio.hnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a
              href="https://tiktok.com/@calio.hnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
              aria-label="TikTok"
            >
              <FaTiktok className="w-6 h-6" />
            </a>
            <a
              href="https://facebook.com/caliojoyeria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-600">
            <span className="block">
              © 2026 CALIO Joyería. Todos los derechos reservados.
            </span>
            <span className="block">San Pedro Sula, Honduras</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
