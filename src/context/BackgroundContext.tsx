
import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackgroundContextType {
  authBackgroundImage: string;
  setAuthBackgroundImage: (url: string) => void;
}

const defaultBackgroundImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80';

const BackgroundContext = createContext<BackgroundContextType>({
  authBackgroundImage: defaultBackgroundImage,
  setAuthBackgroundImage: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authBackgroundImage, setAuthBackgroundImage] = useState<string>(() => {
    const savedImage = localStorage.getItem('authBackgroundImage');
    return savedImage || defaultBackgroundImage;
  });

  useEffect(() => {
    localStorage.setItem('authBackgroundImage', authBackgroundImage);
  }, [authBackgroundImage]);

  return (
    <BackgroundContext.Provider
      value={{
        authBackgroundImage,
        setAuthBackgroundImage,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
