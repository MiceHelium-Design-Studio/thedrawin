
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail } from 'lucide-react';

interface ProfileFormFieldsProps {
  name: string;
  email: string;
  isEditing: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  name,
  email,
  isEditing,
  onNameChange,
  onEmailChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={onNameChange}
          disabled={!isEditing}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={onEmailChange}
          disabled={!isEditing}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
        />
      </div>
    </div>
  );
};

export default ProfileFormFields;
