
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => Promise<void>;
  isProcessing: boolean;
}

const SocialLoginButtons = ({ onSocialLogin, isProcessing }: SocialLoginButtonsProps) => {
  const socialButtons = [
    { provider: 'Facebook', icon: Facebook },
    { provider: 'Twitter', icon: Twitter },
    { provider: 'LinkedIn', icon: Linkedin },
    { provider: 'Google', icon: Mail },
  ];

  return (
    <div className="flex justify-center space-x-4">
      {socialButtons.map(({ provider, icon: Icon }) => (
        <Button 
          key={provider}
          variant="outline" 
          size="icon" 
          onClick={() => onSocialLogin(provider)}
          className="rounded-full hover:bg-black/60"
          disabled={isProcessing}
        >
          <Icon className="h-5 w-5 text-gold" />
        </Button>
      ))}
    </div>
  );
};

export default SocialLoginButtons;
