
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  id?: string; // Keep id as optional
}

export function ColorPicker({ value, onChange, id }: ColorPickerProps) {
  const [color, setColor] = useState(value || '#000000');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-md border"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-72">
        <div className="space-y-4 py-2">
          <div className="flex justify-center">
            <div 
              className="w-24 h-24 rounded-md border"
              style={{ backgroundColor: color }}
            />
          </div>
          <input 
            type="color" 
            value={color}
            onChange={handleChange}
            className="w-full h-10 cursor-pointer" 
            id={id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
