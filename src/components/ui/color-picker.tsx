
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
  className?: string;
};

export const ChromePicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange,
  className
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-8 w-8 rounded-md border border-white/10 shadow-sm",
            className
          )}
          style={{ backgroundColor: color }}
          aria-label="Pick a color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Color</div>
            <div className="flex h-5 items-center gap-1">
              <div 
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">{color}</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[
              "#d4af37", // Gold
              "#ffffff", // White
              "#000000", // Black
              "#121212", // Dark gray
              "#1e1e1e", // Darker gray
              "#f0f0f0", // Light gray
              "#ff0000", // Red
              "#00ff00", // Green
              "#0000ff", // Blue
              "#ffff00", // Yellow
            ].map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "h-6 w-6 rounded-md border border-white/20",
                  color === presetColor && "ring-2 ring-white/50"
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => onChange(presetColor)}
              />
            ))}
          </div>
          <div className="mt-2">
            <label className="text-xs">Custom color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-black-light/50 border border-gold/10 rounded px-2 py-1 text-white text-xs mt-1"
              placeholder="#000000"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
