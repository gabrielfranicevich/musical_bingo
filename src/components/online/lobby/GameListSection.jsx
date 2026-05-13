import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from '../../Icons';
import GameItem from './GameItem';

const GameListSection = ({
  title,
  subtitle,
  icon,
  games,
  isExpanded,
  onToggle,
  onJoin,
  headerClassName = "bg-white",
  showCount = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [games.length]);

  if (games.length === 0) return null;

  const totalPages = Math.ceil(games.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const paginatedGames = games.slice(startIndex, startIndex + gamesPerPage);

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 rounded-2xl hover:brightness-95 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] ${headerClassName}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white ${title.includes('LAN') ? 'bg-brand-wood' : 'bg-brand-mustard'}`}>
            {icon}
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-brand-wood leading-tight uppercase tracking-wide">{title}</h2>
            {subtitle && (
              <span className="text-xs text-brand-wood/70 font-bold">{subtitle}</span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
      </button>

      {isExpanded && (
        <div className={`mt-2 p-4 rounded-2xl border-2 border-brand-wood/10 border-dashed ${title.includes('LAN') ? 'bg-brand-pastel-mint/30' : 'bg-brand-wood/5 max-h-[400px] overflow-y-auto pr-2'}`}>
          <div className="space-y-3">
            {paginatedGames.map((game) => (
              <GameItem
                key={game.id}
                game={game}
                onJoin={onJoin}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t-2 border-brand-wood/10 pt-4 px-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-brand-wood/10 text-brand-wood disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-wood/20 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-bold text-brand-wood/70">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-brand-wood/10 text-brand-wood disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-wood/20 transition-all active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameListSection;
