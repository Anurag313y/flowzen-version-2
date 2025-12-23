import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.slice(1).replace(/-/g, ' ');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-muted mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold capitalize mb-2">{pageName || 'Page'}</h1>
          <p className="text-muted-foreground mb-6">
            This module is currently under development. Check back soon for updates.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
