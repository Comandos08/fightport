import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Belt } from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getInitials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function beltColor(belt: Belt): string {
  const map: Record<Belt, string> = {
    'Branca': 'var(--belt-white)',
    'Azul': 'var(--belt-blue)',
    'Roxa': 'var(--belt-purple)',
    'Marrom': 'var(--belt-brown)',
    'Preta': 'var(--belt-black)',
    'Vermelha': 'var(--belt-red)',
  };
  return map[belt];
}

export function beltTextColor(belt: Belt): string {
  if (belt === 'Branca') return 'var(--color-ink)';
  return '#FFFFFF';
}
