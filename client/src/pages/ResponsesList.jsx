import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/ui-icons';
import Sidebar from '@/components/sidebar/Sidebar';

const ResponsesList = () => {
  const { formId } = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Fetch form details if formId is provided
  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
  });

   const { data: forms, isLoading } = useQuery({
      queryKey: ['/api/forms'],
    });

    // Fetch users
    const { data: users = [], isLoading: isLoadingUsers } = useQuery({
      queryKey: ['/api/users'],
    });
    
    // Filter forms based on search query
    const filteredForms = forms?.filter(form => 
      form.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  
  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading, isError } = useQuery({
    queryKey: [formId ? `/api/forms/${formId}/submissions` : '/api/submissions'],
    enabled: !!formId || !formId,
  });
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  /**
   * @param comparator: User either wants to get the either the name, role.
   */
  const getUserDetailById = (userId, compartor) => {
    const user = users.find((user) => user._id === userId);
    const userDetail = (compartor === 'name') ? user?.username : user?.role
    return user ? userDetail : 'Unknown';
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#fafafa'
  };
  
  const tdStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#555',
    borderBottom: '1px solid #eee'
  };
  
  const trStyle = {
    transition: 'background 0.3s',
    cursor: 'default',
    ':hover': {
      backgroundColor: '#f9f9f9'
    }
  };
  
  const btnStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background 0.3s ease'
  };

  const btnStyleDanger = {
    backgroundColor: '#c30010',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  };
  
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
              <h1 className="text-2xl font-bold text-gray-900">
                {formId ? 
                  (formLoading ? 'Loading...' : `Responses: ${form?.name || 'Untitled Form'}`) : 
                  'All Responses'
                }
              </h1>
              <p className="text-gray-500">View and manage form submissions</p>
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
                placeholder="Search responses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-container" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={thStyle}>Form Name</th>
                  <th style={thStyle}>Created By</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Created At</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form) => (
                    <tr key={form._id} style={trStyle}>
                      <td style={tdStyle}>{form.name}</td>
                      <td style={tdStyle}>{getUserDetailById(form?.userId, 'name')}</td>
                      <td style={tdStyle}>{getUserDetailById(form?.userId, 'role')}</td>
                      <td style={tdStyle}>{new Date(form.createdAt).toLocaleString()}</td>
                      <td style={tdStyle}>
                        <button 
                          style={btnStyle}
                          onClick={() => setLocation(`/forms/${form._id}/responses`)}
                          >View</button>
                          <button 
                            style={btnStyleDanger}
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`/api/forms/${form._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                });
                                if (!response.ok) {
                                  throw new Error('Failed to delete form');
                                }
                                // Invalidate and refetch forms query to update UI
                                await queryClient.invalidateQueries(['/api/forms']);
                              } catch (error) {
                                alert(error.message || 'Error deleting form');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No forms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>   
        </main>
      </div>
    </div>
  );
};

export default ResponsesList;
