import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FormComponents from '@/components/form-builder/FormComponents';
import { Icons } from '@/components/ui/ui-icons';

const PublicForm = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [formValues, setFormValues] = useState({});
  
  // Load form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public-forms/${id}`);
        
        if (!response.ok) {
          throw new Error('Form not found or not published');
        }
        
        const data = await response.json();
        setForm(data);
      } catch (error) {
        setError(error.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchForm();
    }
  }, [id]);
  
  // Handle form value changes
  const handleFormValueChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Check required fields
      const requiredFieldsMissing = form.schema.fields
        .filter(field => field.required)
        .some(field => !formValues[field.id] && formValues[field.id] !== false);
      if (requiredFieldsMissing) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      // Prepare form data for submission with file uploads
      const formData = new FormData();
      // Add submission metadata
      formData.append('formId', id);
      // Process each form value
      Object.entries(formValues).forEach(([fieldId, value]) => {
        // Check if this is a file upload
        if (value && value.file instanceof File) {
          // For file uploads, append the file
          formData.append(`files[${fieldId}]`, value.file);
          // Also include file metadata as JSON
          formData.append(`fileData[${fieldId}]`, JSON.stringify({
            fieldId,
            fileName: value.fileName
          }));
        } else {
          // For normal form values, append as JSON string
          formData.append(`data[${fieldId}]`, JSON.stringify(value));
        }
      });
      // Submit the form with multipart/form-data
      const response = await fetch(`/api/forms/${id}/submit`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let the browser set it with boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      
      // Show success message
      setSubmissionSuccess(true);
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
      });
      
      // Reset form values
      setFormValues({});
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit form',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-500">Loading form...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Icons.Success />
            </div>
            <CardTitle className="text-center">Form Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for your submission!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              Your response has been recorded successfully.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Submit Another Response</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Check if we have a banner component
  const hasBannerComponent = form?.schema.fields.some(field => field.type === 'bannerUpload');
  const bannerField = form?.schema.fields.find(field => field.type === 'bannerUpload');
  const regularFields = form?.schema.fields.filter(field => field.type !== 'bannerUpload') || [];
  
  return (
    <div className="min-h-screen bg-gray-50 py-2 px-2 sm:px-6 lg:px-8">
      <div className="max-w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-30px)]">
          {hasBannerComponent ? (
            // Banner-enabled form layout (2-column)
            <div className="bg-white rounded-lg shadow-sm mb-6">
{/*               <div className={`${bannerField?.position === 'top' ? 'w-full flex-col px-5 py-3' : 'w-full'} flex h-full relative`}> */}
              <div className={`${bannerField?.position === 'top' ? 'w-full flex-col px-5 py-3' : 'w-full flex-col md:flex-row'} flex h-full relative`}> 
              {/* Banner Upload Area (Left side) */}
                <div 
                  className={`${
                    bannerField?.position === 'top' ? 'h-[calc(100vh-25px)] w-full' : 'h-full md:w-1/2'
                  } relative`} 
                  style={{ height: 'calc(100vh - 25px)' }} // Banner height 25px less than screen height
                >
                  {(bannerField?.bannerUrl || formValues[bannerField?.id]?.preview) ? (
                    <div className="w-full h-full">
                      <img 
                        src={formValues[bannerField?.id]?.preview || bannerField.bannerUrl} 
                        alt="Banner Preview" 
                        className="w-full h-full object-fill p-2"
                      />
                    </div>
                  ) : (
                    <>
                      <Icons.BannerUpload />
                      <p className="mt-2 text-sm text-gray-500">{bannerField?.label || 'Upload event banner'}</p>
                      <p className="text-xs text-gray-400 mt-1">{bannerField?.helperText || 'PNG, JPG, GIF up to 10MB'}</p>
                      <label className="mt-4 cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Upload Banner
                        <input 
                          type="file" 
                          className="sr-only" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setFormValues(prev => ({
                                    ...prev,
                                    [bannerField.id]: {
                                      file: file,
                                      fileName: file.name,
                                      preview: event.target.result
                                    }
                                  }));
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
                {/* Form Fields (Right side) */}
                <div className={`space-y-6 p-4 ${bannerField.position === 'top' ? 'w-full' : 'md:w-1/2'}`} style={{ overflowY: 'auto', height: 'calc(100vh - 25px)' }}>
                  <Card className="mb-4 border-none shadow-none">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap w-full">
                        <div className="flex gap-2 ml-auto">
                          <button 
                            type="button"
                            className="border border-gray-300 text-gray-700 text-sm rounded-full flex items-center px-4 py-2 hover:bg-gray-100 transition"
                            onClick={() => {
    const url = `${window.location.origin}/public-form/${form._id}`;

    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({ title: 'Success', description: 'Form URL copied to clipboard!' });
        })
        .catch(() => {
          fallbackCopy(url);
        });
    } else {
      // Use fallback if navigator.clipboard is not available
      fallbackCopy(url);
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({ title: 'Success', description: 'Form URL copied to clipboard!' });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to copy URL' });
      }
      document.body.removeChild(textarea);
    }
  }}
                          >
                            <Icons.Copy className="mr-2 h-4 w-4" />
                          </button>
                          <button 
                            type="button"
                            className="border border-green-500 text-green-700 text-sm rounded-full flex items-center px-4 py-2 hover:bg-green-100 transition"
                            onClick={() => {
                              const url = `${window.location.origin}/public-form/${form._id}`;
                              const whatsappLink = `https://wa.me/?text=${encodeURIComponent(url)}`;
                              window.open(whatsappLink, '_blank');
                            }}
                          >
                            <Icons.Share className="mr-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-center mx-auto flex-1">
                          {form?.name || 'Untitled Form'}
                        </h2>
                      {form?.description && (
                        <CardDescription className="text-center mt-2 text-sm text-gray-500 text-center">
                          {form.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                  {regularFields.map(field => (
                    <div key={field.id} className={`form-field px-3 ${field.gridColumn === 'half' ? 'md:w-1/2 md:pr-3 md:inline-block' : 'w-full'}`}>
                      {!field.hideLabel && (
                        <>
                          <label className={`${((field.label === 'Mobile Number') || (field.label === 'Resume Upload') || (field.type === 'checkbox')) && 'hidden'} block text-sm font-medium text-gray-700`}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.helperText && <p className="text-xs text-gray-500 mb-2">{field.helperText}</p>}
                        </>
                      )}
    <FormComponents 
      field={{
        ...field,
        value: formValues[field.id] !== undefined ? formValues[field.id] : field.value
      }} 
      isPreview={true} 
      onChange={handleFormValueChange}
    />
                    </div>
                  ))}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Standard form layout (single column)
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Card className="mb-4 border-none shadow-none">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap w-full">
                        <div className="flex gap-2 ml-auto">
                          <button 
                            type="button"
                            className="border border-gray-300 text-gray-700 text-sm rounded-full flex items-center px-4 py-2 hover:bg-gray-100 transition"
                            onClick={() => {
                              const url = `${window.location.origin}/public-form/${form._id}`;
                            
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(url)
                                  .then(() => {
                                    toast({ title: 'Success', description: 'Form URL copied to clipboard!' });
                                  })
                                  .catch(() => {
                                    toast({ title: 'Error', description: 'Clipboard write failed' });
                                  });
                              } else {
                                // fallback method for HTTP or unsupported browsers
                                const textarea = document.createElement('textarea');
                                textarea.value = url;
                                textarea.style.position = 'fixed';
                                document.body.appendChild(textarea);
                                textarea.focus();
                                textarea.select();
                            
                                try {
                                  const successful = document.execCommand('copy');
                                  if (successful) {
                                    toast({ title: 'Success', description: 'Form URL copied to clipboard!' });
                                  } else {
                                    toast({ title: 'Error', description: 'Clipboard fallback failed' });
                                  }
                                } catch (err) {
                                  toast({ title: 'Error', description: 'Clipboard fallback failed' });
                                }
                            
                                document.body.removeChild(textarea);
                              }
                            }}    
                          >
                            <Icons.Copy className="mr-2 h-4 w-4" />
                          </button>
                          <button 
                            type="button"
                            className="border border-green-500 text-green-700 text-sm rounded-full flex items-center px-4 py-2 hover:bg-green-100 transition"
                            onClick={() => {
                              const url = `${window.location.origin}/public-form/${form._id}`;
                              const whatsappLink = `https://wa.me/?text=${encodeURIComponent(url)}`;
                              window.open(whatsappLink, '_blank');
                            }}
                          >
                            <Icons.Share className="mr-2 h-4 w-4" />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                      <h2 className="text-lg font-semibold mx-auto flex-1">
                          {form?.name || 'Untitled Form'}
                        </h2>
                      {form?.description && (
                        <CardDescription className="mt-2 text-sm text-gray-500 text-center">
                          {form.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                  {regularFields.map(field => (
                    <div key={field.id} className={`form-field ${field.gridColumn === 'half' ? 'md:w-1/2 md:pr-3 md:inline-block' : 'w-full'}`}>
                      {!field.hideLabel && (
                        <>
                          <label className={`${((field.label === 'Mobile Number') || (field.type === 'checkbox')) && 'hidden'} block text-sm font-medium text-gray-700`}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.helperText && <p className="text-xs text-gray-500 mb-2">{field.helperText}</p>}
                        </>
                      )}
                      <FormComponents 
                        field={field} 
                        isPreview={true} 
                        onChange={handleFormValueChange}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Form'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicForm;
