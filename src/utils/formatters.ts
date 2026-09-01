export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(Math.abs(rounded));
  const sign = rounded < 0 ? '- ' : '';
  return `${sign}Rp ${formatted}`;
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(amount);
}

const MONTHS_INDO_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sept', 'Okt', 'Nov', 'Des'
];

const MONTHS_INDO_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MONTHS_INDO_SHORT[month] || parts[1];
  return `${day} ${monthName} ${year}`;
}

export function formatDateFullIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MONTHS_INDO_FULL[month] || parts[1];
  return `${day} ${monthName} ${year}`;
}

export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthNameIndo(monthIndex: number, full: boolean = true): string {
  return full ? MONTHS_INDO_FULL[monthIndex] || '' : MONTHS_INDO_SHORT[monthIndex] || '';
}

// Convert numbers into formal Indonesian words ("Terbilang")
export function terbilang(n: number): string {
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const num = Math.floor(Math.abs(n));

  if (num === 0) return 'Nol Rupiah';

  function convert(x: number): string {
    if (x < 12) {
      return units[x];
    } else if (x < 20) {
      return `${convert(x - 10)} Belas`;
    } else if (x < 100) {
      const rest = x % 10;
      return `${convert(Math.floor(x / 10))} Puluh ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 200) {
      const rest = x - 100;
      return `Seratus ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 1000) {
      const rest = x % 100;
      return `${convert(Math.floor(x / 100))} Ratus ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 2000) {
      const rest = x - 1000;
      return `Seribu ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 1000000) {
      const rest = x % 1000;
      return `${convert(Math.floor(x / 1000))} Ribu ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 1000000000) {
      const rest = x % 1000000;
      return `${convert(Math.floor(x / 1000000))} Juta ${rest ? convert(rest) : ''}`.trim();
    } else if (x < 1000000000000) {
      const rest = x % 1000000000;
      return `${convert(Math.floor(x / 1000000000))} Milyar ${rest ? convert(rest) : ''}`.trim();
    } else {
      return `${convert(Math.floor(x / 1000000000000))} Triliun ${convert(x % 1000000000000)}`.trim();
    }
  }

  const result = convert(num);
  return `${result} Rupiah`;
}

export function generateDocNumber(type: 'KELUAR' | 'MASUK', dateStr: string, index: number): string {
  const prefix = type === 'KELUAR' ? 'NK' : 'NM';
  const cleanDate = dateStr.replace(/-/g, '');
  const seq = String(index).padStart(3, '0');
  return `${prefix}-${cleanDate}-${seq}`;
}
