import "./footerPage.css";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const FooterPage = () => {
  const year = new Date().getFullYear();
  return (
    <div className="site-footer" data-testid="site-footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <img
            className="footer-logo"
            src="/mlb-logo-ondark.png"
            alt="Making Life Better Church"
          />
          <p className="footer-tagline">
            Sebuah komunitas yang bertumbuh dalam iman, kasih, dan pelayanan —
            membangun kehidupan yang lebih baik di dalam Kristus.
          </p>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/ronny_runtukahu"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              data-testid="footer-instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.youtube.com/results?search_query=making+life+better+church"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              data-testid="footer-youtube"
            >
              <Youtube size={18} />
            </a>
            <a
              href="mailto:wartanewsgo2@gmail.com"
              aria-label="Email"
              data-testid="footer-email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Kontak</h4>
          <ul className="footer-list">
            <li>
              <MapPin size={15} />
              <span>MLB Center, Sekolah Harapan Bangsa 99G Lt.3, Balikpapan, Kalimantan Timur</span>
            </li>
            <li>
              <Phone size={15} />
              <a href="tel:+6281254948220">+62 812-5494-8220</a>
            </li>
            <li>
              <Mail size={15} />
              <a href="mailto:wartanewsgo2@gmail.com">wartanewsgo2@gmail.com</a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-col">
          <h4>Jadwal Ibadah</h4>
          <ul className="footer-list">
            <li><span>Ibadah Umum — Minggu 09.00 WITA</span></li>
            <li><span>MLB Kids Club — Minggu 09.00 WITA</span></li>
          </ul>
          <a
            className="footer-map-btn"
            href="https://www.google.com/maps?q=MLB+CHURCH+Balikpapan"
            target="_blank"
            rel="noreferrer"
          >
            Lihat Lokasi
          </a>
        </div>

        {/* Quick links */}
        <div className="footer-col">
          <h4>Tautan</h4>
          <ul className="footer-links">
            <li><a href="/#sermons">Ibadah</a></li>
            <li><a href="/#events">Acara</a></li>
            <li><Link to="/register">Daftar Jemaat</Link></li>
            <li><Link to="/form">Terhubung</Link></li>
            <li><Link to="/login">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copyright">
          &copy; {year} <a href="/">Making Life Better Church</a> — Balikpapan. All Rights Reserved.
        </p>
        <p className="footer-terms">Terms &amp; Conditions &nbsp;|&nbsp; Privacy Policy</p>
      </div>
    </div>
  );
};

export default FooterPage;
