import { memo } from 'react';
import { Edit2, ChevronUp, ChevronDown, Plus, X } from '../Icons';
import { THEMES } from '../../data/constants';

const ThemeSelector = ({
  selectedThemes,
  onToggleTheme,
  expanded,
  setExpanded,
  isHost = true,
  customLists = {},
  contributedThemes = [],
  onOpenCreateModal,
  onEditList,
  onDeleteList
}) => (
  <div className="mb-6">
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
    >
      <div className="flex items-center gap-3">
        <div className="bg-brand-mustard p-2 rounded-lg text-white">
          <Edit2 size={20} />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold text-brand-wood leading-tight">Temas</h2>
          <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">{selectedThemes.length} seleccionados</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onOpenCreateModal && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateModal(e);
            }}
            className="p-2 rounded-lg bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood hover:brightness-95 transition-all shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title={isHost ? "Crear lista personalizada" : "Contribuir temas"}
          >
            <Plus size={18} />
          </div>
        )}
        {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
      </div>
    </button>
    {expanded && (
      <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
        <div className="grid grid-cols-2 gap-3">
          {/* Custom lists */}
          {Object.keys(customLists).map(listName => (
            <div key={listName} className="relative">
              <button
                onClick={() => onToggleTheme(listName)}
                disabled={!isHost}
                className={`w-full p-3 rounded-xl font-bold capitalize transition-all border-2 ${selectedThemes.includes(listName)
                  ? 'bg-brand-pastel-mint text-brand-wood border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                  : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                  } ${!isHost ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {listName}
              </button>
              {isHost && onEditList && onDeleteList && (
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditList(listName);
                    }}
                    className="p-1 rounded bg-white/90 border border-brand-wood/20 text-brand-wood hover:bg-brand-beige transition-all"
                    title="Editar"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteList(listName);
                    }}
                    className="p-1 rounded bg-white/90 border border-brand-wood/20 text-brand-wood hover:bg-red-100 transition-all"
                    title="Eliminar"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Contributed themes */}
          {contributedThemes.length > 0 && (
            <>
              <div className="col-span-2 mt-2 mb-1">
                <div className="h-px bg-brand-wood/20"></div>
                <p className="text-xs text-brand-wood/60 font-bold uppercase tracking-wide mt-2">Aportados por jugadores</p>
              </div>
              {contributedThemes.map((theme, idx) => (
                <div key={`${theme.name}-${theme.contributorId}-${idx}`} className="relative">
                  <button
                    onClick={() => onToggleTheme(`contributed:${theme.name}:${theme.contributorId}`)}
                    disabled={!isHost}
                    className={`w-full p-3 rounded-xl font-bold capitalize transition-all border-2 ${selectedThemes.includes(`contributed:${theme.name}:${theme.contributorId}`)
                      ? 'bg-brand-pastel-mint text-brand-wood border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                      : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                      } ${!isHost ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <div className="text-left">
                      <div>{theme.name}</div>
                      <div className="text-xs opacity-60 normal-case font-normal">por {theme.contributorName}</div>
                    </div>
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Built-in themes */}
          <div className="col-span-2 mt-2 mb-1">
            <div className="h-px bg-brand-wood/20"></div>
            <p className="text-xs text-brand-wood/60 font-bold uppercase tracking-wide mt-2">Temas integrados</p>
          </div>
          {Object.keys(THEMES).map(theme => (
            <button
              key={theme}
              onClick={() => onToggleTheme(theme)}
              disabled={!isHost}
              className={`p-3 rounded-xl font-bold capitalize transition-all border-2 ${selectedThemes.includes(theme)
                ? 'bg-brand-bronze text-white border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                } ${!isHost ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {theme}
            </button>
          ))}
        </div>
        {!isHost && (
          <div className="text-center text-xs text-brand-wood/60 font-bold mt-3 italic">
            Solo el anfitrión puede seleccionar temas. Usa el botón + para contribuir tus temas.
          </div>
        )}
      </div>
    )}
  </div>
);

export default memo(ThemeSelector);
