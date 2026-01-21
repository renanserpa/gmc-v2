
import { format, parseISO, isPast as dateFnsIsPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LOCALE = ptBR;

export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: LOCALE });
};

export const formatRelativeTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, "d 'de' MMMM 'às' HH:mm", { locale: LOCALE });
};

export const isPast = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateFnsIsPast(dateObj);
};

export const parseDate = (dateString: string) => {
    return parseISO(dateString);
}
