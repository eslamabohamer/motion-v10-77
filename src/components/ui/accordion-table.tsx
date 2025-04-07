
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Pencil, X, Check, LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AccordionTableProps {
  items: any[];
  columns: { key: string; label: string; type?: 'text' | 'image' | 'url' }[];
  onEdit: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
}

export const AccordionTable = ({
  items,
  columns,
  onEdit,
  onDelete,
  onReorder,
}: AccordionTableProps) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSaveEdit = (id: string) => {
    onEdit(id, formData);
    setEditingId(null);
    setFormData({});
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
            <div className="flex flex-1 items-center">
              <span className="text-sm font-medium">
                {item.name || item.title || `Item ${index + 1}`}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2">
            {editingId === item.id ? (
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.key} className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium">{column.label}</span>
                    {column.type === 'image' ? (
                      <div className="col-span-2">
                        <Input 
                          value={formData[column.key] || ''}
                          onChange={(e) => handleInputChange(column.key, e.target.value)}
                          placeholder="Image URL"
                          className="w-full"
                        />
                        {formData[column.key] && (
                          <div className="mt-2 p-2 border rounded">
                            <img 
                              src={formData[column.key]} 
                              alt="Preview" 
                              className="h-16 object-contain" 
                            />
                          </div>
                        )}
                      </div>
                    ) : column.type === 'url' ? (
                      <div className="col-span-2 flex">
                        <div className="flex-grow">
                          <Input 
                            value={formData[column.key] || ''}
                            onChange={(e) => handleInputChange(column.key, e.target.value)}
                            placeholder="URL"
                            className="w-full"
                          />
                        </div>
                        {formData[column.key] && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="ml-2"
                            onClick={() => window.open(formData[column.key], '_blank')}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Input
                        className="col-span-2"
                        value={formData[column.key] || ''}
                        onChange={(e) => handleInputChange(column.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.key} className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium">{column.label}</span>
                    {column.type === 'image' ? (
                      <div className="col-span-2 flex items-center">
                        {item[column.key] ? (
                          <div className="flex items-center">
                            <img 
                              src={item[column.key]} 
                              alt="Logo" 
                              className="h-10 object-contain mr-2" 
                            />
                            <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
                              {item[column.key]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    ) : column.type === 'url' ? (
                      <div className="col-span-2 flex items-center">
                        {item[column.key] ? (
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis mr-2">
                              {item[column.key]}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(item[column.key], '_blank')}
                            >
                              <LinkIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    ) : (
                      <div className="col-span-2">
                        <span className="text-sm">{item[column.key] || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
