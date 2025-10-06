import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { AlertTriangle } from 'lucide-react';
import { CosmeticProduct, RoutineStep } from '../utils/api';

interface AddRoutineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (routine: Omit<RoutineStep, 'id' | 'createdAt' | 'updatedAt'>) => void;
  day: string;
  timeOfDay: 'morning' | 'evening';
  products: CosmeticProduct[];
}

const DAY_LABELS = {
  monday: 'Poniedziałek',
  tuesday: 'Wtorek',
  wednesday: 'Środa',
  thursday: 'Czwartek',
  friday: 'Piątek',
  saturday: 'Sobota',
  sunday: 'Niedziela'
} as const;

export function AddRoutineDialog({ 
  isOpen, 
  onClose, 
  onAdd, 
  day, 
  timeOfDay, 
  products 
}: AddRoutineDialogProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProductIds.length === 0) {
      return;
    }

    onAdd({
      day,
      timeOfDay,
      productIds: selectedProductIds,
      notes: notes.trim() || undefined
    });

    // Reset form
    setSelectedProductIds([]);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setSelectedProductIds([]);
    setNotes('');
    onClose();
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const checkConflicts = () => {
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    const conflicts: string[] = [];
    
    const hasAcid = selectedProducts.some(p => 
      p.name.toLowerCase().includes('acid') || 
      p.name.toLowerCase().includes('aha') || 
      p.name.toLowerCase().includes('bha') ||
      p.type.toLowerCase().includes('peeling')
    );
    const hasRetinol = selectedProducts.some(p => 
      p.name.toLowerCase().includes('retinol') || 
      p.name.toLowerCase().includes('retinoid') ||
      p.type.toLowerCase().includes('serum') && p.name.toLowerCase().includes('vitamin a')
    );
    const hasVitaminC = selectedProducts.some(p => 
      p.name.toLowerCase().includes('vitamin c') || 
      p.name.toLowerCase().includes('witamina c') ||
      p.name.toLowerCase().includes('l-ascorbic')
    );

    if (hasAcid && hasRetinol) conflicts.push('Kwasy i retinoidy mogą drażnić skórę');
    if (hasAcid && hasVitaminC) conflicts.push('Kwasy mogą destabilizować witaminę C');
    if (hasRetinol && hasVitaminC) conflicts.push('Retinoidy i witamina C mogą się neutralizować');

    return conflicts;
  };

  const conflicts = checkConflicts();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Dodaj krok rutyny - {DAY_LABELS[day as keyof typeof DAY_LABELS]} ({timeOfDay === 'morning' ? 'Rano' : 'Wieczór'})
          </DialogTitle>
          <DialogDescription>
            Wybierz produkty dla tego kroku rutyny. Sprawdź kompatybilność składników aktywnych.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Wybierz produkty</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Brak dostępnych produktów. Dodaj produkty w zakładce "Kalendarz".
                </p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={product.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {product.name}
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.brand}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {product.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Ostrzeżenie o kompatybilności</span>
              </div>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
              <p className="text-xs text-orange-600 mt-2">
                Rozważ używanie tych składników w różnych porach dnia lub dniach tygodnia.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki (opcjonalne)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. Zastosować na oczyszczoną skórę, unikać okolic oczu..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Anuluj
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={selectedProductIds.length === 0}
            >
              Dodaj krok rutyny
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}