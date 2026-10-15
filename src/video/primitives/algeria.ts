/** Simplified Algeria outline (lon, lat) — recognisable silhouette for map primitives. */
export const ALGERIA: Array<[number, number]> = [
  [-2.2, 35.1], [-1.0, 35.7], [0.1, 35.9], [1.5, 36.5], [3.0, 36.8], [4.5, 36.9], [6.0, 37.0], [7.5, 37.0], [8.6, 36.95],
  [8.3, 36.4], [8.4, 35.2], [7.6, 34.2], [7.8, 33.2], [9.0, 32.1], [9.5, 30.2], [9.8, 28.0], [9.9, 26.5], [9.4, 26.2],
  [10.0, 25.3], [11.99, 23.52], [7.5, 20.85], [4.25, 19.15], [3.3, 19.0], [1.1, 20.7], [-4.8, 25.0], [-8.67, 27.3],
  [-8.67, 28.7], [-7.0, 29.5], [-5.5, 29.6], [-3.6, 30.6], [-2.9, 31.2], [-1.2, 32.1], [-1.2, 32.7], [-1.8, 34.0], [-1.7, 34.8],
];
export const CITIES: Array<{ name: string; lon: number; lat: number }> = [
  { name: 'الجزائر', lon: 3.06, lat: 36.75 }, { name: 'وهران', lon: -0.63, lat: 35.7 }, { name: 'قسنطينة', lon: 6.6, lat: 36.36 },
  { name: 'عنابة', lon: 7.77, lat: 36.9 }, { name: 'سطيف', lon: 5.41, lat: 36.19 }, { name: 'تلمسان', lon: -1.32, lat: 34.88 },
  { name: 'باتنة', lon: 6.17, lat: 35.55 }, { name: 'بسكرة', lon: 5.73, lat: 34.85 }, { name: 'الجلفة', lon: 3.25, lat: 34.67 },
  { name: 'غرداية', lon: 3.67, lat: 32.49 }, { name: 'ورقلة', lon: 5.33, lat: 31.95 }, { name: 'بشار', lon: -2.22, lat: 31.6 },
  { name: 'أدرار', lon: -0.29, lat: 27.87 }, { name: 'إليزي', lon: 8.48, lat: 26.48 }, { name: 'تمنراست', lon: 5.52, lat: 22.79 },
  { name: 'تندوف', lon: -8.15, lat: 27.67 }, { name: 'بجاية', lon: 5.08, lat: 36.75 }, { name: 'تيزي وزو', lon: 4.05, lat: 36.71 },
  { name: 'الوادي', lon: 6.86, lat: 33.37 }, { name: 'الأغواط', lon: 2.88, lat: 33.8 },
];
export const project = (lon: number, lat: number, w: number, h: number) => {
  const minLon = -9, maxLon = 12.2, minLat = 18.8, maxLat = 37.3;
  return [((lon - minLon) / (maxLon - minLon)) * w, ((maxLat - lat) / (maxLat - minLat)) * h] as const;
};
