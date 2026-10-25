"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your-client-id';
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'your-client-secret';

      fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            sessionStorage.setItem('gitrecap-github-token', data.access_token);
            const pending = localStorage.getItem('gitrecap-pending-analyze');
            if (pending) {
              localStorage.removeItem('gitrecap-pending-analyze');
              router.push(`/?username=${encodeURIComponent(pending)}`);
            } else {
              router.push('/');
            }
          } else {
            console.error('Failed to get token:', data);
            router.push('/');
          }
        })
        .catch(error => {
          console.error('Error exchanging code:', error);
          router.push('/');
        });
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <p className="text-lg">Authenticating with GitHub...</p>
      </div>
    </div>
  );
}