import { Barcode, Search, Utensils, Camera, ChevronRight } from 'lucide-react';
import CompanionHero from './CompanionHero';
import type { FoodEntryMethod, foodEntryMethods } from '@shared/food-entry';
/** Presentation only: the caller supplies the already permitted, ready methods. */
export default function FoodEntryChooser({ methods, onSelect, photoLabel }: {
  methods: readonly (typeof foodEntryMethods)[number][];
  onSelect: (method: FoodEntryMethod) => void;
  photoLabel?: string;
}) {
  const primary = methods.find(method => method.id === 'barcode') || methods[0];
  if (!primary) return <p role="status">Food entry methods are unavailable. Your draft stays here.</p>;
  const icons = { barcode: Barcode, search: Search, describe: Utensils, restaurant: Utensils, photo: Camera };
  return <div className="food-entry-chooser">
    <CompanionHero className="food-entry-hero" headingId="food-entry-primary" eyebrow="YOUR NEXT ACTION" title={primary.label}
      reason={primary.description + ' Review the food and portion before saving.'}
      actions={<button type="button" className="hero-button" onClick={() => onSelect(primary.id)}>{primary.label}<ChevronRight size={18} aria-hidden="true"/></button>}/>
    <div className="food-entry-alternatives">{methods.filter(method => method.id !== primary.id).map(method => {
      const Icon = icons[method.id], preview = method.id === 'photo' && photoLabel;
      return <button type="button" key={method.id} className={`food-entry-method ${preview ? 'development-feature' : ''}`} onClick={() => onSelect(method.id)}>
        <Icon size={22} aria-hidden="true"/><span><strong>{method.label}</strong><span className="food-entry-description">{preview ? 'Preview a synthetic image locally, then describe it.' : method.description}</span>{preview&&<span className="development-status">Development · {photoLabel}</span>}</span><ChevronRight size={18} aria-hidden="true"/>
      </button>;
    })}</div>
  </div>;
}
