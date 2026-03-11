import { useState } from 'react';
import { Upload, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email) {
      toast.error('Please provide both a file and an email address.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes to account for Render cold start + AI processing
      });
      
      toast.success(response.data.message || 'AI Summary generated and email sent successfully!');
      setFile(null);
      setEmail('');
    } catch (error: any) {
      console.error(error);
      const backendError = error.response?.data?.error;
      const backendDetail = error.response?.data?.detail;
      const backendDebug = error.response?.data?.debug;
      
      let message = backendError || 'Failed to process request';
      if (backendDetail) message += `: ${backendDetail}`;
      if (backendDebug?.code) message += ` (Code: ${backendDebug.code})`;
      
      toast.error(message, { duration: 10000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Sales Insight Automator</h1>
          <p className="text-blue-100 text-sm">Upload your sales data (CSV/Excel) and get an AI summary delivered directly to your inbox.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sales Data File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">
                  CSV, XLSX up to 10MB
                </p>
              </div>
            </div>
            {file && (
              <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Recipient Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 text-slate-900 bg-white border outline-none transition-all"
                placeholder="executive@rabbitt.ai"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file || !email}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
              ${loading || !file || !email ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Processing...
              </>
            ) : (
              'Generate & Send Summary'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
