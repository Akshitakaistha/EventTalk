import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/ui/ui-icons';
import Sidebar from '@/components/sidebar/Sidebar';

const FormsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Fetch all forms
  const { data: forms, isLoading, isError } = useQuery({
    queryKey: ['/api/forms'],
  });
  
  // Filter forms based on search query
  const filteredForms = forms?.filter(form => 
    form.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Delete form mutation
  const deleteMutation = useMutation({
    mutationFn: async (formId) => {
      await apiRequest('DELETE', `/api/forms/${formId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete form',
        variant: 'destructive',
      });
    },
  });
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle form delete
  const handleDeleteForm = (formId) => {
    deleteMutation.mutate(formId);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 6;

  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * formsPerPage,
    currentPage * formsPerPage
  );

  const totalPages = Math.ceil(filteredForms.length / formsPerPage);

  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile menu button */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <Icons.Menu />
        </button>
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full">
            <Sidebar isMobile={true} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
              <p className="text-gray-500">Manage your forms</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link href="/forms/new">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Form
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search />
              </div>
              <Input
                type="text"
                placeholder="Search forms..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Forms list */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-red-500 mb-4">Failed to load forms. Please try again.</p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/forms'] })}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedForms.map(form => (
        <Card key={form._id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold truncate">{form.name || 'Untitled Form'}</CardTitle>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {form.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-20 overflow-hidden text-sm text-gray-600">
            <p className="line-clamp-3">{form.description || 'No description available.'}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/forms/edit/${form._id}`}>
                <Icons.Edit className="mr-1 h-4 w-4" /> Edit
              </Link>
            </Button>
            {form.status === 'published' && (
              <>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/forms/${form._id}/responses`}>
                    <Icons.Responses className="mr-1 h-4 w-4" /> Responses
                  </Link>
                </Button>
                <Button 
                  variant="outline" size="sm" 
                  className="flex-1" 
                  onClick={() => {
                    const url = `http://139.59.22.82:4000/public-form/${form._id}`;
                  
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
                  <Icons.Copy className="mr-1 h-4 w-4" /> Copy URL
                </Button>
              </>
            )}
            <Button 
              variant="outline" size="sm"
              className="flex-1 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDelete(form._id)}
            >
              <Icons.Delete className="mr-1 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
            ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                {searchQuery ? (
                  <p className="text-gray-500 mb-4">No forms found matching your search.</p>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">You haven't created any forms yet.</p>
                    <Button asChild>
                      <Link href="/forms/new">Create your first form</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
          {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 mt-3">
                <Button 
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
          )}
        </main>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteForm(confirmDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormsList;
