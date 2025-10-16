import { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { apiClient, CosmeticProduct } from '../utils/api';
import { toast } from 'sonner';

export function CosmeticCalendar() {
  const [products, setProducts] = useState<CosmeticProduct[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate product status based on expiry date
  const calculateStatus = (expiryDate: string): 'fresh' | 'warning' | 'expired' => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return 'expired';
    } else if (daysUntilExpiry <= 30) {
      return 'warning';
    }
    return 'fresh';
  };

  // Load products from API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProducts = await apiClient.getProducts();
      
      // Update status for each product based on current date
      const productsWithStatus = fetchedProducts.map(product => ({
        ...product,
        status: calculateStatus(product.expiryDate)
      }));
      
      setProducts(productsWithStatus);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Nie udało się załadować produktów');
      toast.error('Błąd podczas ładowania produktów');
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (productData: Omit<CosmeticProduct, 'id' | 'status' | 'createdAt'>) => {
    try {
      const newProduct = await apiClient.createProduct(productData);
      const productWithStatus = {
        ...newProduct,
        status: calculateStatus(newProduct.expiryDate)
      };
      
      setProducts(prev => [...prev, productWithStatus]);
      toast.success('Produkt został dodany');
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Nie udało się dodać produktu');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produkt został usunięty');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Nie udało się usunąć produktu');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadProducts}>
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiringProducts = products.filter(p => p.status === 'warning' || p.status === 'expired');
  const freshProducts = products.filter(p => p.status === 'fresh');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Kalendarz Kosmetyków</h1>
          <p className="text-muted-foreground">
            Śledź daty ważności swoich kosmetyków do twarzy
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={isLoading}>
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
                    onDelete={deleteProduct}
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
                    onDelete={deleteProduct}
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
        onAdd={addProduct}
      />
    </div>
  );
}