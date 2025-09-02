import { AGE_GROUPS } from '@/lib/constants';

type ObjectValues<T> = T[keyof T];

export type AgeGroup = ObjectValues<typeof AGE_GROUPS> | null;
