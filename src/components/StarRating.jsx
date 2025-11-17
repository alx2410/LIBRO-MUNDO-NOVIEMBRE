// src/components/StarRating.jsx
import { useState, useEffect } from "react";

export function StarRating({ totalStars = 5, onRating, value = 0, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(value);

  // Mantener rating externo actualizado
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleClick = (val) => {
    if (readOnly) return;
    setSelected(val);
    if (onRating) onRating(val);
  };

  return (
    <div className="star-rating-container">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className="estrella"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHovered(starValue)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{
              color: starValue <= (hovered || selected) ? "#FFD700" : "#ccc",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
