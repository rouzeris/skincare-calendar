import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { toast } from 'sonner';
import {
  CosmeticProduct,
  calculateStatus,
  generateProductId,
} from '../jazz/types';
import { SkincareAccount } from '../jazz/schema';

export function CosmeticCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { me } = useAccount(SkincareAccount, {
    resolve: { root: { products: true } },
  });

  const isLoading = me === undefined;

  const products: CosmeticProduct[] = me
    ? [...me.root.products].map((product) => {
        const computedStatus = calculateStatus(product.expiryDate);
        if (product.status !== computedStatus) {
          product.$jazz.set('status', computedStatus);
        }

        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          type: product.type,
          openedDate: product.openedDate,
          expiryDate: product.expiryDate,
          createdAt: product.createdAt,
          status: computedStatus,
        };
      }).sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )
    : [];

  const expiringProducts = products.filter(
    (product) => product.status === 'warning' || product.status === 'expired'
  );
  const freshProducts = products.filter((product) => product.status === 'fresh');

  const handleAddProduct = (productData: Omit<CosmeticProduct, 'id' | 'status' | 'createdAt'>) => {
    if (!me) {
      toast.error('Dane konta nie są jeszcze gotowe');
      return;
    }

    me.root.products.$jazz.push({
      ...productData,
      id: generateProductId(),
      createdAt: new Date().toISOString(),
      status: calculateStatus(productData.expiryDate),
    });
    toast.success('Produkt został dodany');
  };

  const handleDeleteProduct = (id: string) => {
    if (!me) return;

    const removed = me.root.products.$jazz.remove((product) => product?.id === id);
    if (removed.length > 0) {
      toast.success('Produkt został usunięty');
    }
  };

  if (!isLoading && !me) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CardTitle>Brak danych konta</CardTitle>
            <p className="text-muted-foreground">
              Nie udało się wczytać danych. Sprawdź połączenie z Jazz lub odśwież stronę.
            </p>
            <Button onClick={() => window.location.reload()}>Odśwież</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Kalendarz Kosmetyków</h1>
          <p className="text-muted-foreground">
            Śledź daty ważności swoich kosmetyków do twarzy
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          disabled={isLoading || !me}
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj produkt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {expiringProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Wymagają uwagi
                  <Badge variant="destructive">{expiringProducts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expiringProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Wszystkie produkty ({products.length})
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Ładowanie produktów...</p>
                </div>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nie masz jeszcze żadnych produktów. Dodaj pierwszy!
                </p>
              ) : (
                products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteProduct}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kalendarz</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Świeże produkty</span>
                <Badge variant="secondary">{freshProducts.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Wkrótce wygasną</span>
                <Badge variant="outline">
                  {products.filter(p => p.status === 'warning').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Przeterminowane</span>
                <Badge variant="destructive">
                  {products.filter(p => p.status === 'expired').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
