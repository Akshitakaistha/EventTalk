import React, { useState } from 'react';
import { Icons } from '@/components/ui/ui-icons';
import { useFormBuilder } from '@/contexts/FormBuilderContext';
import { Switch } from '@/components/ui/switch';

const PropertyEditor = () => {
  const { formState, updateFieldProperties, getActiveField } = useFormBuilder();
  const activeField = getActiveField();
  
  const [showValidationOptions, setShowValidationOptions] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Special handling for banner position and PDF upload
  const isBannerField = activeField?.type === 'bannerUpload';
  const isPdfField = activeField?.type === 'pdfUpload';
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFieldProperties(activeField.id, {
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...activeField.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateFieldProperties(activeField.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(activeField.options || [])];
    newOptions.push({ label: `Option ${newOptions.length + 1}`, value: `option${newOptions.length + 1}` });
    updateFieldProperties(activeField.id, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = [...activeField.options];
    newOptions.splice(index, 1);
    updateFieldProperties(activeField.id, { options: newOptions });
  };

  if (!activeField) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Properties</h2>
        </div>
        <div className="p-4 flex items-center justify-center h-full text-gray-500 text-sm">
          Select a field to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Properties</h2>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
          <select 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={activeField.type}
            disabled
          >
            <option>{activeField.type.charAt(0).toUpperCase() + activeField.type.slice(1)}</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input 
            type="text" 
            name="label"
            value={activeField.label || ''} 
            onChange={handleInputChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub Label / Helper Text</label>
          <input 
            type="text" 
            name="helperText"
            value={activeField.helperText || ''} 
            onChange={handleInputChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {activeField.type === 'checkbox' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Checkbox Text</label>
            <input 
              type="text" 
              name="checkboxText"
              value={activeField.checkboxText || ''} 
              onChange={handleInputChange}
              placeholder="Additional description for the checkbox"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        )}
        
        {isBannerField && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Position</label>
              <select
                name="position"
                value={activeField.position || 'left'}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="left">Left Side</option>
                <option value="top">Top</option>
              </select>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Allow Upload</label>
                <Switch
                  checked={activeField.canUpload || false}
                  onCheckedChange={(checked) => {
                    updateFieldProperties(activeField.id, { canUpload: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Allow Download</label>
                <Switch
                  checked={activeField.canDownload || false}
                  onCheckedChange={(checked) => {
                    updateFieldProperties(activeField.id, { canDownload: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Allow View</label>
                <Switch
                  checked={activeField.canView || false}
                  onCheckedChange={(checked) => {
                    updateFieldProperties(activeField.id, { canView: checked });
                  }}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Banner</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="banner-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input 
                        id="banner-upload" 
                        name="banner-upload" 
                        type="file" 
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Handle file upload here
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              updateFieldProperties(activeField.id, {
                                bannerUrl: e.target?.result
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {activeField.bannerUrl && (
                <div className="mt-2">
                  <img 
                    src={activeField.bannerUrl} 
                    alt="Banner preview" 
                    className="h-32 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grid Layout</label>
          <select
            name="gridColumn"
            value={activeField.gridColumn || 'full'}
            onChange={handleInputChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="full">Full Width</option>
            <option value="half">Half Width</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
          <input 
            type="text"
            name="placeholder" 
            value={activeField.placeholder || ''} 
            onChange={handleInputChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Required Field</label>
            <div className="ml-2">
              <Switch
                checked={activeField.required || false}
                onCheckedChange={(checked) => {
                  updateFieldProperties(activeField.id, { required: checked });
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Validation Rules Dropdown */}
        <div className="mb-4">
          <button 
            className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowValidationOptions(!showValidationOptions)}
          >
            <span>Validation Rules</span>
            <div className={`transition-transform ${showValidationOptions ? 'rotate-180' : ''}`}>
              <Icons.ChevronDown />
            </div>
          </button>
          
          <div className={`mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 ${showValidationOptions ? '' : 'hidden'}`}>
            <div className="space-y-3">
              {/* Customize based on field type */}
              {(activeField.type === 'textInput' || activeField.type === 'textArea') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Length</label>
                    <input 
                      type="number" 
                      name="minLength"
                      value={activeField.minLength || ''} 
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Length</label>
                    <input 
                      type="number" 
                      name="maxLength"
                      value={activeField.maxLength || ''} 
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                </>
              )}
              
              {activeField.type === 'number' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Value</label>
                    <input 
                      type="number" 
                      name="min"
                      value={activeField.min || ''} 
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Value</label>
                    <input 
                      type="number" 
                      name="max"
                      value={activeField.max || ''} 
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                </>
              )}
              
              {(activeField.type === 'fileUpload' || activeField.type === 'mediaUpload') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Allowed File Types</label>
                    <input 
                      type="text" 
                      name="allowedTypes"
                      value={activeField.allowedTypes || ''} 
                      onChange={handleInputChange}
                      placeholder="e.g., image/*,application/pdf"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maximum File Size (MB)</label>
                    <input 
                      type="number" 
                      name="maxFileSize"
                      value={activeField.maxFileSize || ''} 
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                    />
                  </div>
                </>
              )}
              
              {activeField.type === 'email' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Pattern</label>
                  <input 
                    type="text" 
                    name="pattern"
                    value={activeField.pattern || ''} 
                    onChange={handleInputChange}
                    placeholder="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Error Message</label>
                <input 
                  type="text" 
                  name="errorMessage"
                  value={activeField.errorMessage || ''} 
                  onChange={handleInputChange}
                  placeholder="Please enter a valid value"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Advanced Settings Dropdown */}
        <div className="mb-4">
          <button 
            className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <span>Advanced Settings</span>
            <div className={`transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
              <Icons.ChevronDown />
            </div>
          </button>
          
          <div className={`mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 ${showAdvancedOptions ? '' : 'hidden'}`}>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Field ID</label>
                <input 
                  type="text" 
                  name="fieldId"
                  value={activeField.fieldId || activeField.id} 
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CSS Classes</label>
                <input 
                  type="text" 
                  name="cssClasses"
                  value={activeField.cssClasses || ''} 
                  onChange={handleInputChange}
                  placeholder="custom-field"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-xs text-gray-700">Hide Label</label>
                <div className="ml-2">
                  <Switch
                    checked={activeField.hideLabel || false}
                    onCheckedChange={(checked) => {
                      updateFieldProperties(activeField.id, { hideLabel: checked });
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <label className="block text-xs text-gray-700">Read Only Field</label>
                <div className="ml-2">
                  <Switch
                    checked={activeField.readOnly || false}
                    onCheckedChange={(checked) => {
                      updateFieldProperties(activeField.id, { readOnly: checked });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Options Editor for Select, Radio, and Checkbox */}
        {(activeField.type === 'select' || activeField.type === 'radio') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {(activeField.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                    placeholder="Option label"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                    placeholder="Option value"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="w-full mt-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50"
              >
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Apply Changes Button */}
        <div className="pt-4 border-t border-gray-200">
          <button 
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => {
              // All changes are already applied in real-time
            }}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyEditor;
