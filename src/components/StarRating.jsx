// src/components/StarRating.jsx
import { useState } from "react";

export function StarRating({ totalStars = 5, onRating }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleClick = (value) => {
    setSelected(value);
    if (onRating) onRating(value);
  };

  return (
    <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;

        return (
          <span
            key={index}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: "32px",
              color:
                starValue <= (hovered || selected)
                  ? "#FFD700" // ⭐ amarilla
                  : "#ccc",   // gris
              transition: "0.2s",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
