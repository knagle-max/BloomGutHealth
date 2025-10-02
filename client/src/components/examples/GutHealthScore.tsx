import GutHealthScore from '../GutHealthScore';

export default function GutHealthScoreExample() {
  return (
    <div className="p-6 bg-card rounded-lg">
      <GutHealthScore score={72} previousScore={65} lastUpdated="2 days ago" />
    </div>
  );
}
