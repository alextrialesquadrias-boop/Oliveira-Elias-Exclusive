export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata um valor numérico para o padrão de moeda brasileiro com centavos (ex: 1850000 -> "R$ 1.850.000,00").
 */
export function formatCurrencyMask(value: number | string): string {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Aplica máscara de moeda em tempo real enquanto o usuário digita no input.
 * Suporta digitação contínua e colagem direta de valores brutos.
 */
export function maskCurrencyInput(rawInput: string): { formatted: string; numeric: number } {
  if (!rawInput || !rawInput.trim()) {
    return { formatted: '', numeric: 0 };
  }

  const hasCommaOrDot = rawInput.includes(',') || rawInput.includes('.');
  const digits = rawInput.replace(/\D/g, '');
  if (!digits) {
    return { formatted: '', numeric: 0 };
  }

  let numeric: number;
  // Se o usuário colou um número inteiro grande sem separadores decimais (ex: "1850000")
  if (!hasCommaOrDot && !rawInput.includes('R$') && digits.length >= 4) {
    numeric = parseInt(digits, 10);
  } else {
    numeric = parseInt(digits, 10) / 100;
  }

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);

  return { formatted, numeric };
}

/**
 * Converte a string mascarada (ex: "R$ 1.850.000,00") de volta para número puro (ex: 1850000).
 */
export function parseCurrencyMask(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const str = String(value).trim();
  if (!str) return 0;

  // Se contém R$ ou vírgula, segue o padrão brasileiro com centavos (ex: "R$ 1.850.000,00")
  if (str.includes(',') || str.includes('R$')) {
    const digits = str.replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  }

  // Se for apenas dígitos inteiros (ex: "1850000")
  const digits = str.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}

