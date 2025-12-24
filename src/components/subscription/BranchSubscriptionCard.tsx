import { format } from 'date-fns';
import { Building2, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BranchSubscription } from '@/store/subscriptionStore';

interface BranchSubscriptionCardProps {
  subscription: BranchSubscription;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
}

export function BranchSubscriptionCard({
  subscription,
  selected = false,
  onSelect,
  showCheckbox = false,
}: BranchSubscriptionCardProps) {
  const today = new Date();
  const expiryDate = new Date(subscription.expiryDate);
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    if (daysLeft <= 0) return 'bg-destructive/10 text-destructive border-destructive/30';
    if (daysLeft <= 10) return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-success/10 text-success border-success/30';
  };

  const getStatusIcon = () => {
    if (daysLeft <= 0) return <AlertTriangle className="h-4 w-4" />;
    if (daysLeft <= 10) return <Clock className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <Card 
      className={`transition-all ${
        selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {showCheckbox && (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
          )}
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {subscription.branchName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan === '1_year' ? '1 Year Plan' : '3 Year Plan'}
                </p>
              </div>
              <Badge variant="outline" className={getStatusColor()}>
                <span className="flex items-center gap-1">
                  {getStatusIcon()}
                  {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                </span>
              </Badge>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Activated: {format(new Date(subscription.activationDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Expires: {format(expiryDate, 'MMM dd, yyyy')}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  subscription.paymentStatus === 'paid'
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-destructive/10 text-destructive border-destructive/30'
                }
              >
                {subscription.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </Badge>
              <span className="text-sm font-medium">₹{subscription.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
