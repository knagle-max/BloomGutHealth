import BacterialBar from '../BacterialBar';

export default function BacterialBarExample() {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-md bg-card rounded-lg">
      <h3 className="font-display font-semibold">Bacterial Composition</h3>
      <BacterialBar name="Akkermansia" currentLevel={2.5} optimalRange="1-4%" />
      <BacterialBar name="Bifidobacterium" currentLevel={8.7} optimalRange="2-25%" />
      <BacterialBar name="Faecalibacterium" currentLevel={1.2} optimalRange="3-15%" isDeficient />
      <BacterialBar name="Bacteroides" currentLevel={25.3} optimalRange="15-45%" />
    </div>
  );
}
