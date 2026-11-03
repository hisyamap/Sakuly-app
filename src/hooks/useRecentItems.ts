import { useWindowDimensions } from 'react-native';

export function useRecentItems<T>(
  items: T[],
  getDate: (item: T) => number,
  reservedHeight: number,
  itemHeight = 75,
) {
  const { height } = useWindowDimensions();
  const max = Math.max(1, Math.floor((height - reservedHeight) / itemHeight));

  return [...items].sort((a, b) => getDate(b) - getDate(a)).slice(0, max);
}