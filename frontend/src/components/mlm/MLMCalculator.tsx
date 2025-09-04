// src/components/mlm/MLMCalculator.tsx
'use client';

import { FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatUSDC } from '@/utils/web3Utils';

interface CalculatorState {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

const MLMCalculator: FC = () => {
  const [members, setMembers] = useState<CalculatorState>({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0
  });

  const calculations = useMemo(() => {
    const commissions = {
      level1: 3.5,
      level2: 1.0,
      level3: 1.0,
      level4: 1.0,
      level5: 1.0
    };

    const earnings = {
      level1: members.level1 * commissions.level1,
      level2: members.level2 * commissions.level2,
      level3: members.level3 * commissions.level3,
      level4: members.level4 * commissions.level4,
      level5: members.level5 * commissions.level5
    };

    const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val, 0);
    const totalMembers = Object.values(members).reduce((sum, val) => sum + val, 0);
    
    return {
      earnings,
      totalEarnings,
      totalMembers,
      monthlyPotential: totalEarnings, // Assuming monthly payments
      yearlyPotential: totalEarnings * 12
    };
  }, [members]);

  const updateLevel = (level: keyof CalculatorState, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setMembers(prev => ({ ...prev, [level]: numValue }));
  };

  const presets = [
    { name: 'Conservative', values: { level1: 3, level2: 5, level3: 2, level4: 1, level5: 0 } },
    { name: 'Moderate', values: { level1: 5, level2: 10, level3: 8, level4: 5, level5: 2 } },
    { name: 'Aggressive', values: { level1: 10, level2: 20, level3: 15, level4: 10, level5: 5 } }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setMembers(preset.values);
  };

  const resetCalculator = () => {
    setMembers({ level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Earnings Calculator
          </h3>
          <p className="text-sm text-slate-400">Calculate your potential MLM earnings</p>
        </div>
        
        <Button variant="ghost" size="small" onClick={resetCalculator}>
          Reset
        </Button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <label className="label">Quick Presets</label>
        <div className="flex space-x-2">
          {presets.map(preset => (
            <Button
              key={preset.name}
              variant="ghost"
              size="small"
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Level Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map(level => (
          <div key={level}>
            <Input
              label={`Level ${level}`}
              type="number"
              min="0"
              value={members[`level${level}` as keyof CalculatorState]}
              onChange={(e) => updateLevel(`level${level}` as keyof CalculatorState, e.target.value)}
              placeholder="0"
            />
            <div className="text-xs text-slate-400 mt-1">
              {level === 1 ? '3.5 USDC' : '1.0 USDC'} each
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Earnings Breakdown</h4>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(calculations.earnings).map(([level, earnings]) => (
              <div key={level} className="text-center">
                <div className="text-sm font-semibold text-white">
                  {formatUSDC(earnings.toString())}
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {level.replace('level', 'L')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatUSDC(calculations.totalEarnings.toString())}
            </div>
            <div className="text-sm text-green-400">Per Payment Cycle</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {formatUSDC(calculations.monthlyPotential.toString())}
            </div>
            <div className="text-sm text-blue-400">Monthly Potential</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {formatUSDC(calculations.yearlyPotential.toString())}
            </div>
            <div className="text-sm text-purple-400">Yearly Potential</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <InformationCircleIcon className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="text-amber-300 font-medium mb-1">Important Note</div>
          <div className="text-amber-200/80">
            These calculations are estimates based on the assumption that all members 
            maintain active memberships and make regular payments. Actual earnings may vary.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MLMCalculator;