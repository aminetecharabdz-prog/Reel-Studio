/** One file controls the brand: name, tagline, colours (MISSION_V4 §2). */
export const BRAND = {
  name: 'Rassam',
  nameAr: 'رسّام',
  taglineAr: 'ارسم فيديوك بالكلام',
  taglineEn: 'Draw your video with words',
  descriptionAr:
    'رسّام يحوّل كلامك وصوتك وصور منتجك إلى فيديو موشن احترافي بعشرة ستايلات مرسومة — للتجارة الإلكترونية، صنّاع المحتوى، والظهور بالصورة.',
  colors: {
    /** night ink: the dark theme ground (blue-green, never neutral black) */
    night: '#0A141B',
    ink: '#13232D',
    line: '#24363F',
    /** chalk white for strokes and text on night */
    chalk: '#EEF2F2',
    /** paper: the light theme ground */
    paper: '#F3F2EE',
    /** the spark at the pen tip */
    spark: '#FF7A1A',
    sparkGlow: '#FFB45C',
    sparkCore: '#FFF3D9',
    /** graphite teal: live / selected states */
    teal: '#6FD1C3',
  },
  repoUrl: 'https://github.com/aminetecharabdz-prog/Reel-Studio',
  kitUrl: 'https://github.com/motalim-ai/motion-starter-kit',
} as const;
