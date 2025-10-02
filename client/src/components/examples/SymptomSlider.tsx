import { useState } from 'react';
import SymptomSlider from '../SymptomSlider';
import { Activity, Zap, Heart, Brain } from 'lucide-react';

export default function SymptomSliderExample() {
  const [bloating, setBloating] = useState(4);
  const [energy, setEnergy] = useState(7);
  const [comfort, setComfort] = useState(6);
  const [mood, setMood] = useState(8);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md">
      <SymptomSlider icon={Activity} label="Bloating Level" value={bloating} onChange={setBloating} />
      <SymptomSlider icon={Zap} label="Energy Level" value={energy} onChange={setEnergy} />
      <SymptomSlider icon={Heart} label="Digestive Comfort" value={comfort} onChange={setComfort} />
      <SymptomSlider icon={Brain} label="Mental Clarity" value={mood} onChange={setMood} />
    </div>
  );
}
