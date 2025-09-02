'use client';

import { Baby, BookOpen, GraduationCap } from 'lucide-react';
import { AGE_GROUPS } from '@/lib/constants';
import { AgeGroup } from '@/types';

interface AgeSelectorProps {
  onSelect: (ageGroup: AgeGroup) => void;
}

const ageOptions = [
  {
    ageGroup: AGE_GROUPS.TODDLER,
    icon: <Baby size={48} />,
    label: '萌芽版 (2-4岁)',
  },
  {
    ageGroup: AGE_GROUPS.CHILD,
    icon: <BookOpen size={48} />,
    label: '探索版 (5-7岁)',
  },
  {
    ageGroup: AGE_GROUPS.STUDENT,
    icon: <GraduationCap size={48} />,
    label: '知识版 (8岁+)',
  },
];

export function AgeSelector({ onSelect }: AgeSelectorProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-12 text-4xl font-bold text-gray-700">你好！</h1>
        <div className="flex flex-col gap-8 md:flex-row">
          {ageOptions.map(({ ageGroup, icon, label }) => (
            <div
              key={ageGroup}
              onClick={() => onSelect(ageGroup)}
              className="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border bg-white p-8 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="text-gray-600 transition-colors group-hover:text-blue-500">
                {icon}
              </div>
              <span className="text-lg font-medium text-gray-800">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
