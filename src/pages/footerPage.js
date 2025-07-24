import "./footerPage.css"; // Import the CSS

const FooterPage = () => { 
return (
<div>
<div className="container footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>MLB Church is dedicated to fostering faith, community, and service. Join us on our spiritual journey.</p>
          </div>
        </div>
        <div className="footer-bottom container">
          <div className="footer-copyright">
            <p>
              &copy; {new Date().getFullYear()} <a href="/">MLB Church Balikpapan</a>. All Rights Reserved. V.0.1.
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