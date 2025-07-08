
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface ProfileActionButtonsProps {
  isEditing: boolean;
  saving: boolean;
  uploading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  isEditing,
  saving,
  uploading,
  onEdit,
  onSave,
  onCancel
}) => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-6">
      {/* Profile Edit Actions */}
      <div className="flex justify-center space-x-4">
        {!isEditing ? (
          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('profile.editProfile')}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="border-white/20 text-white hover:bg-white/10 transition-colors duration-200 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              {t('profile.cancel')}
            </Button>
            <Button
              onClick={onSave}
              disabled={saving || uploading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('profile.actions.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('profile.saveChanges')}
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Sign Out Button */}
      <div className="flex justify-center">
        <Button
          onClick={logout}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 px-6"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('profile.signOut')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileActionButtons;
