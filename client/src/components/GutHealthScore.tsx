import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GutHealthScoreProps {
  score: number;
  previousScore?: number;
  lastUpdated?: string;
}

export default function GutHealthScore({ score, previousScore, lastUpdated }: GutHealthScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 76) return 'hsl(var(--health-excellent))';
    if (s >= 51) return 'hsl(var(--health-good))';
    return 'hsl(var(--health-attention))';
  };

  const getScoreStatus = (s: number) => {
    if (s >= 76) return 'Excellent';
    if (s >= 51) return 'Good Progress';
    return 'Needs Attention';
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const trend = previousScore ? score - previousScore : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="104"
            cy="104"
            r="90"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="104"
            cy="104"
            r="90"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-5xl font-semibold" style={{ color: getScoreColor(score) }}>
            {Math.round(animatedScore)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Gut Score</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-base font-medium" style={{ color: getScoreColor(score) }}>
          {getScoreStatus(score)}
        </div>
        {previousScore && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3 text-red-500" />
            ) : null}
            {trend !== 0 && (
              <span>
                {trend > 0 ? '+' : ''}{trend} from last week
              </span>
            )}
          </div>
        )}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Updated {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
}
