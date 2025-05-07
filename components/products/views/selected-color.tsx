"use client";

import React from 'react';

// Interface para un objeto color (basado en tu respuesta de API)
export interface Color {
  _id: string;
  spanish: string;
  name: string;
  hex: string;
}

interface MinimalColorSquareProps {
  color: Color;
  isSelected: boolean;
  onSelect: (color: Color) => void;
}

const MinimalColorSquare: React.FC<MinimalColorSquareProps> = ({ color, isSelected, onSelect }) => (
  <button
    type="button"
    className={`w-6 h-6 rounded-sm border-2 transition-all duration-150 ease-in-out 
                ${isSelected ? 'ring-2 ring-offset-1 ring-primary border-primary' : 'border-gray-300 hover:border-gray-400'}`}
    style={{ backgroundColor: color.hex }}
    onClick={() => onSelect(color)}
    aria-label={`Seleccionar color ${color.spanish}`}
    title={color.spanish} // Tooltip con el nombre en español
  >
     {/* Podrías añadir un checkmark si está seleccionado, si lo deseas */}
     {/* {isSelected && <Check className="w-3 h-3 text-white" />} */}
  </button>
);

// Props para el componente principal que muestra la lista de colores
interface SelectableColorGridProps {
  colors: Color[];
  selectedColor: Color | null;
  onColorSelect: (color: Color | null) => void;
}

const SelectableColorGrid: React.FC<SelectableColorGridProps> = ({ colors, selectedColor, onColorSelect }) => {
  
  const handleSelect = (color: Color) => {
    // Si se selecciona el mismo color, deseleccionar. Si no, seleccionar el nuevo.
    if (selectedColor && selectedColor._id === color._id) {
      onColorSelect(null); 
    } else {
      onColorSelect(color);
    }
  };

  if (!colors || colors.length === 0) {
    return <p className="text-muted-foreground text-xs py-2">No hay colores disponibles.</p>;
  }

  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 py-1"> {/* Más columnas, menos gap */}
      {colors.map((color) => (
        <MinimalColorSquare 
          key={color._id} 
          color={color} 
          isSelected={selectedColor?._id === color._id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export default SelectableColorGrid;
  