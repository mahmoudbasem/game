import { useQuery } from '@tanstack/react-query';
import { Game } from '@shared/schema';

interface GameSelectionProps {
  onGameSelect: (game: Game) => void;
  selectedGame: Game | null;
}

export default function GameSelection({ onGameSelect, selectedGame }: GameSelectionProps) {
  const { data: games, isLoading, error } = useQuery({ 
    queryKey: ['/api/games'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">حدث خطأ أثناء تحميل الألعاب. يرجى المحاولة مرة أخرى.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">اختر اللعبة التي تريد شحنها</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {games?.map((game: Game) => (
          <div 
            key={game.id}
            className={`game-card bg-white border ${selectedGame?.id === game.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'} rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg`}
            onClick={() => onGameSelect(game)}
          >
            <img 
              src={game.imageUrl} 
              alt={game.name} 
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-gaming text-lg font-semibold">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{game.description}</p>
              <button 
                className={`w-full ${selectedGame?.id === game.id ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'} text-white py-2 rounded transition-colors`}
              >
                {selectedGame?.id === game.id ? 'تم الاختيار' : 'اختر'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedGame && (
        <div className="text-center">
          <div className="p-4 bg-primary-light/20 rounded-lg mb-4 inline-block">
            <p className="font-bold">اللعبة المختارة: <span className="text-primary">{selectedGame.name}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
