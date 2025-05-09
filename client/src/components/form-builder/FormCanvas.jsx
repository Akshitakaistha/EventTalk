import React, { useRef } from 'react';
import { useFormBuilder } from '@/contexts/FormBuilderContext';
import FormComponents from './FormComponents';
import { Icons } from '@/components/ui/ui-icons';

const FormCanvas = () => {
  const { 
    formState, 
    addField, 
    setActiveField, 
    moveFieldUp, 
    moveFieldDown, 
    deleteField,
    hasBannerComponent,
    setFormState
  } = useFormBuilder();

  const bannerField = formState.fields.find(field => field.type === 'bannerUpload');

  const dropPlaceholderRef = useRef(null);
  const formCanvasRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dropPlaceholderRef.current) {
      dropPlaceholderRef.current.classList.remove('hidden');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!formCanvasRef.current?.contains(e.relatedTarget) && dropPlaceholderRef.current) {
      dropPlaceholderRef.current.classList.add('hidden');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropPlaceholderRef.current) {
      dropPlaceholderRef.current.classList.add('hidden');
    }

    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      addField(componentType);
    }
  };

  // New handler for checkbox change
  const onCheckboxChange = (fieldId, checked) => {
    setFormState(prevState => {
      const updatedFields = prevState.fields.map(field => {
        if (field.id === fieldId) {
          return { ...field, value: checked };
        }
        return field;
      });
      return { ...prevState, fields: updatedFields };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 relative">
      <div className="p-6 max-w-4xl mx-auto">
        {hasBannerComponent ? (
          // Banner-enabled form layout
          <div className="bg-white rounded-lg shadow-sm mb-6">
            {/* ... banner layout code unchanged ... */}
            <div className={`${
  bannerField?.position === 'top'
    ? 'flex flex-col' 
    : 'flex flex-col md:flex-row w-full' // ensure full width for the parent container
}`}>
  <div 
    className={`${
      bannerField?.position === 'top'
        ? 'h-[350px] w-full relative'
        : "flex-1 h-100 border-bottom border-md-0 border-md-end border-secondary position-relative" // make this element flexible
    } relative`}
    onClick={() => bannerField && setActiveField(bannerField.id)}
  >
    <button 
      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
      onClick={(e) => {
        e.stopPropagation();
        deleteField(bannerField.id);
      }}
    >
      <Icons.Delete />
    </button>
    <div className={`bg-gray-50 border-2 border-dashed ${formState.activeField === bannerField?.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'} rounded-md p-6 flex flex-col items-center justify-center h-full cursor-pointer relative`}>
      {bannerField?.bannerUrl ? (
        <div className="w-full h-full absolute inset-0">
          <img 
            src={bannerField.bannerUrl} 
            alt="Banner" 
            className="w-full h-full object-fill rounded-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <button className="px-4 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Change Banner
            </button>
          </div>
        </div>
      ) : (
        <>
          <Icons.BannerUpload />
          <p className="mt-2 text-sm text-gray-500">Upload event banner</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
          <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Upload Banner
          </button>
        </>
      )}
    </div>
  </div>

  <div className={`${
    bannerField?.position === 'top'
      ? 'h-[350px] w-full relative'
      : 'flex-1 h-100 overflow-auto position-relative' // make this flexible as well
  } p-4`}>
    <div 
      id="formCanvas" 
      ref={formCanvasRef}
      className="grid grid-cols-2 gap-4 w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {formState.fields.filter(field => field.type !== 'bannerUpload').map((field, index) => (
        <div 
          key={field.id} 
          className={`form-field-container ${field.gridColumn === 'half' ? 'col-span-1' : 'col-span-2'} w-full`}
        >
          <div 
            className={`form-component bg-white border border-gray-200 hover:border-primary-400 rounded-lg p-4 shadow-sm w-full ${
              formState.activeField === field.id ? 'border-primary-500 ring-2 ring-primary-200' : ''
            }`}
            onClick={() => setActiveField(field.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <label className={`${(field.label === 'Mobile Number') && 'hidden'} block text-sm font-medium text-gray-700`}>{(field.label || `Untitled ${field.type}`)}</label>
                {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFieldUp(index);
                  }}
                  disabled={index === 0}
                >
                  <Icons.MoveUp />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFieldDown(index);
                  }}
                  disabled={index === formState.fields.length - 1}
                >
                  <Icons.MoveDown />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteField(field.id);
                  }}
                >
                  <Icons.Delete />
                </button>
              </div>
            </div>

            <FormComponents field={field} isPreview={false} onCheckboxChange={onCheckboxChange} />
          </div>
        </div>
      ))}
      <div 
        id="dropPlaceholder" 
        ref={dropPlaceholderRef}
        className="hidden border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 col-span-2"
      >
        Drop component here
      </div>
      {formState.fields.length > 0 && (
        <div className="form-component bg-white border border-gray-200 hover:border-primary-400 rounded-lg p-4 shadow-sm col-span-2">
          <div className="flex justify-end">
            <button 
              type="button" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Submit Form
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

          </div>
        ) 
: (
          <div 
            id="formCanvas" 
            ref={formCanvasRef}
            className="grid grid-cols-2 gap-4 bg-white rounded-lg shadow-sm p-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {formState.fields.map((field, index) => (
              <div 
                key={field.id} 
                className={`form-field-container ${field.gridColumn === 'half' ? 'col-span-1' : 'col-span-2'} w-full`}
              >
                <div 
                  className={`form-component bg-white border border-gray-200 hover:border-primary-400 rounded-lg p-4 shadow-sm w-full ${
                    formState.activeField === field.id ? 'border-primary-500 ring-2 ring-primary-200' : ''
                  }`}
                  onClick={() => setActiveField(field.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{field.label || `Untitled ${field.type}`}</label>
                      {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFieldUp(index);
                        }}
                        disabled={index === 0}
                      >
                        <Icons.MoveUp />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFieldDown(index);
                        }}
                        disabled={index === formState.fields.length - 1}
                      >
                        <Icons.MoveDown />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </div>

                  <FormComponents field={field} isPreview={false} />
                </div>
              </div>
            ))}

            {/* Drop Zone Placeholder */}
            <div 
              id="dropPlaceholder" 
              ref={dropPlaceholderRef}
              className="hidden border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 col-span-2"
            >
              Drop component here
            </div>

            {/* Form Submit Button */}
            {formState.fields.length > 0 && (
              <div className="form-component bg-white border border-gray-200 hover:border-primary-400 rounded-lg p-4 shadow-sm col-span-2">
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-gray rounded-md shadow-sm text-sm font-medium bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Submit Form
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCanvas;