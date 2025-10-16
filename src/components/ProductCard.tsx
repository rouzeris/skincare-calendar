import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { CosmeticProduct } from '../jazz/types';

interface ProductCardProps {
  product: CosmeticProduct;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    const now = new Date();
    const expiryDate = new Date(product.expiryDate);
    const timeDiff = expiryDate.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return days;
  };

  const getStatusBadge = () => {
    const days = getDaysUntilExpiry();
    
    if (product.status === 'expired') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Przeterminowany
        </Badge>
      );
    }
    
    if (product.status === 'warning') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
          <AlertTriangle className="w-3 h-3" />
          {days} dni do wygaśnięcia
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="text-green-600">
        Świeży ({days} dni)
      </Badge>
    );
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.type}</Badge>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Otwarto: {formatDate(product.openedDate)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Wygasa: {formatDate(product.expiryDate)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
