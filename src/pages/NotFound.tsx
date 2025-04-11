
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBackground } from '../context/BackgroundContext';

const NotFound = () => {
  const location = useLocation();
  const { authBackgroundImage } = useBackground();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center pattern-bg" 
      style={{ 
        backgroundImage: `url(${authBackgroundImage})`,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="max-w-md w-full mx-auto glass-card rounded-xl backdrop-blur-md shadow-lg p-8 text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-white mb-6">Oops! Page not found</p>
        <Link to="/">
          <Button 
            variant="default" 
            className="bg-gold hover:bg-gold-dark text-black font-medium tracking-wide uppercase py-5 text-sm"
          >
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
