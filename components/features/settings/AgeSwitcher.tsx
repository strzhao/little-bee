'use client';

import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AGE_GROUPS } from '@/lib/constants';
import { AgeGroup } from '@/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">年龄段选择</label>
      <ToggleGroup
        type="single"
        value={ageGroup || ''}
        onValueChange={handleValueChange}
        className="w-full justify-start"
      >
        {ageOptions.map(option => (
          <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
