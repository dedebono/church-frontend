"use client"

import { useState } from "react"
import "../pages/admin/HomePageNot.css" // Ensure the path is correct
import { Link } from "react-router-dom"
import { Phone, Mail, MapPin, Star, Menu, Quote, Play, X , Calendar} from "lucide-react"
import { useSermons } from "./hooks/useSermons" // Import our custom hook
import { useEvents } from "./hooks/useEvents"
import { useGalleryPhotos } from "./hooks/useGallery";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage = () => {
  // Use a single state for the YouTube modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch latest 3 sermons for homepage display
  const { sermons, loading, error } = useSermons(3)
  const { events, loading: eventsLoading, error: eventsError } = useEvents(3)
  // Fetch latest gallery photos for homepage display
  const { GalleryPhotos, loading: galleryLoading, error: galleryError } = useGalleryPhotos(6)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

    // Helper function to format date and time for events
  const formatEventDateTime = (dateString, timeString) => {
    const date = new Date(dateString)
    const dateFormatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    if (timeString) {
      return `${dateFormatted} | ${timeString}`
    }
    return dateFormatted
  }

    // Function to handle event action
  const handleEventAction = (event) => {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, "_blank")
    } else if (event.location) {
      alert(`Event Location: ${event.location}`)
    } else {
      alert(`More details about "${event.title}" coming soon!`)
    }
  }

  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Function to handle audio play
  const handlePlayAudio = (audioUrl, title) => {
    if (audioUrl) {
      // Open audio in new tab or play directly
      window.open(audioUrl, "_blank")
    } else {
      alert(`Audio not available for "${title}"`)
    }
  }

  return (
    <div className="home wp-singular page-template-default page page-id-29 wp-theme-popularfx popularfx-body pagelayer-body">
      {/* Header with Contact Info */}
      <header className="pagelayer-header">
        <div
          pagelayer-id="8y58592"
          className="p-8y58592 pagelayer-row pagelayer-row-stretch-auto pagelayer-height-default header-top"
        >
          <div className="pagelayer-row-holder pagelayer-row pagelayer-auto pagelayer-width-auto container">
            <div pagelayer-id="mtv4629" className="p-mtv4629 pagelayer-col">
              <div className="pagelayer-col-holder">
                <div pagelayer-id="45w7943" className="p-45w7943 pagelayer-phone contact-item">
                  <div className="pagelayer-phone-holder">
                    <span className="pagelayer-phone-icon">
                      <Phone size={16} />
                    </span>
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
                    <span className="pagelayer-email-icon">
                      <Mail size={16} />
                    </span>
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
                <div className="social-media-icons">{/* Placeholder for social media icons */}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Section */}
        <nav className="main-nav">
          <div className="container nav-content">
            <div className="logo">
              <a href="/" className="logo-link">
                MLB CHURCH
              </a>
            </div>
            <ul className="nav-menu">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#sermons">Sermons</a>
              </li>
              <li>
                <Link to="/register">Join Member</Link>
              </li>
              <li>
                <Link to="/login">Admin Area</Link>
              </li>
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
            <a href="#events" className="btn btn-secondary">
              Upcoming Events <Star size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section section-padding">
        <div className="container quote-content">
          <div className="quote-icon">
            <Quote size={60} />
          </div>
          <p className="quote-text">"Faith consists in believing when it is beyond the power of reason to believe."</p>
          <span className="quote-author">- Voltaire</span>
        </div>
      </section>

      {/* Sermons Section - Updated with real data */}
      <section className="sermons-section section-padding" id="sermons">
        <div className="container">
          <h2 className="confession-title">Latest Sermons</h2>

          {/* Loading State */}
          {loading && (
            <div className="sermons-loading">
              <div className="loading-spinner">🔄</div>
              <p>Loading latest sermons...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="sermons-error">
              <div className="error-icon">⚠️</div>
              <p>Unable to load sermons at this time. Please try again later.</p>
              <small>{error}</small>
            </div>
          )}

          {/* Sermons Grid - Real Data */}
          {!loading && !error && sermons.length > 0 && (
            <div className="sermons-grid">
              {sermons.map((sermon) => (
                <div key={sermon._id} className="sermon-card">
                  <img
                    src={sermon.imageUrl || "https://via.placeholder.com/400x200?text=Sermon+Image"}
                    alt={sermon.title}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200?text=Sermon+Image"
                    }}
                  />
                  <div className="sermon-content">
                    <h3>{sermon.title}</h3>
                    <p className="sermon-meta">
                      <Play size={16} /> {sermon.preacher} | {formatDate(sermon.date)}
                    </p>
                    <p>{truncateText(sermon.description)}</p>
                    <button className="btn btn-primary" onClick={() => handlePlayAudio(sermon.audioUrl, sermon.title)}>
                      Listen Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sermons.length === 0 && (
            <div className="sermons-empty">
              <div className="empty-icon">🎵</div>
              <h3>No Sermons Available</h3>
              <p>Check back soon for our latest sermons and messages.</p>
            </div>
          )}

          {/* View All Sermons Link */}
          {!loading && sermons.length > 0 && (
            <div className="sermons-view-all">
              <Link to="#sermons" className="btn btn-secondary">
                Semua Ibadah <Star size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Events Section - Updated with real data */}
      <section className="events-section section-padding" id="events">
        <div className="container">
          <h2 className="confession-title">Upcoming Events</h2>

          {/* Loading State */}
          {eventsLoading && (
            <div className="events-loading">
              <div className="loading-spinner">🔄</div>
              <p>Loading upcoming events...</p>
            </div>
          )}

          {/* Error State */}
          {eventsError && !eventsLoading && (
            <div className="events-error">
              <div className="error-icon">⚠️</div>
              <p>Unable to load events at this time. Please try again later.</p>
              <small>{eventsError}</small>
            </div>
          )}

          {/* Events Grid - Real Data */}
          {!eventsLoading && !eventsError && events.length > 0 && (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event._id} className="event-card">
                  <img
                    src={event.imageUrl || "https://via.placeholder.com/400x180?text=Event+Image"}
                    alt={event.title}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x180?text=Event+Image"
                    }}
                  />
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-meta">
                      <Calendar size={16} /> {formatEventDateTime(event.date, event.time)}
                      {event.location && (
                        <>
                          <br />
                          <MapPin size={16} /> {event.location}
                        </>
                      )}
                    </p>
                    <p>{truncateText(event.description)}</p>
                    <button className="btn btn-primary" onClick={() => handleEventAction(event)}>
                      {event.registrationUrl ? "Register Now" : "Learn More"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="events-empty">
              <div className="empty-icon">📅</div>
              <h3>No Upcoming Events</h3>
              <p>Check back soon for our latest events and activities.</p>
            </div>
          )}

          {/* View All Events Link */}
          {!eventsLoading && events.length > 0 && (
            <div className="events-view-all">
              <Link to="#events" className="btn btn-secondary">
                All Events <Star size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section-padding" id="about">
        <div className="container about-content">
          <div className="about-text">
            <h2>About Our Church</h2>
            <p>
              Founded in 19XX, MLB Church has been a beacon of hope and faith in our community. We are committed to
              spreading the word of God, fostering a strong community, and serving those in need. Our doors are always
              open to everyone seeking spiritual guidance and a welcoming family.
            </p>
            <p>
              We believe in the transformative power of faith and strive to create an environment where individuals can
              grow spiritually, connect with others, and make a positive impact on the world.
            </p>
            <a href="#home" className="btn btn-secondary">
              Our Mission
            </a>
          </div>
          <div className="about-image">
            <img src="https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/gallery%2F1751443846854_IMG_8506.JPG?alt=media&token=7523de63-8af1-479f-9df2-6068c1e32585" alt="Church Interior" />
          </div>
        </div>
      </section>

{/* Gallery Section - Updated with real data */}
<section className="gallery-section section-padding" id="gallery">
  <div className="container">
    <h2 className="confession-title">Our Photo Gallery</h2>

    {/* Loading State */}
    {galleryLoading && (
      <div className="gallery-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading gallery photos...</p>
      </div>
    )}

    {/* Error State */}
    {galleryError && !galleryLoading && (
      <div className="gallery-error">
        <div className="error-icon">⚠️</div>
        <p>Unable to load gallery photos at this time. Please try again later.</p>
        <small>{galleryError}</small>
      </div>
    )}

    {/* Gallery Grid - Real Data */}
    {!galleryLoading && !galleryError && GalleryPhotos.length > 0 ? (
 <Swiper
  modules={[Navigation, Pagination]}
  spaceBetween={20}
  slidesPerView={1}
  navigation
  pagination={{ clickable: true }}
  breakpoints={{
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  }}
>
  {GalleryPhotos.map((photo) => (
    <SwiperSlide key={photo._id}>
      <div className="gallery-item">
        <img
          src={photo.imageUrl || "https://via.placeholder.com/400x250?text=Gallery+Image"}
          alt={photo.title || "Gallery Image"}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x250?text=Image+Not+Found";
          }}
        />
        <div className="gallery-overlay">
          <span>{photo.title || "Church Photo"}</span>
        </div>
      </div>
    </SwiperSlide>
  ))}
</Swiper>

    ) : (
      // Empty State
      !galleryLoading && !galleryError && (
        <div className="gallery-empty">
          <div className="empty-icon">📸</div>
          <h3>No Photos Available</h3>
          <p>Check back soon for more moments from our church.</p>
        </div>
      )
    )}

    {/* View All Photos Link */}
    {!galleryLoading && GalleryPhotos.length > 0 && (
      <div className="gallery-view-all">
        {/* Update this link to your actual gallery page if you have one */}
        <Link to="#gallery" className="btn btn-secondary">
          View All Photos <Star size={16} />
        </Link>
      </div>
    )}
  </div>
</section>


      {/* YouTube Modal (Fixed and Consolidated) */}
      <div className={`youtubemodal-overlay ${isModalOpen ? "active" : ""}`}>
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
              <li>
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
      </footer>
    </div>
  )
}

export default HomePage
