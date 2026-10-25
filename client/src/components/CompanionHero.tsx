import type { ReactNode } from 'react';
/** Shared presentation only; callers own source freshness and permitted actions. */
export default function CompanionHero({ title, eyebrow, reason, actions, children, headingId = 'today-action-title', className = '', icon = '/brand/bloom-icon-everyday.svg' }: {
    title: string;
    eyebrow: string;
    reason: string;
    actions: ReactNode;
    children?: ReactNode;
    headingId?: string;
    className?: string;
    icon?: string;
}) {
    return <section className={`today-focus ${className}`} aria-labelledby={headingId}>
  <div className="today-focus-heading"><div><p className="eyebrow">{eyebrow}</p><h2 id={headingId}>{title}</h2></div><img src={icon} width={54} height={54} alt="" className="today-focus-mark"/></div>
  <div className="today-focus-actions">{actions}</div><p className="today-focus-reason">{reason}</p>{children}
 </section>;
}
