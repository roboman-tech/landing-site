import React from "react";
import "./SpinnerRing.css";
interface SpinnerProps {
  size?: number;
  color?: string;
}

export const SpinnerRing: React.FC<SpinnerProps> = ({
  size = 24,
  color = "#333",
}) => {
  const borderSize = Math.max(2, Math.round(size / 8));

  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${borderSize}px solid rgba(0,0,0,0.15)`,
        borderTop: `${borderSize}px solid ${color}`,
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
};
