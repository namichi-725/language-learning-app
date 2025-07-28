'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      console.log('Testing Supabase connection...');
      
      // Simple query to test connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Supabase error:', error);
        setStatus(`Error: ${error.message}`);
      } else {
        console.log('Supabase connection successful!', data);
        setStatus('Connection successful!');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setStatus(`Failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Connection Test</h1>
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}
