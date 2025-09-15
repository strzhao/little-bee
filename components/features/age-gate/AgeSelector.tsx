'use client';

// 移除 lucide-react 图标导入，改用 emoji
import { AGE_GROUPS } from '@/lib/constants';
import { AgeGroup } from '@/types';

interface AgeSelectorProps {
  onSelect: (ageGroup: AgeGroup) => void;
}

const ageOptions = [
  {
    ageGroup: AGE_GROUPS.TODDLER,
    icon: '🍼',
    label: '🍼 萌芽版 (2-3岁)',
  },
  {
    ageGroup: AGE_GROUPS.CHILD,
    icon: '🌱',
    label: '🌱 探索版 (3-4岁)',
  },
  {
    ageGroup: AGE_GROUPS.STUDENT,
    icon: '📚',
    label: '📚 知识版 (5岁+)',
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
              <div className="text-6xl transition-transform group-hover:scale-110">
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
