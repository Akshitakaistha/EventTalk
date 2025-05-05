import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Using your custom Label wrapper

const NumberWithTopRightCheckbox = React.forwardRef(
  ({ field, isPreview, onChange, onCheckboxChange }, ref) => {
    return (
      <div className="space-y-1">
        {/* Label + Checkbox Row */}
        <div className="flex justify-between items-center">
          <Label htmlFor={`number-${field.id}`} className="text-sm">
            {field.label || 'Mobile Number'}
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`whatsapp-${field.id}`}
              disabled={!isPreview}
              checked={field.whatsappChecked}
              onCheckedChange={(checked) => onCheckboxChange(field.id, checked)}
            />
            <Label htmlFor={`whatsapp-${field.id}`} className="text-xs">
              WhatsApp me?
            </Label>
          </div>
        </div>

        {/* Number input */}
        <input
          ref={ref}
          id={`number-${field.id}`}
          type="number"
          placeholder={field?.placeholder}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          disabled={!isPreview}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          readOnly={field.readOnly}
        />
      </div>
    );
  }
);

NumberWithTopRightCheckbox.displayName = 'NumberWithTopRightCheckbox';

export default NumberWithTopRightCheckbox;
