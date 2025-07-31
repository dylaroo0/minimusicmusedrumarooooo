
import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <span className="text-sm font-semibold text-text-primary w-10 text-center">{value}</span>
      </div>
    </div>
  );
};
