import {useState} from "react";
import { Link} from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/ui-icons';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
// Child component
import Sidebar from '@/components/sidebar/Sidebar'; 
import { SERVER_URL } from "../App";

const IndividualFormList = ({ formId }) => {
     const { toast } = useToast();
     const [hoverRow, setHoverRow] = useState(null);
     const [confirmDelete, setConfirmDelete] = useState(null);
     const [searchQuery, setSearchQuery] = useState('');
     const queryClient = useQueryClient();

     const thStyle = {
        textAlign: 'left',
        padding: '12px 16px',
        fontWeight: '600',
        fontSize: '14px',
        color: '#333',
        backgroundColor: '#fafafa',
      };
      
      const tdStyle = {
        padding: '12px 16px',
        fontSize: '14px',
        color: '#555',
        borderBottom: '1px solid #eee',
      };
      
      const btnStyle = {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
      };
      
     // Fetch form details if formId is provided
      const { data: form, isLoading: formLoading } = useQuery({
        queryKey: [`/api/forms/${formId}`],
        enabled: !!formId,
      });

    // Fetch submissions
    const { data: submissions, isLoading: submissionsLoading, isError, refetch } = useQuery({
        queryKey: [formId ? `/api/forms/${formId}/submissions` : '/api/submissions'],
        enabled: true,
        refetchOnWindowFocus: true,
    });

    const deleteMutation = useMutation({
        mutationFn: async (submissionId) => {
        await apiRequest('DELETE', `/api/submissions/${submissionId}`);
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [formId ? `/api/forms/${formId}/submissions` : '/api/submissions'] });
        toast({
            title: 'Success',
            description: 'Response deleted successfully',
        });
        setConfirmDelete(null);
        },
        onError: (error) => {
        toast({
            title: 'Error',
            description: error.message || 'Failed to delete response',
            variant: 'destructive',
        });
        },
    });

  const handleDeleteSubmission = (submissionId) => {
    deleteMutation.mutate(submissionId);
  };

    /**
     * Function is used to export the file to csv . 
     */
    const exportToCSV = () => {
        if (!submissions || submissions.length === 0) {
        toast({
            title: 'Error',
            description: 'No data to export',
            variant: 'destructive',
        });
        return;
        }
        try {
            const allKeys = new Set();
            submissions.forEach(submission => {
              if (submission.data && typeof submission.data === 'object') {
                Object.keys(submission.data).forEach(key => allKeys.add(key));
              }
            });
            const keys = Array.from(allKeys);
            const headerLabels = keys.map((key) => fieldMap[key] || key);
            const headerRow = ['ID', 'Submission Date', ...headerLabels].join(',');     
            const dataRows = submissions.map(submission => {
              const submissionDate = new Date(submission.createdAt).toLocaleString();
              const values = keys.map(key => {
                const value = submission.data[key] || '';
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
              });
              return [submission.id, submissionDate, ...values].join(',');
            });
            const csvContent = [headerRow, ...dataRows].join('\n');
        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `submissions-${formId || 'all'}-${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: 'Success',
            description: 'CSV file downloaded',
        });
        } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to export CSV',
            variant: 'destructive',
        });
        }
    };

    const fields = form?.schema?.fields || [];
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.id] = field.label;
      return acc;
    }, {});
  
    // Get all unique field IDs from form schema
    const fieldIds = fields.map((field) => field.id);

    const filteredSubmissions = submissions?.filter((submission) => {
        if (!searchQuery.trim()) return true;
      
        const lowerSearch = searchQuery.toLowerCase();
      
        return fieldIds.some((fieldId) => {
          const value = submission.data?.[fieldId];
          return value?.toString().toLowerCase().includes(lowerSearch);
        });
    });

    /**
     * Function is used to handle the form responses in the table.
     */
    function returnFormResponsesTable(){
        return (
            <div
                className="table-container"
                style={{
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'auto', 
                }}
            >
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {fieldIds.map((id) => (
                    <th key={id} style={thStyle}>{fieldMap[id]}</th>
                  ))}
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {submissions && filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission, index) => (
                      <tr
                        key={submission._id}
                        style={{
                          ...((hoverRow === index) && { backgroundColor: '#f9f9f9' }),
                          transition: 'background 0.3s',
                          cursor: 'default',
                        }}
                        onMouseEnter={() => setHoverRow(index)}
                        onMouseLeave={() => setHoverRow(null)}
                      >
                        {fieldIds.map((id) => {
                          const isFileField = submission.files?.some(file => file.fieldId === id);
                          const fileData = submission.files?.find(file => file.fieldId === id);
                          return (
                            <td key={id} style={tdStyle}>
                              {isFileField && fileData ? (
                                <button
                                  style={{ ...btnStyle, backgroundColor: '#007bff', color: '#fff' }}
                                  onClick={() => {
                                    const uploadsIndex = fileData.filePath.indexOf('/uploads/');
                                    const relativePath = uploadsIndex !== -1 ? fileData.filePath.substring(uploadsIndex + '/uploads/'.length) : fileData.filePath.split('/').pop();
                                    window.open(`${SERVER_URL}/uploads/${relativePath}`, '_blank');
                                  }}
                                >
                                  View File
                                </button>
                              ) : (
                                submission.data?.[id]?.toString().trim() || (
                                  <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                                )
                              )}
                            </td>
                          );
                        })}
                        <td style={tdStyle}>
                          <button
                            style={{ ...btnStyle, backgroundColor: '#dc3545' }}
                            onClick={() => setConfirmDelete(submission._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={fieldIds.length + 1} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>

            </table>
          </div>
        );
    }

    return (
        <>
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-auto">
                <main className="p-6 max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {formId ? 
                          (formLoading ? 'Loading...' : `Responses: ${form?.name || 'Untitled Form'}`) : 
                          'All Responses'
                        }
                      </h1>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <Button variant="outline" 
                            onClick={exportToCSV}
                            disabled={!submissions || submissions.length === 0}>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export CSV
                        </span>
                      </Button>
                      {formId && (
                        <Button variant="outline" asChild>
                          <Link href={`/forms/edit/${formId}`}>
                            <span className="flex items-center">
                              <Icons.Edit className="mr-2" />
                              Edit Form
                            </span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icons.Search />
                            </div>
                            <Input
                              type="text"
                                placeholder="Search responses..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    {returnFormResponsesTable()}
                </main>
            </div>
        </div>
          <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
             <DialogContent>
               <DialogHeader>
                    <DialogTitle>Delete Response</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this response? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteSubmission(confirmDelete)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default IndividualFormList;