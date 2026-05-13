import { memo } from 'react';

const SlidingToggle = ({
  value,
  onChange,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  className = ""
}) => {
  const isLeft = value === leftValue;

  return (
    <div className={`inline-flex bg-brand-wood/10 rounded-full p-1 border-2 border-brand-wood/20 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(leftValue)}
        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${isLeft
            ? 'bg-brand-wood text-white shadow-[2px_2px_0px_0px_rgba(93,64,55,0.3)]'
            : 'text-brand-wood/60 hover:text-brand-wood'
          }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(rightValue)}
        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${!isLeft
            ? 'bg-brand-wood text-white shadow-[2px_2px_0px_0px_rgba(93,64,55,0.3)]'
            : 'text-brand-wood/60 hover:text-brand-wood'
          }`}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default memo(SlidingToggle);
