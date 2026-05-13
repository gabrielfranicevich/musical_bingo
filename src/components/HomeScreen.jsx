import { Users } from './Icons';
import PrimaryButton from './shared/PrimaryButton';

const HomeScreen = ({ setScreen }) => (
  <div className="p-8 relative z-10 flex flex-col items-center justify-center min-h-[500px]">
    <div className="mb-12 text-center transform hover:scale-105 transition-transform duration-500 flex flex-col items-center">
      <div className="flex items-end gap-2 mb-4 animate-sound-wave">
        <div className="w-2 h-8 bg-brand-cyan rounded-full"></div>
        <div className="w-2 h-16 bg-brand-pink rounded-full"></div>
        <div className="w-2 h-12 bg-brand-purple rounded-full"></div>
        <div className="w-2 h-14 bg-brand-cyan rounded-full"></div>
        <div className="w-2 h-6 bg-brand-pink rounded-full"></div>
      </div>
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink tracking-widest drop-shadow-[0_0_10px_rgba(0,242,254,0.3)]">
        MUSICAL<br/>BINGO
      </h1>
    </div>

    <div className="w-full space-y-6">
      <PrimaryButton
        onClick={() => {
          setScreen('online_lobby');
          window.history.pushState(null, '', '/online');
        }}
      >
        <Users size={32} />
        Jugar Online
      </PrimaryButton>
    </div>
  </div>
);

export default HomeScreen;
