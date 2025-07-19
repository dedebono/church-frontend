import { Phone, Mail, MapPin } from "lucide-react"
import "./footerPage.css"; // Import the CSS

const FooterPage = () => { // Changed to uppercase 'FooterPage'
return (
<div>
<div className="container footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>MLB Church is dedicated to fostering faith, community, and service. Join us on our spiritual journey.</p>
          </div>
          <div className="footer-section footer-contact">
            <h3>Contact Info</h3>
            <div className="footer-contact-item">
              <Phone size={16} /> <span>+1234567890</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} /> <a href="mailto:contact@domain.com">contact@domain.com</a>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} /> <span>123 Church St, City, State 12345</span>
            </div>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li className="footer-li">
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#sermons">Sermons</a>
              </li>
              <li>
                <a href="#events">Events</a>
              </li>
              <li>
                <a href="#gallery">Gallery</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Newsletter</h3>
            <p>Stay updated with our latest news and events.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your Email" />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="footer-bottom container">
          <div className="footer-copyright">
            <p>
              &copy; {new Date().getFullYear()} <a href="/">MLB Church</a>. All Rights Reserved.
            </p>
          </div>
          <div className="footer-terms">
            <p>Terms & Condition | Privacy Policy</p>
          </div>
        </div>
        </div>

  )
}

export default FooterPage; // Changed to uppercase 'FooterPage'