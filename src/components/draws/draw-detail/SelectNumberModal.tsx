import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Draw } from '@/types';
import { useDraws } from '@/context/DrawContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SelectNumberModalProps {
  draw: Draw;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SelectNumberModal: React.FC<SelectNumberModalProps> = ({
  draw,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [step, setStep] = useState<'number' | 'price' | 'confirm'>('number');
  const [takenNumbers, setTakenNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserEntered, setIsUserEntered] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [searchNumber, setSearchNumber] = useState<string>('');
  const { buyTicket } = useDraws();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Generate numbers 1-100
  const availableNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  // Filter numbers based on search
  const filteredNumbers = searchNumber
    ? availableNumbers.filter(num => num.toString().includes(searchNumber))
    : availableNumbers;

  // Get available (not taken) numbers
  const getAvailableNumbers = () => availableNumbers.filter(num => !takenNumbers.includes(num));

  // Quick selection handlers
  const selectRandomNumber = () => {
    const available = getAvailableNumbers();
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      setSelectedNumber(available[randomIndex]);
    }
  };

  const selectLuckyNumber = (type: 'low' | 'high' | 'middle') => {
    const available = getAvailableNumbers();
    if (available.length === 0) return;

    let luckyNumbers: number[] = [];
    if (type === 'low') {
      luckyNumbers = available.filter(n => n <= 33);
    } else if (type === 'high') {
      luckyNumbers = available.filter(n => n >= 67);
    } else {
      luckyNumbers = available.filter(n => n >= 34 && n <= 66);
    }

    if (luckyNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * luckyNumbers.length);
      setSelectedNumber(luckyNumbers[randomIndex]);
    }
  };

  // Check if user already has a ticket for this draw and fetch taken numbers
  useEffect(() => {
    const fetchDrawInfo = async () => {
      if (!draw?.id || !user?.id) return;

      try {
        // Check if user already entered this draw
        const { data: userEntered, error: userError } = await supabase
          .rpc('user_entered_draw', {
            draw_uuid: draw.id,
            user_uuid: user.id
          });

        if (userError) throw userError;
        setIsUserEntered(userEntered);

        // Get taken ticket numbers
        const { data: takenNumbersData, error: takenError } = await supabase
          .rpc('get_taken_ticket_numbers', { draw_uuid: draw.id });

        if (takenError) throw takenError;
        setTakenNumbers(takenNumbersData || []);

        // Get user's current wallet balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setUserBalance(profileData?.wallet || 0);
      } catch (error) {
        console.error('Error fetching draw info:', error);
        toast({
          variant: 'destructive',
          title: t('draws.messages.errorFetchingInfo'),
          description: t('draws.messages.errorFetchingInfoDesc')
        });
      }
    };

    if (isOpen) {
      fetchDrawInfo();
      setStep('number');
      setSelectedNumber(null);
      setSelectedPrice(null);
      setSearchNumber(''); // Reset search when modal opens
    }
  }, [draw?.id, user?.id, isOpen, t]);

  // Keyboard support for number selection
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen || step !== 'number') return;

      const key = event.key;
      if (key >= '0' && key <= '9') {
        // Build number as user types
        const newSearch = searchNumber + key;
        if (newSearch.length <= 3) {
          setSearchNumber(newSearch);

          // Auto-select if exact match and available
          const exactNumber = parseInt(newSearch);
          if (exactNumber >= 1 && exactNumber <= 100 && !takenNumbers.includes(exactNumber)) {
            setSelectedNumber(exactNumber);
          }
        }
      } else if (key === 'Backspace') {
        setSearchNumber(prev => prev.slice(0, -1));
      } else if (key === 'Enter' && selectedNumber) {
        if (selectedNumber) {
          setStep('price');
        }
      } else if (key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, step, searchNumber, selectedNumber, takenNumbers, onClose]);

  const handleNumberClick = (number: number) => {
    setSelectedNumber(number === selectedNumber ? null : number);
  };

  const handleNumberConfirm = () => {
    if (selectedNumber) {
      setStep('price');
    }
  };

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price === selectedPrice ? null : price);
  };

  const handlePriceConfirm = () => {
    if (selectedPrice) {
      setStep('confirm');
    }
  };

  const handleSubmit = async () => {
    if (!selectedNumber || !selectedPrice || !draw?.id || !user?.id) return;

    // Check if user has sufficient balance
    if (userBalance < selectedPrice) {
      toast({
        variant: 'destructive',
        title: t('draws.modal.insufficientBalance'),
        description: t('draws.modal.insufficientBalanceDesc', { needed: selectedPrice, balance: userBalance })
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await buyTicket(draw.id, selectedNumber, selectedPrice);

      toast({
        title: t('draws.modal.entrySuccessful'),
        description: t('draws.modal.entrySuccessfulDesc', { title: draw.title, number: selectedNumber, price: selectedPrice })
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      // Error toast is handled in buyTicket function
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNumberTaken = (number: number) => takenNumbers.includes(number);

  const handleBack = () => {
    if (step === 'price') {
      setStep('number');
      setSelectedPrice(null);
    } else if (step === 'confirm') {
      setStep('price');
    }
  };

  const canAffordPrice = (price: number) => userBalance >= price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isUserEntered
              ? t('draws.modal.alreadyEntered')
              : step === 'number'
                ? t('draws.modal.chooseNumber')
                : step === 'price'
                  ? t('draws.modal.selectPrice')
                  : t('draws.modal.confirmEntry')}
          </DialogTitle>
        </DialogHeader>

        {isUserEntered ? (
          <div className="text-center py-6">
            <p>{t('draws.modal.alreadyEnteredDesc')}</p>
          </div>
        ) : step === 'number' ? (
          <>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-white">
                <span className="font-medium text-white">{t('draws.modal.walletBalance')}</span> ${userBalance}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-white">
                {t('draws.modal.pickNumber')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-white">
                {t('draws.modal.tips')}
              </p>
            </div>

            {/* Search and Quick Selection */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={t('draws.modal.searchPlaceholder')}
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="flex-1"
                  />
                  {searchNumber && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {(() => {
                        const num = parseInt(searchNumber);
                        if (num >= 1 && num <= 100) {
                          return isNumberTaken(num) ? (
                            <span className="text-xs text-red-500 font-medium">{t('draws.modal.legend.taken')}</span>
                          ) : (
                            <span className="text-xs text-green-500 font-medium">{t('draws.modal.legend.available')}</span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectRandomNumber}
                  disabled={getAvailableNumbers().length === 0}
                >
                  {t('draws.modal.randomNumber')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 mt-4 max-h-64 overflow-y-auto">
              {filteredNumbers.map((number) => (
                <Button
                  key={number}
                  variant={selectedNumber === number ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs transition-all ${isNumberTaken(number)
                    ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
                    : selectedNumber === number
                      ? "bg-primary text-primary-foreground transform scale-105 text-white"
                      : "hover:bg-primary/20 hover:scale-105"
                    }`}
                  disabled={isNumberTaken(number)}
                  onClick={() => handleNumberClick(number)}
                >
                  {number}
                </Button>
              ))}
            </div>

            {/* Statistics */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-xs text-white">
                <span>{t('draws.modal.statistics.available', { count: getAvailableNumbers().length })}</span>
                <span>{t('draws.modal.statistics.taken', { count: takenNumbers.length })}</span>
                <span>{t('draws.modal.statistics.total', { count: 100 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs">
              <div className="flex items-center gap-2 text-white">
                <div className="h-3 w-3 bg-primary rounded-sm"></div>
                <span>{t('draws.modal.legend.selected')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 border border-border rounded-sm text-white"></div>
                <span className='text-white'>{t('draws.modal.legend.available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
                <span className='text-white'>{t('draws.modal.legend.taken')}</span>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('draws.modal.cancel')}
              </Button>
              <Button
                onClick={handleNumberConfirm}
                disabled={!selectedNumber || isSubmitting}
              >
                {t('draws.modal.continueWithNumber', { number: selectedNumber })}
              </Button>
            </DialogFooter>
          </>
        ) : step === 'price' ? (
          <>
            <div className="mt-4">
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium text-white">{t('draws.modal.selectedNumber')}</span> #{selectedNumber}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-white">{t('draws.modal.walletBalance')}</span> ${userBalance}
                </p>
              </div>

              <p className="text-sm font-medium mb-4 text-white">{t('draws.modal.chooseEntryPrice')}</p>
              <div className="grid grid-cols-2 gap-3">
                {draw.ticketPrices.map((price) => (
                  <Button
                    key={price}
                    variant={selectedPrice === price ? "default" : "outline"}
                    className={`h-16 flex flex-col ${!canAffordPrice(price) ? "opacity-50" : ""
                      }`}
                    onClick={() => handlePriceSelect(price)}
                    disabled={!canAffordPrice(price)}
                  >
                    <span className="text-lg font-bold">${price}</span>
                    <span className="text-xs">
                      {canAffordPrice(price) ? t('draws.modal.entryFee') : t('draws.modal.insufficientFunds')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                {t('draws.modal.back')}
              </Button>
              <Button
                onClick={handlePriceConfirm}
                disabled={!selectedPrice || !canAffordPrice(selectedPrice || 0) || isSubmitting}
              >
                {t('draws.modal.continueWith', { price: selectedPrice })}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mt-4">
              <div className="mb-6 p-4 bg-muted rounded-lg text-white">
                <h3 className="font-semibold mb-3">{t('draws.modal.entrySummary')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('draws.modal.draw')}</span>
                    <span className="font-medium">{draw.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('draws.modal.yourNumber')}</span>
                    <span className="font-bold text-primary">#{selectedNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('draws.modal.entryFee')}:</span>
                    <span className="font-medium">${selectedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('draws.modal.remainingBalance')}</span>
                    <span className="font-medium">${userBalance - (selectedPrice || 0)}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 text-white">
                {t('draws.modal.confirmText')}
              </p>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                {t('draws.modal.back')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? t('draws.modal.processing') : t('draws.modal.confirmEntryButton')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectNumberModal;
