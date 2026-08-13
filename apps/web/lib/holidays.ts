export const COLOMBIAN_HOLIDAYS_2026 = [
  '2026-01-01', // Año nuevo
  '2026-01-12', // Epifanía (Día de los Reyes Magos)
  '2026-03-23', // San José (trasladado)
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión (trasladado)
  '2026-06-08', // Corpus Christi (trasladado)
  '2026-06-15', // Sagrado Corazón (trasladado)
  '2026-06-29', // San Pedro y San Pablo (trasladado)
  '2026-07-20', // Independencia de Colombia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción de la virgen (trasladado)
  '2026-10-12', // Día de la raza (trasladado)
  '2026-11-02', // Día de todos los santos (trasladado)
  '2026-11-16', // Independencia de Cartagena (trasladado)
  '2026-12-08', // Inmaculada concepción
  '2026-12-25', // Navidad
];

/**
 * Checks if a given date is a Colombian holiday in 2026.
 * Expects date to be in local Colombian time.
 */
export function isColombianHoliday(date: Date | string): boolean {
  let d: string;
  if (typeof date === 'string') {
    d = date.split('T')[0];
  } else {
    // We adjust to local Colombian date by subtracting 5 hours (bogota time)
    // or better using Colombia locale for comparison
    const coDate = new Date(date).toLocaleString('en-CA', { timeZone: 'America/Bogota' }).split(',')[0];
    d = coDate;
  }
  return COLOMBIAN_HOLIDAYS_2026.includes(d);
}
