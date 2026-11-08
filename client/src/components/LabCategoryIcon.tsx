import type { ReactNode } from "react";
/** Original Designer geometries. Decorative category symbols, not clinical results. */
const shapes: Record<string, ReactNode> = {
  "blood-count": <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h4M7 13h3M7 17h4"/><circle cx="16.5" cy="10" r="2"/><path d="M14.5 16.7c.4-1.2 1.2-1.9 2-1.9.9 0 1.7.7 2 1.9"/></>,
  "bone": <><path d="M7.9 9.6 14.4 16a3 3 0 1 0 4.8 1.8 3.1 3.1 0 0 0-1.7-2.4L11 8.9A3 3 0 1 0 6.2 7a3 3 0 0 0 1.7 2.6Z"/><path d="m10 11 3 3"/></>,
  "heart": <><path d="M12 20s-8-5.2-8-10a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 4.8-8 10-8 10Z"/><path d="M5.4 12h3l1.5-2.4 2.3 5 1.7-2.6h4.6"/></>,
  "hormones": <><path d="M4 7c2.2-3.2 5.8-3.2 8 0 2.2-3.2 5.8-3.2 8 0"/><path d="M4 17c2.2 3.2 5.8 3.2 8 0 2.2 3.2 5.8 3.2 8 0"/><path d="M12 7v10"/><circle cx="12" cy="12" r="2"/></>,
  "inflammation": <><path d="m12 2 2.8 5.9L21 10l-4.9 4.2L17 21l-5-3-5 3 .9-6.8L3 10l6.2-2.1L12 2Z"/><path d="M12 8v5M12 16h.01"/></>,
  "kidney": <><path d="M9 4.5C5.1 3.7 3.5 7.2 3.6 11c.1 4 2.4 7.4 5.5 7.5 2.6.1 3.4-2.1 2.7-4.1-.5-1.5-2.3-2-2-4.1.2-1.8 1.7-3.9-.8-5.8Z"/><path d="M15 4.5c3.9-.8 5.5 2.7 5.4 6.5-.1 4-2.4 7.4-5.5 7.5-2.6.1-3.4-2.1-2.7-4.1.5-1.5 2.3-2 2-4.1-.2-1.8-1.7-3.9.8-5.8Z"/><path d="M11 17v3m2-3v3"/></>,
  "liver": <><path d="M3.2 10c2-3.6 6-4.5 9.8-4.2 3.6.3 6.1 1.7 7.8 3.8-.7 3.1-3.6 5.1-7.4 5.2l-2.4 4.6c-.6 1.1-2.1 1.1-2.6.1l-1.7-4c-2.1-.5-3.3-2-3.5-5.6Z"/><path d="M12.9 5.8c1.2 2.3 1.2 4.3.1 6.3"/></>,
  "nutrients": <><path d="M9 3v6l-4.9 8.1A2.7 2.7 0 0 0 6.5 21h11a2.7 2.7 0 0 0 2.4-3.9L15 9V3"/><path d="M7 3h10M7.2 16h9.6"/><path d="M10 18h4"/></>,
  "other": <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 1 1 4.4 1.5c-1.2 1.3-2.2 1.7-2.2 3"/><path d="M12 17h.01"/></>,
  "sugar": <><path d="M12 2.8C9.4 6.3 5.8 10.4 5.8 14a6.2 6.2 0 0 0 12.4 0c0-3.6-3.6-7.7-6.2-11.2Z"/><path d="M9.2 15.8a3 3 0 0 0 2.9 2.5"/></>,
};
export default function LabCategoryIcon({categoryId}: {categoryId:string}) {
  const shape=shapes[categoryId] ?? shapes.other;
  return <span className="lab-category-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">{shape}</svg></span>;
}
