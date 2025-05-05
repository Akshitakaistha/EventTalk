import { apiRequest } from './queryClient';
import { useToast } from '../hooks/use-toast';

/**
 * API utilities for the EventTalk application
 */

// Auth API calls
export const loginUser = async (username, password) => {
  try {
    const response = await apiRequest('POST', '/api/auth/login', {
      username,
      password
    });
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await apiRequest('POST', '/api/auth/register', {
      username,
      email,
      password
    });
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Form API calls
export const createForm = async (formData) => {
  try {
    const response = await apiRequest('POST', '/api/forms', formData);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to create form');
  }
};

export const updateForm = async (formId, formData) => {
  try {
    const response = await apiRequest('PUT', `/api/forms/${formId}`, formData);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to update form');
  }
};

export const publishForm = async (formId) => {
  try {
    const response = await apiRequest('POST', `/api/forms/${formId}/publish`);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to publish form');
  }
};

export const deleteForm = async (formId) => {
  try {
    await apiRequest('DELETE', `/api/forms/${formId}`);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete form');
  }
};

// Form submission API calls
export const submitForm = async (formId, formData) => {
  try {
    // If formData contains files or is not FormData, convert to FormData
    let dataToSend;
    if (formData instanceof FormData) {
      dataToSend = formData;
    } else {
      dataToSend = new FormData();
      // Append all keys from formData object to FormData
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          const value = formData[key];
          if (Array.isArray(value)) {
            // Append array values individually
            value.forEach((item) => {
              dataToSend.append(key, item);
            });
          } else {
            dataToSend.append(key, value);
          }
        }
      }
    }

    const response = await apiRequest('POST', `/api/forms/${formId}/submit`, dataToSend);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to submit form');
  }
};

export const getSubmissionsByForm = async (formId) => {
  try {
    const response = await apiRequest('GET', `/api/forms/${formId}/submissions`);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch submissions');
  }
};

export const deleteSubmission = async (submissionId) => {
  try {
    await apiRequest('DELETE', `/api/submissions/${submissionId}`);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete submission');
  }
};

// User management API calls
export const createAdminUser = async (userData) => {
  try {
    const response = await apiRequest('POST', '/api/users/admin', userData);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to create admin user');
  }
};

export const deleteUser = async (userId) => {
  try {
    await apiRequest('DELETE', `/api/users/${userId}`);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete user');
  }
};

// File upload API call
export const uploadFile = async (file, submissionId, fieldId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('submissionId', submissionId);
    formData.append('fieldId', fieldId);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to upload file');
  }
};

// Helper hook for API operations with toast feedback
export const useApiWithToast = () => {
  const { toast } = useToast();
  
  const callApiWithToast = async (
    apiFunc, 
    params = [], 
    successMessage = 'Operation successful', 
    errorMessage = 'Operation failed'
  ) => {
    try {
      const result = await apiFunc(...params);
      toast({
        title: 'Success',
        description: successMessage
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || errorMessage,
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  return { callApiWithToast };
};
