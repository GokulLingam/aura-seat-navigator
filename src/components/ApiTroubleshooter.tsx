import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import apiService from '@/services/apiService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const ApiTroubleshooter = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Basic connectivity
    addResult({ name: 'API Connectivity', status: 'pending', message: 'Testing basic connectivity...' });
    try {
      const isHealthy = await apiService.healthCheck();
      addResult({
        name: 'API Connectivity',
        status: isHealthy ? 'success' : 'error',
        message: isHealthy ? 'API is reachable' : 'API is not responding',
      });
    } catch (error) {
      addResult({
        name: 'API Connectivity',
        status: 'error',
        message: 'Failed to connect to API',
        details: error,
      });
    }

    // Test 2: CORS
    addResult({ name: 'CORS Check', status: 'pending', message: 'Testing CORS configuration...' });
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        addResult({
          name: 'CORS Check',
          status: 'success',
          message: 'CORS is properly configured',
        });
      } else {
        addResult({
          name: 'CORS Check',
          status: 'error',
          message: `CORS error: ${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      addResult({
        name: 'CORS Check',
        status: 'error',
        message: 'CORS test failed',
        details: error,
      });
    }

    // Test 3: Login endpoint
    addResult({ name: 'Login Endpoint', status: 'pending', message: 'Testing login endpoint...' });
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
        }),
      });

      const data = await response.json();
      
      if (response.status === 401) {
        addResult({
          name: 'Login Endpoint',
          status: 'success',
          message: 'Login endpoint is working (expected 401 for invalid credentials)',
          details: { status: response.status, message: data.message },
        });
      } else if (response.status === 403) {
        addResult({
          name: 'Login Endpoint',
          status: 'error',
          message: 'Login endpoint returned 403 Forbidden - check server configuration',
          details: { status: response.status, message: data.message },
        });
      } else {
        addResult({
          name: 'Login Endpoint',
          status: 'error',
          message: `Unexpected response: ${response.status}`,
          details: { status: response.status, data },
        });
      }
    } catch (error) {
      addResult({
        name: 'Login Endpoint',
        status: 'error',
        message: 'Login endpoint test failed',
        details: error,
      });
    }

    // Test 4: Environment variables
    addResult({ name: 'Environment Check', status: 'pending', message: 'Checking environment configuration...' });
    const envVars = {
      'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
      'VITE_ENABLE_DEBUG_LOGGING': import.meta.env.VITE_ENABLE_DEBUG_LOGGING,
      'Current API URL': apiUrl,
    };
    
    addResult({
      name: 'Environment Check',
      status: 'success',
      message: 'Environment variables loaded',
      details: envVars,
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          API Troubleshooter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">API Base URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:3001/api"
          />
        </div>

        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run API Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Test Results:</h3>
            {results.map((result, index) => (
              <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {result.name}
                    </AlertDescription>
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">View Details</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Common 403 Error Solutions:</h4>
          <ul className="text-sm space-y-1">
            <li>• Check if the backend server is running</li>
            <li>• Verify the API URL is correct</li>
            <li>• Ensure CORS is properly configured on the backend</li>
            <li>• Check if the login endpoint requires different authentication</li>
            <li>• Verify the request format matches what the backend expects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTroubleshooter; 