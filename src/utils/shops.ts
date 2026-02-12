/**
 * Check if a shop is currently open based on hours data.
 * Hours format: { monday: "12:00-19:00", ... }
 * All times are in ET (America/New_York).
 */
export function isShopOpen(hours: Record<string, string>): boolean {
  const now = new Date();
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[etTime.getDay()];
  const todayHours = hours[dayName];
  if (!todayHours || todayHours.toLowerCase() === 'closed') return false;

  const [open, close] = todayHours.split('-').map(t => {
    const [h, m] = t.trim().split(':').map(Number);
    return h * 60 + m;
  });
  const currentMinutes = etTime.getHours() * 60 + etTime.getMinutes();
  return currentMinutes >= open && currentMinutes < close;
}

/** Get all unique boroughs from shop data */
export function getBoroughs(shops: any[]): string[] {
  return [...new Set(shops.map(s => s.borough))].sort();
}

/** Get all unique specialties from shop data */
export function getSpecialties(shops: any[]): string[] {
  return [...new Set(shops.flatMap(s => s.specialties || []))].sort();
}
