import { useEffect, useState } from "react";
import "./SplashScreen.css";

const SplashScreen = () => {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 1400);
    const t2 = setTimeout(() => setRemoved(true), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (removed) return null;

  return (
    <div className={`splash-screen ${hidden ? "splash-hidden" : ""}`} data-testid="splash-screen">
      <div className="splash-inner">
        <img src="/mlb-logo-ondark.png" alt="Making Life Better Church" className="splash-logo" />
        <div className="splash-bar"><span /></div>
      </div>
    </div>
  );
};

export default SplashScreen;
