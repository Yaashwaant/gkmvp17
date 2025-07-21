import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { WalletCard } from '@/components/WalletCard';
import { StatsCards } from '@/components/StatsCards';
import { RecentActivity } from '@/components/RecentActivity';
import { EcoWarriorBadge } from '@/components/EcoWarriorBadge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function Wallet() {
  const { user } = useAuth();
  
  // Use authenticated user's data or fallback to demo for non-authenticated users
  const currentVehicle = user?.vehicleNumber || 'DEMO4774';
  const currentUserName = user?.name || 'Demo User';

  const { data: walletData, isLoading } = useQuery({
    queryKey: [`/api/wallet/${currentVehicle}`],
  });

  // Provide default structure if data is not available yet
  const wallet = walletData || {
    user: { name: currentUserName, vehicleNumber: currentVehicle },
    totalBalance: 0,
    totalCo2Saved: 0,
    monthlyReward: 0,
    totalDistance: 0
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <Header />
        <div className="px-4 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const activities = [
    {
      id: 1,
      type: 'reward',
      vehicleId: wallet.user.vehicleNumber,
      status: 'active' as const,
      timestamp: new Date(),
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 min-h-screen relative">
      <Header />
      
      <WalletCard 
        balance={wallet.totalBalance}
        co2Saved={wallet.totalCo2Saved}
        vehicleId={wallet.user.vehicleNumber}
      />
      
      <StatsCards 
        monthlyReward={wallet.monthlyReward}
        totalDistance={wallet.totalDistance}
      />
      
      <RecentActivity activities={activities} />
      
      <EcoWarriorBadge 
        co2Saved={wallet.totalCo2Saved}
        progress={Math.min((wallet.totalCo2Saved / 50) * 100, 100)}
      />
      
      <BottomNavigation />
    </div>
  );
}
