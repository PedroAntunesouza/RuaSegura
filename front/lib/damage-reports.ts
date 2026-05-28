import AsyncStorage from '@react-native-async-storage/async-storage';

export type SelectedLocation = {
  latitude: number;
  longitude: number;
};

export type DamageReport = {
  id: string;
  problems: string[];
  otherProblem: string;
  location: string;
  coordinates: SelectedLocation | null;
  photoUri: string;
  author: string;
  details: string;
  createdAt: string;
};

export const DAMAGE_REPORTS_STORAGE_KEY = '@ruasegura:damage-reports';

export async function getStoredReports() {
  const storedReports = await AsyncStorage.getItem(DAMAGE_REPORTS_STORAGE_KEY);

  if (!storedReports) {
    return [];
  }

  try {
    return JSON.parse(storedReports) as DamageReport[];
  } catch {
    return [];
  }
}

export function getReportTitle(report: Pick<DamageReport, 'otherProblem' | 'problems'>) {
  if (report.otherProblem.trim()) {
    return report.otherProblem.trim();
  }

  if (report.problems.length > 0) {
    return report.problems.join(', ');
  }

  return 'Avaria registrada';
}

export function getReportsRegion(reports: DamageReport[]) {
  const reportsWithCoordinates = reports.filter((report) => report.coordinates);

  if (reportsWithCoordinates.length === 0) {
    return null;
  }

  const latitudes = reportsWithCoordinates.map((report) => report.coordinates?.latitude ?? 0);
  const longitudes = reportsWithCoordinates.map((report) => report.coordinates?.longitude ?? 0);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max(maxLatitude - minLatitude, 0.01) + 0.01,
    longitudeDelta: Math.max(maxLongitude - minLongitude, 0.01) + 0.01,
  };
}
