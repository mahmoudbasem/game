import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/main-layout';
import GameSelection from '@/components/game-selection';
import AccountInfo, { AccountFormData } from '@/components/account-info';
import PaymentMethod from '@/components/payment-method';
import Confirmation from '@/components/confirmation';
import StepIndicator, { Step } from '@/components/step-indicator';
import { useQuery } from '@tanstack/react-query';
import { Game, Order, PriceOption } from '@shared/schema';

export default function OrderProcess() {
  const [currentStep, setCurrentStep] = useState<Step>('gameSelection');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [accountData, setAccountData] = useState<AccountFormData | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Get price option when account data is available
  const { data: priceOption } = useQuery({
    queryKey: [`/api/games/${selectedGame?.id}/price-options`],
    select: (data) => accountData ? data.find((option: PriceOption) => option.id === accountData.priceOptionId) : null,
    enabled: !!selectedGame && !!accountData?.priceOptionId
  });

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  // Move to account info step
  const goToAccountInfo = () => {
    setCurrentStep('accountInfo');
  };

  // Handle account info submission
  const handleAccountInfoSubmit = (data: AccountFormData) => {
    setAccountData(data);
    setCurrentStep('payment');
  };

  // Handle payment success
  const handlePaymentSuccess = (orderData: Order) => {
    setCompletedOrder(orderData);
    setCurrentStep('confirmation');
  };

  // Reset the entire process for a new order
  const handleNewOrder = () => {
    setSelectedGame(null);
    setAccountData(null);
    setCompletedOrder(null);
    setCurrentStep('gameSelection');
  };

  // Auto-advance to account info when game is selected
  useEffect(() => {
    if (selectedGame && currentStep === 'gameSelection') {
      goToAccountInfo();
    }
  }, [selectedGame, currentStep]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-6 pb-16 pt-8">
        <div className="max-w-5xl mx-auto">
          {/* Step Indicators */}
          <StepIndicator currentStep={currentStep} />

          {/* Step Content */}
          <div>
            {currentStep === 'gameSelection' && (
              <GameSelection 
                onGameSelect={handleGameSelect} 
                selectedGame={selectedGame} 
              />
            )}

            {currentStep === 'accountInfo' && selectedGame && (
              <AccountInfo 
                selectedGame={selectedGame} 
                onPrevious={() => {
                  setSelectedGame(null);
                  setCurrentStep('gameSelection');
                }}
                onNext={handleAccountInfoSubmit}
              />
            )}

            {currentStep === 'payment' && selectedGame && accountData && priceOption && (
              <PaymentMethod 
                selectedGame={selectedGame}
                priceOption={priceOption}
                accountData={accountData}
                onPrevious={() => setCurrentStep('accountInfo')}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {currentStep === 'confirmation' && completedOrder && (
              <Confirmation 
                order={completedOrder}
                onNewOrder={handleNewOrder}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
