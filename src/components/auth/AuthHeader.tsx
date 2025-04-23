
import { Coins } from 'lucide-react';

const AuthHeader = () => {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent inline-block tracking-tight uppercase">
          THE DRAW WIN 2025
        </h1>
        <div className="h-1 w-24 mx-auto my-3 bg-gold/50 rounded-full"></div>
        <p className="text-sm text-white mt-2 font-light tracking-wide uppercase">
          ENTER DRAWS TO WIN VALUABLE PRIZES
        </p>
      </div>
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-gold/20 p-3 shadow-[0_0_15px_rgba(212,175,55,0.3)] neo-glow">
          <Coins className="h-8 w-8 text-gold" />
        </div>
      </div>
    </>
  );
};

export default AuthHeader;
