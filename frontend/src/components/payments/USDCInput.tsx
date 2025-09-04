// src/components/payments/USDCInput.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { parseUSDCAmount, formatUSDC } from '@/utils/web3Utils';
import Input from '@/components/ui/Input';

interface USDCInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  showBalance?: boolean;
  balance?: string;
  onMaxClick?: () => void;
}

const USDCInput: FC<USDCInputProps> = ({
  value,
  onChange,
  label = 'Amount (USDC)',
  placeholder = '0.00',
  error,
  min,
  max,
  disabled,
  showBalance,
  balance,
  onMaxClick
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsed = parseUSDCAmount(inputValue);
    
    setDisplayValue(parsed);
    onChange(parsed);
  };

  const handleBlur = () => {
    if (displayValue && !isNaN(parseFloat(displayValue))) {
      setDisplayValue(parseFloat(displayValue).toFixed(2));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        {showBalance && balance && (
          <div className="text-sm text-slate-400">
            Balance: {formatUSDC(balance)}
            {onMaxClick && (
              <button
                type="button"
                onClick={onMaxClick}
                className="ml-2 text-primary-400 hover:text-primary-300 text-xs"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="relative">
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          className="pr-16"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
          USDC
        </div>
      </div>
      
      {min !== undefined && parseFloat(displayValue || '0') < min && (
        <p className="text-sm text-red-400">Minimum amount is {formatUSDC(min)}</p>
      )}
      
      {max !== undefined && parseFloat(displayValue || '0') > max && (
        <p className="text-sm text-red-400">Maximum amount is {formatUSDC(max)}</p>
      )}
    </div>
  );
};

export default USDCInput;