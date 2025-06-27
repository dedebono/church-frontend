// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import './admin/HomePageNot.css';

const HomePage = () => {
  return (
    <div className='page-wrapper'>
    <div className="container-home">
      <h1>
        MLB CHURCH FAMILY APP
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Bergabung bersama kami, menjadi keluarga besar <strong>Making Life Better Church.</strong>
      </p>
      <div className="space-y-4">
        <Link to="/register">
          <button className="button">
            🙋‍♂️ Join as Member
          </button>
        </Link>
        <Link to="/login">
          <button className="button">
            🔐 Admin Login
          </button>
        </Link>
      </div>
    </div>
    </div>
  );
};

export default HomePage;
