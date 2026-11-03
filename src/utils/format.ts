export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTotalAmount = (amount: number): string =>
  `Rp ${amount.toLocaleString('id-ID')}`;

export const formatDateDisplay = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-ID', {
    day: 'numeric', month: 'numeric', year: 'numeric',
  }).format(date);
};

export const parseInputToDate = (inputText: string): Date | null => {
  if (!inputText) return null;
    const cleanText = inputText.trim();

  // Matches DD/MM/YYYY
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(cleanText);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const maskDateInput = (text: string): string => {
  const t = text.replace(/\D/g, '').slice(0, 8);
  if (t.length > 4) return `${t.slice(0, 2)}/${t.slice(2, 4)}/${t.slice(4)}`;
  if (t.length > 2) return `${t.slice(0, 2)}/${t.slice(2)}`;
  return t;
};