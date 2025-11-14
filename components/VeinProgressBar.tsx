
import React, { useRef, useEffect, useState } from 'react';

interface VeinProgressBarProps {
  progress: number;
}

export const VeinProgressBar: React.FC<VeinProgressBarProps> = ({ progress }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      // A small delay to ensure the path is fully rendered in the DOM before calculating its length.
      setTimeout(() => setPathLength(pathRef.current!.getTotalLength()), 100);
    }
  }, []);

  // Ensure progress doesn't exceed 100 to prevent visual glitches.
  const cappedProgress = Math.min(progress, 100);
  const offset = pathLength * (1 - cappedProgress / 100);

  // This SVG path is a single continuous line designed to look like branching vessels.
  const veinPath = "M 5,20 C 40,5, 50,5, 60,20 S 80,35, 90,20 L 120,20 C 130,5, 140,5, 150,20 S 170,35, 180,20 L 195,20";

  return (
    <div className="w-full h-12">
      <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
        {/* The path for the "empty" or background vein */}
        <path
          ref={pathRef}
          d={veinPath}
          fill="none"
          stroke="#fca5a5" // danger-light
          strokeOpacity="0.5"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* The path for the "filling" or progress vein */}
        <path
          d={veinPath}
          fill="none"
          stroke="#b91c1c" // danger-dark
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease-in-out' }}
        />
      </svg>
    </div>
  );
};
