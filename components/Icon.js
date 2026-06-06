function Svg({ size = "1em", fill = "none", children, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  );
}

export const Clock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>;
export const Level = (p) => <Svg {...p}><path d="M5 19v-4M12 19V9M19 19V5" /></Svg>;
export const Heart = ({ filled, ...p }) => <Svg fill={filled ? "currentColor" : "none"} {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z" /></Svg>;
export const Utensils = (p) => <Svg {...p}><ellipse cx="7.3" cy="6.4" rx="2.3" ry="3.4" /><path d="M7.3 9.8V21" /><path d="M14.6 3v4.3M16.7 3v4.3M18.8 3v4.3M14.6 7.3h4.2M16.7 7.3V21" /></Svg>;
export const Search = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></Svg>;
export const Close = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const Edit = (p) => <Svg {...p}><path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" /><path d="m13.5 6.5 3 3" /></Svg>;
export const Check = (p) => <Svg {...p}><path d="M5 12.5 10 17.5 19.5 7" /></Svg>;
export const Mail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.2" /><path d="m3.6 7 8.4 6 8.4-6" /></Svg>;
export const Lock = (p) => <Svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
export const Shield = (p) => <Svg {...p}><path d="M12 3 5 6v6c0 4 3 6.6 7 8 4-1.4 7-4 7-8V6l-7-3z" /></Svg>;
export const Alert = (p) => <Svg {...p}><path d="M12 4 2.6 20h18.8L12 4z" /><path d="M12 10v4M12 17.4v.2" /></Svg>;
export const Hourglass = (p) => <Svg {...p}><path d="M7 3h10M7 21h10M8 3v3l4 4 4-4V3M8 21v-3l4-4 4 4v3" /></Svg>;
export const Trash = (p) => <Svg {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-13" /></Svg>;
export const Dice = (p) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="3.2" /><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" /></Svg>;
export const Bowl = (p) => <Svg {...p}><path d="M3 11h18M4.5 11a7.5 7.5 0 0 0 15 0M6 19h12" /><path d="M9.5 7.5c0-1.6 1-2.2 1-3.5M14.5 7.5c0-1.6 1-2.2 1-3.5" /></Svg>;
export const Tomato = (p) => <Svg {...p}><circle cx="12" cy="14.5" r="6.5" /><path d="M12 8c0-2-1-3-3-3M12 8c0-2 1-3 3-3M9.5 6.8 12 8l2.5-1.2" /></Svg>;
export const Garlic = (p) => <Svg {...p}><path d="M12 8c-3 0-5 3-5 7a5 5 0 0 0 10 0c0-4-2-7-5-7zM12 8c1-1 1-2.5 0-4-1 1.5-1 3 0 4M12 9v10M9.3 10c-1 3-1 6.5 0 9M14.7 10c1 3 1 6.5 0 9" /></Svg>;
export const Bread = (p) => <Svg {...p}><path d="M4 14a4 4 0 0 1 4-4h8a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4z" /><path d="m9.5 11-1.2 6M12.4 11l-1.2 6M15.3 11l-1.2 6" /></Svg>;
export const Cheese = (p) => <Svg {...p}><path d="M4 16 18 6.5 20.5 10v6a.8.8 0 0 1-.8.8H4z" /><circle cx="9" cy="13.5" r="1" /><circle cx="14.5" cy="12.5" r="1" /></Svg>;
export const Herb = (p) => <Svg {...p}><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" /><path d="M5.5 18.5C9.5 14.5 13.5 10.5 17 7" /></Svg>;
export const Menu = (p) => <Svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Svg>;
