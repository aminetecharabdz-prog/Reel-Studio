// Simple line icons drawn for the Daftari reel (24×24 grid, stroke = currentColor).
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const Base: React.FC<P & { children: React.ReactNode }> = ({ size = 64, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

export const IconCheck: React.FC<P> = (p) => <Base {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Base>;
export const IconQuestion: React.FC<P> = (p) => <Base {...p}><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.3a2.8 2.8 0 015.4 1c0 1.9-2.7 2.4-2.7 4" /><circle cx="12" cy="17.6" r=".4" fill="currentColor" /></Base>;
export const IconUsers: React.FC<P> = (p) => <Base {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><circle cx="17" cy="9" r="2.6" /><path d="M16.5 14.6c2.6.2 4.4 1.9 5 5" /></Base>;
export const IconUser: React.FC<P> = (p) => <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" /></Base>;
export const IconBook: React.FC<P> = (p) => <Base {...p}><path d="M5 4.5h11a3 3 0 013 3V20H8a3 3 0 01-3-3z" /><path d="M5 17a3 3 0 013-3h11" /></Base>;
export const IconAbsent: React.FC<P> = (p) => <Base {...p}><circle cx="10" cy="8" r="3.8" /><path d="M3 20.5c.7-3.9 3.6-6 7-6 1.4 0 2.7.3 3.8 1" /><path d="M16.5 15.5l5 5M21.5 15.5l-5 5" /></Base>;
export const IconCalendar: React.FC<P> = (p) => <Base {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Base>;
export const IconBell: React.FC<P> = (p) => <Base {...p}><path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2 2 0 004 0" /></Base>;
export const IconTimer: React.FC<P> = (p) => <Base {...p}><circle cx="12" cy="13.5" r="7.5" /><path d="M12 13.5V9.5M9.5 2.5h5" /></Base>;
export const IconCloud: React.FC<P> = (p) => <Base {...p}><path d="M7 18.5h10.5a4 4 0 00.6-8 6 6 0 00-11.5 1.5A3.3 3.3 0 007 18.5z" /></Base>;
export const IconOffline: React.FC<P> = (p) => <Base {...p}><path d="M2.5 8.5a14 14 0 0119 0M5.5 12a9.5 9.5 0 0113 0M8.7 15.4a5 5 0 016.6 0" /><circle cx="12" cy="19" r=".5" fill="currentColor" /></Base>;
export const IconLock: React.FC<P> = (p) => <Base {...p}><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 018 0v3" /><path d="M12 14.5v2.5" /></Base>;
export const IconChat: React.FC<P> = (p) => <Base {...p}><path d="M4 18.5l1.2-3.6A8 8 0 1112 20a8 8 0 01-3.7-.9z" /></Base>;
export const IconFile: React.FC<P> = (p) => <Base {...p}><path d="M6 3h8.5L19 7.5V21H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></Base>;
export const IconChart: React.FC<P> = (p) => <Base {...p}><path d="M4 20V4M4 20h16" /><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6" /></Base>;
export const IconArrowUp: React.FC<P> = (p) => <Base {...p}><path d="M12 20V5M6 11l6-6 6 6" /></Base>;
export const IconStar: React.FC<P> = (p) => <Base {...p}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" /></Base>;
