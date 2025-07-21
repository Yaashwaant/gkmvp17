import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const vehicleInfoSchema = z.object({
  vehicleNumber: z.string().min(4, "Vehicle number is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

type VehicleInfoRequest = z.infer<typeof vehicleInfoSchema>;

export default function FirebaseAuth() {
  const [, navigate] = useLocation();
  const { firebaseUser, loginWithFirebase, isLoading } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState('');

  const form = useForm<VehicleInfoRequest>({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: {
      vehicleNumber: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!firebaseUser) {
      navigate('/auth/login');
    }
  }, [firebaseUser, navigate]);

  const onSubmit = async (data: VehicleInfoRequest) => {
    if (!firebaseUser) {
      setAuthError('No Firebase user found');
      return;
    }

    try {
      setAuthError('');
      await loginWithFirebase(firebaseUser, data.vehicleNumber);
      toast({
        title: "Account linked successfully",
        description: "Welcome to GreenKarma Wallet!",
      });
      navigate('/wallet');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account linking failed';
      setAuthError(message);
      toast({
        title: "Account linking failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Complete your profile</CardTitle>
          <CardDescription className="text-center">
            Hi {firebaseUser.displayName}! We need some additional information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={firebaseUser.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                placeholder="KA01AB1234"
                {...form.register('vehicleNumber')}
                disabled={isLoading}
              />
              {form.formState.errors.vehicleNumber && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.vehicleNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                {...form.register('phone')}
                disabled={isLoading}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}