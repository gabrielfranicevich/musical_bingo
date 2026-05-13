import { memo } from 'react';

const PrimaryButton = ({ onClick, children, disabled = false, className = '', title = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white py-5 rounded-2xl font-black tracking-widest text-xl shadow-neon-pink hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-brand-light/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none uppercase ${className}`}
    >
      {children}
    </button>
  );
};

export default memo(PrimaryButton);
