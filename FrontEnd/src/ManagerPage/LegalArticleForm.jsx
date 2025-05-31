import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { 
  DocumentTextIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckIcon 
} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

const LegalArticleForm = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [subclasses, setSubclasses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
      const navigate = useNavigate(); 
  const [manualEntry, setManualEntry] = useState(false);
  const [articles, setArticles] = useState([{ article_number: '', title: '', description: '' }]);

  const selectedType = watch('type');

  // Create an axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your base API URL
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

  // Fetch categories on mount with improved error handling
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await axios.get('http://localhost:4000/api/legal/categories');
        
        // Handle different response formats
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else if (res.data?.data) {
          setCategories([res.data.data]);
        } else {
          console.error('Unexpected API response:', res.data);
          setError('Categories data format is unexpected');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err.response?.data?.message || 'Failed to load categories. Please try again.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Update subclasses when type changes
  useEffect(() => {
    if (!selectedType || !Array.isArray(categories)) {
      setSubclasses([]);
      return;
    }

    const typeObj = categories.find(cat => cat?.type === selectedType);
    setSubclasses(typeObj?.subclasses || []);
  }, [selectedType, categories]);

  // Create preview for file upload
  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setManualEntry(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview('');
  };

  const handleAddArticle = () => {
    setArticles([...articles, { article_number: '', title: '', description: '' }]);
  };

  const handleArticleChange = (index, field, value) => {
    const updatedArticles = [...articles];
    updatedArticles[index][field] = value;
    setArticles(updatedArticles);
  };

  const handleRemoveArticle = (index) => {
    if (articles.length > 1) {
      const updatedArticles = [...articles];
      updatedArticles.splice(index, 1);
      setArticles(updatedArticles);
    }
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
  
    const formData = new FormData();
    
    // Ensure these are properly appended
    formData.append('type', data.type);
    formData.append('subclass', data.subclass);
  
    // Debug: Log what's being sent
    console.log('Submitting:', {
      type: data.type,
      subclass: data.subclass,
      hasFile: !!selectedFile,
      manualEntry,
      articleCount: manualEntry ? articles.length : 0
    });
  
    if (selectedFile) {
      formData.append('document', selectedFile);
    } else if (manualEntry) {
      // Stringify the articles array properly
      formData.append('articles', JSON.stringify(
        articles.filter(a => a.article_number && a.title && a.description)
      ));
    }
  
    try {
      const response = await api.post('/legal/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    console.log(response)

      setSuccess(true);
      reset();
      setSelectedFile(null);
      setPreview('');
      setArticles([{ article_number: '', title: '', description: '' }]);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      if (err.response?.status === 401) {
        // Handle unauthorized error specifically
        setError('Session expired. Please login again.');
        // Optionally redirect to login
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to submit legal articles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Legal Articles</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            Legal articles submitted successfully!
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button 
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Legal Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register('type', { required: 'Legal type is required' })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading || isLoadingCategories}
            >
              {isLoadingCategories ? (
                <option value="">Loading categories...</option>
              ) : (
                <>
                  <option value="">Select a legal type</option>
                  {categories.map((category) => (
                    <option key={category?.type || ''} value={category?.type || ''}>
                      {category?.type || 'Unknown'}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subclass" className="block text-sm font-medium text-gray-700 mb-1">
              Subclass <span className="text-red-500">*</span>
            </label>
            <select
              id="subclass"
              {...register('subclass', { required: 'Subclass is required' })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subclass ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!selectedType || subclasses.length === 0 || isLoading}
            >
              <option value="">{subclasses.length === 0 ? 'Select type first' : 'Select a subclass'}</option>
              {subclasses.map((subclass, index) => (
                <option key={subclass || index} value={subclass || ''}>
                  {subclass || 'Unknown'}
                </option>
              ))}
            </select>
            {errors.subclass && (
              <p className="mt-1 text-sm text-red-600">{errors.subclass.message}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Legal Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  {preview && selectedFile.type.startsWith('image/') ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="h-24 w-24 object-contain mx-auto mb-2"
                    />
                  ) : (
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-blue-500" />
                  )}
                  <p className="mt-1 text-sm text-gray-600">{selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={onFileChange}
                        accept=".pdf,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOCX, or images up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">OR Enter Articles Manually</h3>
            <button
              type="button"
              onClick={() => setManualEntry(!manualEntry)}
              disabled={!!selectedFile}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                manualEntry
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {manualEntry ? 'Hide Manual Entry' : 'Show Manual Entry'}
            </button>
          </div>

          {manualEntry && (
            <div className="mt-4 space-y-4">
              {articles.map((article, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Article Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={article.article_number}
                        onChange={(e) => handleArticleChange(index, 'article_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={article.title}
                        onChange={(e) => handleArticleChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(index)}
                        disabled={articles.length <= 1}
                        className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          articles.length > 1 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={article.description}
                      onChange={(e) => handleArticleChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddArticle}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Article
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (!selectedFile && (!manualEntry || articles.some(a => !a.article_number || !a.title || !a.description)))}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                Submit Legal Articles
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalArticleForm;