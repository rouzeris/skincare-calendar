import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Camera, Search, HelpCircle } from 'lucide-react';
import { CosmeticProduct } from '../jazz/types';
import { BarcodeScanner } from './BarcodeScanner';
import { searchBrands, getBrandProducts, CosmeticBrand } from '../utils/cosmetics-database';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<CosmeticProduct, 'id' | 'status' | 'createdAt'>) => void;
}

const cosmeticTypes = [
  // Makijaż twarzy
  { name: 'Podkład', months: 12 },
  { name: 'Korektor', months: 12 },
  { name: 'Puder', months: 24 },
  { name: 'Róż', months: 24 },
  { name: 'Bronzer', months: 24 },
  { name: 'Highlighter', months: 24 },
  { name: 'Baza pod makijaż', months: 12 },

  // Makijaż oczu
  { name: 'Cienie do powiek', months: 24 },
  { name: 'Eyeliner', months: 3 },
  { name: 'Tusz do rzęs', months: 3 },

  // Makijaż ust
  { name: 'Szminka', months: 24 },
  { name: 'Konturówka do ust', months: 12 },
  { name: 'Balsam do ust', months: 12 },

  // Pielęgnacja twarzy
  { name: 'Krem do twarzy', months: 12 },
  { name: 'Serum', months: 6 },
  { name: 'Tonik', months: 12 },
  { name: 'Krem pod oczy', months: 6 },
  { name: 'Żel do twarzy', months: 12 },
  { name: 'Olej do demakijażu', months: 18 },
  { name: 'Pady do twarzy', months: 36 },
  { name: 'Maska do twarzy', months: 24 },

  // Pielęgnacja ciała
  { name: 'Krem do ciała', months: 18 },
  { name: 'Mleczko do ciała', months: 18 },
  { name: 'Peeling do ciała', months: 24 },

  // Ochrona przeciwsłoneczna
  { name: 'Krem z filtrem SPF', months: 12 },
  { name: 'Spray z filtrem SPF', months: 12 }
];

export function AddProductDialog({ isOpen, onClose, onAdd }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: '',
    openedDate: new Date().toISOString().split('T')[0]
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<CosmeticBrand[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || !formData.type) {
      return;
    }

    const selectedType = cosmeticTypes.find(t => t.name === formData.type);
    const openedDate = new Date(formData.openedDate);
    const expiryDate = new Date(openedDate);
    expiryDate.setMonth(expiryDate.getMonth() + (selectedType?.months || 12));

    onAdd({
      name: formData.name,
      brand: formData.brand,
      type: formData.type,
      openedDate: openedDate.toISOString(),
      expiryDate: expiryDate.toISOString()
    });

    // Reset form
    setFormData({
      name: '',
      brand: '',
      type: '',
      openedDate: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  useEffect(() => {
    if (formData.brand.length >= 2) {
      const suggestions = searchBrands(formData.brand);
      setBrandSuggestions(suggestions);
      setShowBrandSuggestions(suggestions.length > 0);
    } else {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.brand && formData.name.length >= 2) {
      const products = getBrandProducts(formData.brand);
      const filtered = products.filter(product =>
        product.toLowerCase().includes(formData.name.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductSuggestions(filtered.length > 0);
    } else {
      setProductSuggestions([]);
      setShowProductSuggestions(false);
    }
  }, [formData.name, formData.brand]);

  const handleScanResult = (productData: { name: string; brand: string; type?: string }) => {
    setFormData(prev => ({
      ...prev,
      name: productData.name,
      brand: productData.brand,
      type: productData.type || prev.type
    }));
  };

  const handleBrandSelect = (brand: string) => {
    setFormData(prev => ({ ...prev, brand }));
    setShowBrandSuggestions(false);
  };

  const handleProductSelect = (product: string) => {
    setFormData(prev => ({ ...prev, name: product }));
    setShowProductSuggestions(false);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      brand: '',
      type: '',
      openedDate: new Date().toISOString().split('T')[0]
    });
    setBrandSuggestions([]);
    setProductSuggestions([]);
    setShowBrandSuggestions(false);
    setShowProductSuggestions(false);
    setIsScannerOpen(false);
    onClose();
  };

  return (
    <TooltipProvider>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj nowy produkt</DialogTitle>
            <DialogDescription>
              Uzupełnij informacje o swoim produkcie kosmetycznym lub zeskanuj kod kreskowy. Data wygaśnięcia zostanie automatycznie obliczona na podstawie typu produktu.
            </DialogDescription>
          </DialogHeader>

          {/* Przycisk skanowania */}
          <div className="flex justify-center pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Skanuj kod kreskowy
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="name">Nazwa produktu</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Wprowadź dokładną nazwę produktu, jaką podaje producent na opakowaniu. Przykłady:</p>
                    <ul className="mt-2 text-xs space-y-1">
                      <li>• "Revitalift Laser X3" zamiast "krem"</li>
                      <li>• "Rouge Coco Bloom" zamiast "szminka"</li>
                      <li>• "Toleriane Ultra Fluide" zamiast "krem do twarzy"</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="np. Snail 96 Mucin Power Essence, Rouge Coco Bloom..."
                  required
                />

                {/* Podpowiedzi produktów */}
                {showProductSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {productSuggestions.map((product) => (
                      <button
                        key={product}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marka</Label>
              <div className="relative">
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="np. COSRX, Chanel, Beauty of Joseon..."
                  required
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />

                {/* Podpowiedzi marki */}
                {showBrandSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {brandSuggestions.map((brand) => (
                      <button
                        key={brand.name}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                        onClick={() => handleBrandSelect(brand.name)}
                      >
                        <span className="font-medium">{brand.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {brand.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Typ kosmetyku</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  {cosmeticTypes.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name} ({type.months} mies.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openedDate">Data otwarcia</Label>
              <Input
                id="openedDate"
                type="date"
                value={formData.openedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, openedDate: e.target.value }))}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Anuluj
              </Button>
              <Button type="submit" className="flex-1">
                Dodaj produkt
              </Button>
            </div>
          </form>

          <BarcodeScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScanResult={handleScanResult}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
