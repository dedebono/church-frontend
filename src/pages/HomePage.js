import React, { useState } from 'react';
import '../pages/admin/HomePageNot.css'; // Ensure the path is correct
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, Target, Star, Menu, Quote, Play, X } from 'lucide-react'; // X is imported for the close button

const HomePage = () => {
  // Use a single state for the YouTube modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="home wp-singular page-template-default page page-id-29 wp-theme-popularfx popularfx-body pagelayer-body">
      {/* Header with Contact Info */}
      <header className="pagelayer-header">
        <div pagelayer-id="8y58592" className="p-8y58592 pagelayer-row pagelayer-row-stretch-auto pagelayer-height-default header-top">
          <div className="pagelayer-row-holder pagelayer-row pagelayer-auto pagelayer-width-auto container">
            <div pagelayer-id="mtv4629" className="p-mtv4629 pagelayer-col">
              <div className="pagelayer-col-holder">
                <div pagelayer-id="45w7943" className="p-45w7943 pagelayer-phone contact-item">
                  <div className="pagelayer-phone-holder">
                    <span className="pagelayer-phone-icon"><Phone size={16} /></span>
                    {/* Fixed WhatsApp link */}
                    <a href="https://wa.me/62881254948220" target="_blank" rel="noopener noreferrer">
                      <span className="pagelayer-phone">wa.me/62881254948220</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div pagelayer-id="khk9818" className="p-khk9818 pagelayer-col">
              <div className="pagelayer-col-holder">
                <div pagelayer-id="4bn2254" className="p-4bn2254 pagelayer-email contact-item">
                  <div className="pagelayer-email-holder">
                    <span className="pagelayer-email-icon"><Mail size={16} /></span>
                    {/* Fixed mailto link */}
                    <a href="mailto:wartanewsgo@gmail.com">
                      <span className="pagelayer-email">wartanewsgo@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div pagelayer-id="iq14062" className="p-iq14062 pagelayer-col">
              <div className="pagelayer-col-holder">
                <div className="social-media-icons">
                  {/* Placeholder for social media icons */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Section */}
        <nav className="main-nav">
          <div className="container nav-content">
            <div className="logo">
              <a href="/" className="logo-link">MLB CHURCH</a>
            </div>
            <ul className="nav-menu">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#sermons">Sermons</a></li>
              <li><Link to="/register">Join Member</Link></li>
              <li><Link to="/login">Admin Area</Link></li>
            </ul>
            <button className="mobile-menu-toggle">
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Our Church</h1>
          <p className="hero-subtitle">
            A place of worship, community, and spiritual growth. Join us for our services and events.
          </p>
          <div className="hero-buttons">
            {/* Button to open the YouTube modal */}
            <button onClick={openModal} className="btn btn-primary">
              Watch Sermons <Play size={16} /> {/* Added Play icon back */}
            </button>
            <a href="#events" className="btn btn-secondary">Upcoming Events <Star size={16} /></a>
          </div>
        </div>
      </section>

      {/* Confession/Services Section */}
      <section className="confession-section section-padding">
        <div className="container">
          <h2 className="confession-title">Our Core Beliefs & Services</h2>
          <div className="confession-content">
            <div className="confession-item">
              <div className="confession-icon"><Heart size={48} /></div>
              <h3>Love & Compassion</h3>
              <p>We believe in the power of unconditional love and compassion towards all.</p>
            </div>
            <div className="confession-item">
              <div className="confession-icon"><Target size={48} /></div>
              <h3>Spiritual Growth</h3>
              <p>Dedicated to fostering personal and communal spiritual development.</p>
            </div>
            <div className="confession-item">
              <div className="confession-icon"><MapPin size={48} /></div>
              <h3>Community Outreach</h3>
              <p>Actively engaging with and serving our local and global communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section section-padding">
        <div className="container quote-content">
          <div className="quote-icon"><Quote size={60} /></div>
          <p className="quote-text">
            "Faith consists in believing when it is beyond the power of reason to believe."
          </p>
          <span className="quote-author">- Voltaire</span>
        </div>
      </section>

      {/* Sermons Section */}
      <section className="sermons-section section-padding" id="sermons">
        <div className="container">
          <h2 className="confession-title">Latest Sermons</h2>
          <div className="sermons-grid">
            <div className="sermon-card">
              <img src="https://via.placeholder.com/400x200?text=Sermon+1" alt="Sermon 1" />
              <div className="sermon-content">
                <h3>The Path of Righteousness</h3>
                <p className="sermon-meta"><Play size={16} /> Preacher John Doe | July 1, 2025</p>
                <p>A deep dive into living a life guided by divine principles.</p>
                <a href="#" className="btn btn-primary">Listen Now</a>
              </div>
            </div>
            <div className="sermon-card">
              <img src="https://via.placeholder.com/400x200?text=Sermon+2" alt="Sermon 2" />
              <div className="sermon-content">
                <h3>Grace in Adversity</h3>
                <p className="sermon-meta"><Play size={16} /> Preacher Jane Smith | June 24, 2025</p>
                <p>Understanding and finding strength through God's grace in challenging times.</p>
                <a href="#" className="btn btn-primary">Listen Now</a>
              </div>
            </div>
            <div className="sermon-card">
              <img src="https://via.placeholder.com/400x200?text=Sermon+3" alt="Sermon 3" />
              <div className="sermon-content">
                <h3>Community and Fellowship</h3>
                <p className="sermon-meta"><Play size={16} /> Preacher David Lee | June 17, 2025</p>
                <p>The importance of unity and support within our spiritual family.</p>
                <a href="#" className="btn btn-primary">Listen Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section section-padding" id="events">
        <div className="container">
          <h2 className="confession-title">Upcoming Events</h2>
          <div className="events-grid">
            <div className="event-card">
              <img src="https://via.placeholder.com/400x180?text=Event+1" alt="Event 1" />
              <div className="event-content">
                <h3>Youth Summer Camp</h3>
                <p className="event-meta"><Star size={16} /> July 15-20, 2025 | Church Grounds</p>
                <p>An exciting week of activities, learning, and fellowship for our youth.</p>
                <a href="#" className="btn btn-primary">Learn More</a>
              </div>
            </div>
            <div className="event-card">
              <img src="https://via.placeholder.com/400x180?text=Event+2" alt="Event 2" />
              <div className="event-content">
                <h3>Community Food Drive</h3>
                <p className="event-meta"><Star size={16} /> August 5, 2025 | City Hall</p>
                <p>Help us collect non-perishable food items for families in need.</p>
                <a href="#" className="btn btn-primary">Participate</a>
              </div>
            </div>
            <div className="event-card">
              <img src="https://via.placeholder.com/400x180?text=Event+3" alt="Event 3" />
              <div className="event-content">
                <h3>Bible Study Group</h3>
                <p className="event-meta"><Star size={16} /> Every Wednesday | 7:00 PM | Zoom</p>
                <p>Join our weekly online Bible study for deeper understanding and discussion.</p>
                <a href="#" className="btn btn-primary">Join Call</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section-padding" id="about">
        <div className="container about-content">
          <div className="about-text">
            <h2>About Our Church</h2>
            <p>
              Founded in 19XX, MLB Church has been a beacon of hope and faith in our community. We are committed to spreading the word of God, fostering a strong community, and serving those in need. Our doors are always open to everyone seeking spiritual guidance and a welcoming family.
            </p>
            <p>
              We believe in the transformative power of faith and strive to create an environment where individuals can grow spiritually, connect with others, and make a positive impact on the world.
            </p>
            <a href="#" className="btn btn-secondary">Our Mission</a>
          </div>
          <div className="about-image">
            <img src="https://via.placeholder.com/600x400?text=Church+Interior" alt="Church Interior" />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section section-padding" id="gallery">
        <div className="container">
          <h2 className="confession-title">Our Photo Gallery</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+1" alt="Gallery Image 1" />
              <div className="gallery-overlay"><span>Worship Service</span></div>
            </div>
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+2" alt="Gallery Image 2" />
              <div className="gallery-overlay"><span>Community Event</span></div>
            </div>
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+3" alt="Gallery Image 3" />
              <div className="gallery-overlay"><span>Youth Gathering</span></div>
            </div>
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+4" alt="Gallery Image 4" />
              <div className="gallery-overlay"><span>Bible Study</span></div>
            </div>
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+5" alt="Gallery Image 5" />
              <div className="gallery-overlay"><span>Church Exterior</span></div>
            </div>
            <div className="gallery-item">
              <img src="https://via.placeholder.com/400x250?text=Gallery+6" alt="Gallery Image 6" />
              <div className="gallery-overlay"><span>Fellowship</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Modal (Fixed and Consolidated) */}
      <div className={`youtubemodal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="youtubemodal">
          <button className="youtubemodal-close-btn" onClick={closeModal}>
            <X size={24} /> {/* Using Lucide X icon */}
          </button>
          <iframe
            width="1280"
            height="720"
            src="https://www.youtube.com/embed/agBI--7aN4Y?si=clxqyVs89fVnOiP9"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            // Tailwind classes can coexist with custom CSS, but ensure no conflicts
            // Consider if `w-full h-[315px] rounded-lg` are needed if `youtubemodal iframe` handles dimensions
            className="w-full h-[315px] rounded-lg"
          ></iframe>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer" id="contact">
        <div className="container footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              MLB Church is dedicated to fostering faith, community, and service. Join us on our spiritual journey.
            </p>
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
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#sermons">Sermons</a></li>
              <li><a href="#events">Events</a></li>
              <li><a href="#gallery">Gallery</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Newsletter</h3>
            <p>Stay updated with our latest news and events.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your Email" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom container">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} <a href="/">MLB Church</a>. All Rights Reserved.</p>
          </div>
          <div className="footer-terms">
            <p>Terms & Condition | Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;