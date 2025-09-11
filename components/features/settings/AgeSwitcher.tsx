'use client';

import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AGE_GROUPS } from '@/lib/constants';
import { AgeGroup } from '@/types';

const ageOptions = [
  { value: AGE_GROUPS.TODDLER, label: '萌芽版 (2-4岁)' },
  { value: AGE_GROUPS.CHILD, label: '探索版 (5-7岁)' },
  { value: AGE_GROUPS.STUDENT, label: '知识版 (8岁+)' },
];

export function AgeSwitcher() {
  const { ageGroup, setAgeGroup } = useAgeGroup();

  const handleValueChange = (value: AgeGroup) => {
    if (value) {
      setAgeGroup(value);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium">年龄段选择</label>
      <div className="space-y-2">
        {ageOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleValueChange(option.value)}
            className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
              ageGroup === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
            aria-label={option.label}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>
              {ageGroup === option.value && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
