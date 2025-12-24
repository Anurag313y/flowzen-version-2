import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Hotel } from 'lucide-react';
import { Client } from '@/store/superAdminStore';

interface CityDistributionCardProps {
  clients: Client[];
  type: 'pos' | 'pms';
}

export function CityDistributionCard({ clients, type }: CityDistributionCardProps) {
  const distribution = useMemo(() => {
    const filtered = clients.filter(c => 
      type === 'pos' ? c.posEnabled : c.pmsEnabled
    );
    
    const cityMap = new Map<string, number>();
    filtered.forEach(client => {
      const count = cityMap.get(client.city) || 0;
      cityMap.set(client.city, count + 1);
    });
    
    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }, [clients, type]);

  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  const Icon = type === 'pos' ? ShoppingCart : Hotel;

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              type === 'pos' ? 'bg-emerald-100' : 'bg-violet-100'
            }`}>
              <Icon className={`h-4 w-4 ${
                type === 'pos' ? 'text-emerald-600' : 'text-violet-600'
              }`} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">
                {type === 'pos' ? 'POS Clients' : 'PMS Clients'}
              </CardTitle>
              <p className="text-xs text-slate-500">by City</p>
            </div>
          </div>
          <Badge variant="outline" className={`${
            type === 'pos' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-violet-50 text-violet-700 border-violet-200'
          }`}>
            {total} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {distribution.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No clients found</p>
        ) : (
          <div className="space-y-2">
            {distribution.slice(0, 5).map((item) => {
              const percentage = Math.round((item.count / total) * 100);
              return (
                <div key={item.city} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{item.city}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        type === 'pos' ? 'bg-emerald-500' : 'bg-violet-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {distribution.length > 5 && (
              <p className="text-xs text-slate-400 text-center pt-2">
                +{distribution.length - 5} more cities
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}