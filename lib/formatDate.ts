/**
 * Форматирует дату в формат dd-mm-yyyy hh:mm
 * @param date - Дата для форматирования (Date, string или number)
 * @returns Отформатированная строка даты
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';

  const d = new Date(date);

  // Проверка на валидность даты
  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Форматирует дату в короткий формат dd-mm-yyyy
 * @param date - Дата для форматирования
 * @returns Отформатированная строка даты без времени
 */
export function formatDateShort(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';

  const d = new Date(date);

  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Форматирует относительное время (например, "2 hours ago")
 * @param date - Дата для форматирования
 * @returns Относительное время
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return formatDate(d);
}
