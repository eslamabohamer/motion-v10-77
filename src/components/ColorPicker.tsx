
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(value || '#000000');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
  };
  
  const handleSave = () => {
    // Only call onChange when user confirms the color
    onChange(color);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-md border"
          style={{ backgroundColor: value || '#000000' }}
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
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setColor(value || '#000000');
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
