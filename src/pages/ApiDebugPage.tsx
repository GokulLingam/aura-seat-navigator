import ApiTroubleshooter from '@/components/ApiTroubleshooter';

const ApiDebugPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">API Debug & Troubleshooting</h1>
          <p className="text-gray-600">
            Use this tool to diagnose API connection issues and troubleshoot the 403 error you're experiencing.
          </p>
        </div>
        
        <ApiTroubleshooter />
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">1. Enable Debug Logging</h3>
              <p className="text-sm text-gray-600">
                Add <code className="bg-gray-200 px-1 rounded">VITE_ENABLE_DEBUG_LOGGING=true</code> to your .env file to see detailed API logs in the browser console.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Check Backend Server</h3>
              <p className="text-sm text-gray-600">
                Ensure your backend server is running on the correct port and the API endpoints are accessible.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Verify API URL</h3>
              <p className="text-sm text-gray-600">
                Make sure the API base URL in your environment variables matches your backend server address.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Check CORS Configuration</h3>
              <p className="text-sm text-gray-600">
                Ensure your backend allows requests from your frontend domain (usually http://localhost:3000 for development).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugPage; 