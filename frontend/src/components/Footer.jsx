import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo">Cas<span>ciz</span></Link>
          <p>Premium phone cases designed for protection, personality, and style. Handcrafted with love in India.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/casciz.store?igsh=MWc5MXhkOXI0NGZycA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a href="https://wa.me/918469211028" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Cases</Link></li>
            <li><Link to="/shop?category=hard">Hard Cases</Link></li>
            <li><Link to="/shop?category=soft">Soft Cases</Link></li>
            <li><Link to="/shop?category=glass">Glass Cases</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><Link to="/orders">Track Order</Link></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Casciz. All rights reserved. Made with love in India.</p>
      </div>
    </footer>
  );
}
