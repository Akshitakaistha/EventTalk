

import React, { useState, useRef } from 'react';
import FormComponents from '@/components/form-builder/FormComponents';
import { Icons } from '@/components/ui/ui-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormBuilder } from '@/contexts/FormBuilderContext';
import ImageCarousel from '@/components/ui/image-carousel';

const PreviewModal = ({ onClose, formFields, formName }) => {
  const { formState } = useFormBuilder();
  const [formValues, setFormValues] = useState({});
  const [dragActive, setDragActive] = useState({});
  
  // Create refs for file inputs
  const fileInputRefs = useRef({});
  
  // Function to trigger file input click
  const triggerFileInput = (fieldId) => {
    console.log("Triggering file input for field:", fieldId);
    if (fileInputRefs.current[fieldId]) {
      console.log("File input ref found, clicking...");
      fileInputRefs.current[fieldId].click();
    } else {
      console.error(`File input ref not found for field: ${fieldId}`);
    }
  };
  
  // Handle file drop
  const handleDrop = (e, fieldId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({...dragActive, [fieldId]: false});
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileData = {
            file: file,
            fileName: file.name,
            fileType: file.type,
            previewUrl: URL.createObjectURL(file),
            dataUrl: event.target.result
          };
          
          console.log("Dropped file successfully processed:", file.name);
          handleFormValueChange(fieldId, fileData);
        }
      };
      
      reader.onerror = () => {
        console.error("Error reading dropped file:", file.name);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle drag events
  const handleDrag = (e, fieldId, isDragActive) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragActive !== undefined) {
      setDragActive({...dragActive, [fieldId]: isDragActive});
    }
  };
  
  const handleFormValueChange = (fieldId, value) => {
    console.log("Value changed for field:", fieldId, value);
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted successfully in preview mode!');
  };
  
  // Check if we have banner, PDF, or carousel components
  const hasBannerComponent = formFields.some(field => field.type === 'bannerUpload');
  const hasPdfComponent = formFields.some(field => field.type === 'pdfUpload');
  const hasCarouselComponent = formFields.some(field => field.type === 'carouselUpload');
  const bannerField = formFields.find(field => field.type === 'bannerUpload');
  const pdfField = formFields.find(field => field.type === 'pdfUpload');
  const carouselField = formFields.find(field => field.type === 'carouselUpload');
  const regularFields = formFields.filter(field => field.type !== 'bannerUpload' && field.type !== 'pdfUpload' && field.type !== 'carouselUpload');

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative mt-3">
        {/* Header bar */}
        <button 
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center px-3 me-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Icons.X className="h-5 w-5 mr-1" />
            Close Preview
          </button>
        {/* Main section */}
      <div className="w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg w-full border border-gray-200" style={{ overflow:'auto' }}>
        {(bannerField?.position === 'top' || pdfField?.position === 'top' || carouselField?.position === 'top') && (
            <Card className="mb-4 border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-center">Form Preview: {formName} </CardTitle>
                      {formState.description && (
                        <CardDescription className="text-center">Form Description: {formState.description}</CardDescription>
                      )}
                   </CardHeader>
                  </Card>
                  )}  
          <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
            {hasBannerComponent || hasPdfComponent || hasCarouselComponent ? (
              <div className={`${(bannerField?.position === 'top' || pdfField?.position === 'top' || carouselField?.position === 'top') ? 'w-full flex-col px-5 py-3' : 'w-full'} flex h-full relative`}>
              {/* Special Component Display Area (Banner or PDF) */}
              <div 
                className={`${
                  (bannerField?.position === 'top' || pdfField?.position === 'top' || carouselField?.position === 'top') ? 'h-[calc(100vh-25px)] w-full' : 'h-full md:w-1/2'
                } relative`} 
                style={{ height: 'calc(100vh - 25px)' }} // Component height 25px less than screen height
              >
                  {/* Banner Component Display */}
                  {bannerField && (bannerField?.bannerUrl || formValues[bannerField?.id]?.preview) ? (
                    <div className="w-full h-full">
                      <img 
                        src={formValues[bannerField?.id]?.preview || bannerField.bannerUrl} 
                        alt="Form Banner" 
                        className="w-full h-full object-fill px-3 py-2"
                      />
                      {bannerField?.canUpload && (
                        <div className="absolute bottom-0 right-0 m-4">
                          <input
                            type="button"
                            value="Change Banner"
                            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 bg-opacity-90"
                            onClick={(e) => {
                              e.preventDefault();
                              const fileInput = document.getElementById(`change-banner-${bannerField.id}`);
                              if (fileInput) {
                                fileInput.click();
                              } else {
                                console.error(`Could not find file input with id change-banner-${bannerField.id}`);
                              }
                            }}
                          />
                          <input 
                            id={`change-banner-${bannerField.id}`}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    const fileData = {
                                      file: file,
                                      fileName: file.name,
                                      fileType: file.type,
                                      preview: event.target.result,
                                      dataUrl: event.target.result
                                    };
                                    handleFormValueChange(bannerField.id, fileData);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  ) : bannerField && !bannerField?.bannerUrl && !formValues[bannerField?.id]?.preview ? (
                    <div className="bg-gray-50 border-b md:border-r border-gray-200 h-full p-6 flex flex-col items-center justify-center">
                    <Icons.BannerUpload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">{bannerField?.label || 'Event Banner'}</p>
                    <p className="text-xs text-gray-400 mt-1">{bannerField?.helperText || 'This form includes a banner image'}</p>
                    <div className="mt-4">
                      <input 
                        type="button"
                        value="Upload Banner"
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        onClick={(e) => {
                          e.preventDefault();
                          const fileInput = document.getElementById(`upload-banner-${bannerField.id}`);
                          if (fileInput) {
                            fileInput.click();
                          } else {
                            console.error(`Could not find file input with id upload-banner-${bannerField.id}`);
                          }
                        }}
                      />
                      <input 
                        id={`upload-banner-${bannerField.id}`}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log("Banner file selected:", file.name);
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                const fileData = {
                                  file: file,
                                  fileName: file.name,
                                  fileType: file.type,
                                  preview: event.target.result,
                                  dataUrl: event.target.result
                                };                               
                                console.log("Banner file successfully processed:", file.name);
                                handleFormValueChange(bannerField.id, fileData);
                              }
                            };
                            
                            reader.onerror = () => {
                              console.error("Error reading banner file:", file.name);
                            };
                            
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                
                {/* PDF Component Display */}
                {pdfField && (pdfField?.pdfUrl || formValues[pdfField?.id]?.preview) ? (
                  <div className="w-full h-full">
                    <iframe 
                      src={formValues[pdfField?.id]?.preview || pdfField.pdfUrl} 
                      title="PDF Preview" 
                      className="w-full h-full border-0 rounded-md"
                      style={{ minHeight: 'calc(100vh - 25px)' }}
                    />
                    {pdfField?.canUpload && (
                      <div className="absolute bottom-0 right-0 m-4">
                        <input
                          type="button"
                          value="Change PDF"
                          className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 bg-opacity-90"
                          onClick={(e) => {
                            e.preventDefault();
                            const fileInput = document.getElementById(`change-pdf-${pdfField.id}`);
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error(`Could not find file input with id change-pdf-${pdfField.id}`);
                            }
                          }}
                        />
                        <input 
                          id={`change-pdf-${pdfField.id}`}
                          type="file" 
                          className="hidden" 
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  const fileData = {
                                    file: file,
                                    fileName: file.name,
                                    fileType: file.type,
                                    preview: event.target.result,
                                    dataUrl: event.target.result
                                  };
                                  handleFormValueChange(pdfField.id, fileData);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </div>
                    )}
                  </div>
                ) : pdfField && !pdfField?.pdfUrl && !formValues[pdfField?.id]?.preview ? (
                  <div className="bg-gray-50 border-b md:border-r border-gray-200 h-full p-6 flex flex-col items-center justify-center">
                    <Icons.PdfUpload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">{pdfField?.label || 'PDF Document'}</p>
                    <p className="text-xs text-gray-400 mt-1">{pdfField?.helperText || 'This form includes a PDF document'}</p>
                    <div className="mt-4">
                      <input 
                        type="button"
                        value="Upload PDF"
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        onClick={(e) => {
                          e.preventDefault();
                          const fileInput = document.getElementById(`upload-pdf-${pdfField.id}`);
                          if (fileInput) {
                            fileInput.click();
                          } else {
                            console.error(`Could not find file input with id upload-pdf-${pdfField.id}`);
                          }
                        }}
                      />
                      <input 
                        id={`upload-pdf-${pdfField.id}`}
                        type="file" 
                        className="hidden" 
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                const fileData = {
                                  file: file,
                                  fileName: file.name,
                                  fileType: file.type,
                                  preview: event.target.result,
                                  dataUrl: event.target.result
                                };
                                handleFormValueChange(pdfField.id, fileData);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </div>
                  </div>
                ) : null}
                
                {/* Carousel Component Display */}
                {carouselField && carouselField.images && carouselField.images.length > 0 ? (
                  <div className="w-full h-full">
                    <ImageCarousel 
                      images={carouselField.images}
                      autoAdvanceTime={carouselField.autoAdvanceTime || 20000}
                      showDots={carouselField.showDots !== false}
                      maxImages={carouselField.maxImages || 8}
                      className="w-full h-full"
                    />
                  </div>
                ) : carouselField && (!carouselField.images || carouselField.images.length === 0) ? (
                  <div className="bg-gray-50 border-b md:border-r border-gray-200 h-full p-6 flex flex-col items-center justify-center">
                    <Icons.CarouselUpload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">{carouselField?.label || 'Image Carousel'}</p>
                    <p className="text-xs text-gray-400 mt-1">{carouselField?.helperText || 'This form includes an image carousel'}</p>
                    <div className="mt-4">
                      <input 
                        type="button"
                        value="Upload Images"
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        onClick={(e) => {
                          e.preventDefault();
                          const fileInput = document.getElementById(`upload-carousel-${carouselField.id}`);
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      />
                      <input 
                        id={`upload-carousel-${carouselField.id}`}
                        type="file" 
                        className="hidden" 
                        accept="image/png"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            files.forEach(file => {
                              if (file.type === 'image/png' && file.size <= 5 * 1024 * 1024) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const newImage = {
                                    src: event.target.result,
                                    preview: event.target.result,
                                    dataUrl: event.target.result,
                                    fileName: file.name,
                                    fileType: file.type,
                                    alt: `Carousel image`
                                  };
                                  handleFormValueChange(carouselField.id, newImage);
                                };
                                reader.readAsDataURL(file);
                              }
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
      
              <div className={`space-y-6 p-4 ${(bannerField?.position === 'top' || pdfField?.position === 'top' || carouselField?.position === 'top') ? 'w-full' : 'md:w-1/2'}`} style={{ overflowY: 'auto', height: 'calc(100vh - 25px)' }}>
                  {(bannerField?.position !== 'top' && pdfField?.position !== 'top' && carouselField?.position !== 'top') && (
                        <Card className="mb-4 border-none shadow-none">
                        <CardHeader>
                          <CardTitle className="text-center">Form Preview: {formName} </CardTitle>
                          {formState.description && (
                            <CardDescription className="text-center">Form Description: {formState.description}</CardDescription>
                          )}
                          </CardHeader>
                    </Card>
                  )}                     
                  {regularFields.map(field => (
                    <div key={field.id} className={`form-field ${field.gridColumn === 'half' ? 'md:w-1/2 md:pr-3 md:inline-block' : 'w-full'}`}>
                      {!field.hideLabel && (
                        <>
                          <label className={`${((field.label === 'Mobile Number') || (field.label === 'Resume Upload') || (field.type === 'checkbox') || (field.type === 'toggle')) && 'hidden' } block text-sm font-medium text-gray-700 mb-1`}>{field.label || `Untitled ${field.type}`}</label>
                          {field.helperText && <p className="text-xs text-gray-500 mb-1">{field.helperText}</p>}
                        </>
                      )}
                      {field.type === 'fileUpload' || field.type === 'mediaUpload' ? (
                        <div 
                          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive[field.id] ? 'border-primary-400 bg-primary-50' : 'border-gray-300'} border-dashed rounded-md`}
                          onDragEnter={(e) => handleDrag(e, field.id, true)}
                          onDragLeave={(e) => handleDrag(e, field.id, false)}
                          onDragOver={(e) => handleDrag(e, field.id)}
                          onDrop={(e) => handleDrop(e, field.id)}
                        >
                          <div className="space-y-1 text-center w-full">
                            {formValues[field.id]?.fileName ? (
                              <div className="flex flex-col items-center">
                                {field.type === 'mediaUpload' && formValues[field.id]?.fileType ? (
                                  <>
                                    {formValues[field.id]?.fileType.startsWith('video/') ? (
                                      <video 
                                        controls 
                                        className="max-w-full h-auto max-h-[200px] mb-2 border rounded"
                                        src={formValues[field.id]?.previewUrl || formValues[field.id]?.dataUrl}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : formValues[field.id]?.fileType.startsWith('audio/') ? (
                                      <audio 
                                        controls 
                                        className="max-w-full mb-2"
                                        src={formValues[field.id]?.previewUrl || formValues[field.id]?.dataUrl}
                                      >
                                        Your browser does not support the audio tag.
                                      </audio>
                                    ) : (
                                      <div className="my-3 p-2 border rounded bg-gray-50 flex items-center max-w-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                          {formValues[field.id]?.fileName || 'Uploaded media'}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="my-3 p-2 border rounded bg-gray-50 flex items-center max-w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                      {formValues[field.id]?.fileName || 'Uploaded file'}
                                    </span>
                                  </div>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => handleFormValueChange(field.id, null)}
                                  className="text-xs text-red-600 hover:text-red-800 underline"
                                >
                                  Remove {field.type === 'mediaUpload' ? 'media' : 'file'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div className="flex flex-col text-sm text-gray-600 justify-center">
                                  <button 
                                    type="button"
                                    className="cursor-pointer mx-auto mb-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => triggerFileInput(field.id)}
                                  >
                                    {field.type === 'mediaUpload' ? 'Select media file' : 'Select a file'}
                                  </button>
                                  <input 
                                    ref={el => fileInputRefs.current[field.id] = el}
                                    type="file" 
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        console.log("File selected in preview modal:", file.name);
                                        
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            const fileData = {
                                              file: file,
                                              fileName: file.name,
                                              fileType: file.type,
                                              previewUrl: URL.createObjectURL(file),
                                              dataUrl: event.target.result
                                            };
                                            
                                            console.log("File successfully processed in modal:", file.name);
                                            handleFormValueChange(field.id, fileData);
                                          }
                                        };
                                        
                                        reader.onerror = () => {
                                          console.error("Error reading file in modal:", file.name);
                                        };
                                        
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    accept={field.allowedTypes || (field.type === 'mediaUpload' ? "audio/*,video/*" : "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                                  />
                                  <p className="text-sm text-center text-gray-500">or drag and drop your file here</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {field.fileTypeText || field.mediaTypeText || (field.type === 'mediaUpload' ? 'MP3, WAV, MP4, MOV up to 10MB' : 'PNG, JPG, PDF, DOC up to 10MB')}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <FormComponents 
                          field={{
                            ...field,
                            value: formValues[field.id] !== undefined ? formValues[field.id] : field.defaultValue
                          }} 
                          isPreview={true} 
                          onChange={handleFormValueChange}
                        />
                      )}
                    </div>
                  ))}
                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full px-4 py-3 border border-black rounded-md shadow-sm text-white font-medium bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Submit Form
                    </button>
                  </div>
                
              </div>
            </div>
            )

                    : (
                      <div className="p-6">
                        <Card className="mb-4 border-none shadow-none">
                            <CardHeader>
                              <CardTitle className="text-center">Form Preview: {formName} </CardTitle>
                              {formState.description && (
                                <CardDescription className="text-center">Form Description: {formState.description}</CardDescription>
                              )}
                              </CardHeader>
                              </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {formFields.map(field => (
                            <div key={field.id} className={field.gridColumn === 'half' ? 'col-span-1' : 'col-span-2'}>
                              {!field.hideLabel && (
                                <>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label || `Untitled ${field.type}`}</label>
                                  {field.helperText && <p className="text-xs text-gray-500 mb-1">{field.helperText}</p>}
                                </>
                              )}
                              {field.type === 'fileUpload' || field.type === 'mediaUpload' ? (
                                <div 
                                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive[field.id] ? 'border-primary-400 bg-primary-50' : 'border-gray-300'} border-dashed rounded-md`}
                                  onDragEnter={(e) => handleDrag(e, field.id, true)}
                                  onDragLeave={(e) => handleDrag(e, field.id, false)}
                                  onDragOver={(e) => handleDrag(e, field.id)}
                                  onDrop={(e) => handleDrop(e, field.id)}
                                >
                                  <div className="space-y-1 text-center w-full">
                                    {formValues[field.id]?.fileName ? (
                                      <div className="flex flex-col items-center">
                                        {field.type === 'mediaUpload' && formValues[field.id]?.fileType ? (
                                          <>
                                            {formValues[field.id]?.fileType.startsWith('video/') ? (
                                              <video 
                                                controls 
                                                className="max-w-full h-auto max-h-[200px] mb-2 border rounded"
                                                src={formValues[field.id]?.previewUrl || formValues[field.id]?.dataUrl}
                                              >
                                                Your browser does not support the video tag.
                                              </video>
                                            ) : formValues[field.id]?.fileType.startsWith('audio/') ? (
                                              <audio 
                                                controls 
                                                className="max-w-full mb-2"
                                                src={formValues[field.id]?.previewUrl || formValues[field.id]?.dataUrl}
                                              >
                                                Your browser does not support the audio tag.
                                              </audio>
                                            ) : (
                                              <div className="my-3 p-2 border rounded bg-gray-50 flex items-center max-w-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                                  {formValues[field.id]?.fileName || 'Uploaded media'}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="my-3 p-2 border rounded bg-gray-50 flex items-center max-w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                              {formValues[field.id]?.fileName || 'Uploaded file'}
                                            </span>
                                          </div>
                                        )}
                                        
                                        <button
                                          type="button"
                                          onClick={() => handleFormValueChange(field.id, null)}
                                          className="text-xs text-red-600 hover:text-red-800 underline"
                                        >
                                          Remove {field.type === 'mediaUpload' ? 'media' : 'file'}
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <div className="flex flex-col text-sm text-gray-600 justify-center">
                                          <button 
                                            type="button"
                                            className="cursor-pointer mx-auto mb-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            onClick={() => triggerFileInput(field.id)}
                                          >
                                            {field.type === 'mediaUpload' ? 'Select media file' : 'Select a file'}
                                          </button>
                                          <input 
                                            ref={el => fileInputRefs.current[field.id] = el}
                                            type="file" 
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                console.log("File selected in preview modal:", file.name);
                                                
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                  if (event.target?.result) {
                                                    const fileData = {
                                                      file: file,
                                                      fileName: file.name,
                                                      fileType: file.type,
                                                      previewUrl: URL.createObjectURL(file),
                                                      dataUrl: event.target.result
                                                    };
                                                    
                                                    console.log("File successfully processed in modal:", file.name);
                                                    handleFormValueChange(field.id, fileData);
                                                  }
                                                };
                                                
                                                reader.onerror = () => {
                                                  console.error("Error reading file in modal:", file.name);
                                                };
                                                
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                            accept={field.allowedTypes || (field.type === 'mediaUpload' ? "audio/*,video/*" : "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                                          />
                                          <p className="text-sm text-center text-gray-500">or drag and drop your file here</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          {field.fileTypeText || field.mediaTypeText || (field.type === 'mediaUpload' ? 'MP3, WAV, MP4, MOV up to 10MB' : 'PNG, JPG, PDF, DOC up to 10MB')}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <FormComponents 
                                  field={{
                                    ...field,
                                    value: formValues[field.id] !== undefined ? formValues[field.id] : field.defaultValue
                                  }} 
                                  isPreview={true} 
                                  onChange={handleFormValueChange}
                                />
                              )}
                            </div>
                          ))}
                          
                          {/* Form submit button */}
                          <div className="pt-6 col-span-2">
                            <button
                              type="submit"
                              className="w-full px-4 py-3 border border-black rounded-md shadow-sm text-white font-medium bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Submit Form
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;

