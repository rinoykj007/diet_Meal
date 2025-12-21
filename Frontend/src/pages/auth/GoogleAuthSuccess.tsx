import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== GoogleAuthSuccess Component Loaded ===');
    console.log('Current URL:', window.location.href);
    console.log('Search Params:', searchParams.toString());

    const token = searchParams.get('token');
    console.log('Token from URL:', token);

    if (token) {
      console.log('Token found, storing in localStorage');
      // Store the token
      localStorage.setItem('token', token);

      const apiUrl = `${import.meta.env.VITE_API_URL}/auth/me`;
      console.log('Fetching user data from:', apiUrl);
      console.log('VITE_API_URL env variable:', import.meta.env.VITE_API_URL);

      // Fetch user data with the token
      fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Response status:', res.status);
          console.log('Response ok:', res.ok);
          return res.json();
        })
        .then(data => {
          console.log('Response data:', data);
          console.log('Data type:', typeof data);
          console.log('Has _id?', !!data._id);

          if (data && data._id) {
            console.log('User data valid, storing in localStorage');
            localStorage.setItem('user', JSON.stringify(data));

            toast({
              title: 'Welcome!',
              description: 'Successfully signed in with Google.',
            });

            console.log('User roles:', data.roles);
            // Redirect based on user role
            if (data.roles?.includes('admin')) {
              console.log('Redirecting to admin dashboard');
              navigate('/admin/dashboard');
            } else if (data.roles?.includes('provider')) {
              console.log('Redirecting to restaurant dashboard');
              navigate('/restaurant/dashboard');
            } else if (data.roles?.includes('delivery-partner')) {
              console.log('Redirecting to delivery-partner dashboard');
              navigate('/delivery-partner/dashboard');
            } else {
              console.log('Redirecting to user dashboard');
              navigate('/dashboard');
            }
          } else {
            console.error('Invalid user data structure:', data);
            throw new Error('Failed to fetch user data');
          }
        })
        .catch((error) => {
          console.error('Error during authentication:', error);
          toast({
            title: 'Authentication Error',
            description: 'Failed to complete Google sign-in.',
            variant: 'destructive',
          });
          navigate('/login');
        });
    } else {
      console.error('No token found in URL');
      toast({
        title: 'Authentication Error',
        description: 'No token received from Google.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
