import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Sun, Moon, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { AddRoutineDialog } from './AddRoutineDialog';
import {
  ActiveIngredient,
  CosmeticProduct,
  RoutineStep,
  calculateStatus,
  generateRoutineId,
} from '../jazz/types';
import { useAccount } from '../jazz/JazzProvider';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Poniedziałek' },
  { key: 'tuesday', label: 'Wtorek' },
  { key: 'wednesday', label: 'Środa' },
  { key: 'thursday', label: 'Czwartek' },
  { key: 'friday', label: 'Piątek' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Niedziela' }
];

const ACTIVE_INGREDIENTS: ActiveIngredient[] = [
  {
    name: 'Kwasy AHA/BHA',
    type: 'acid',
    frequency: '2-3-times-week',
    cannotCombineWith: ['Retinoid', 'Witamina C'],
    description: 'Kwasy złuszczające - stosować 2-3 razy w tygodniu, nie łączyć z retinoidami'
  },
  {
    name: 'Retinol/Retinoidy',
    type: 'retinoid',
    frequency: 'every-other-day',
    cannotCombineWith: ['Kwasy AHA/BHA', 'Witamina C'],
    description: 'Pochodne witaminy A - zaczynać co 2-3 dni, nie łączyć z kwasami'
  },
  {
    name: 'Witamina C',
    type: 'vitamin-c',
    frequency: 'daily',
    cannotCombineWith: ['Retinoid', 'Kwasy AHA/BHA'],
    description: 'Antyoksydant - najlepiej rano, nie łączyć z retinoidami i kwasami'
  },
  {
    name: 'Niacinamid',
    type: 'niacinamide',
    frequency: 'daily',
    cannotCombineWith: [],
    description: 'Witamina B3 - można stosować codziennie, łączy się z większością składników'
  }
];

export function WeeklyRoutine() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'morning' | 'evening'>('morning');

  const { me } = useAccount();

  const isLoading = !me;

  const products = useMemo(() => {
    if (!me) return [] as CosmeticProduct[];

    const normalized = [...me.root.products].map((product) => {
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
      });

    return normalized.sort((a, b) => a.name.localeCompare(b.name));
  }, [me]);

  const routines = useMemo(() => {
    if (!me) return [] as RoutineStep[];

    return [...me.root.routines].map((routine) => ({
      id: routine.id,
      day: routine.day,
      timeOfDay: routine.timeOfDay,
      productIds: Array.from(routine.productIds ?? []),
      notes: routine.notes ?? undefined,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    }));
  }, [me]);

  const addRoutineStep = (routineData: Omit<RoutineStep, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!me) {
      toast.error('Dane konta nie są jeszcze gotowe');
      return;
    }

    me.root.routines.$jazz.push({
      ...routineData,
      id: generateRoutineId(),
      createdAt: new Date().toISOString(),
    });
    toast.success('Krok rutyny został dodany');
  };

  const deleteRoutineStep = (id: string) => {
    if (!me) return;
    const removed = me.root.routines.$jazz.remove((routine) => routine?.id === id);
    if (removed.length > 0) {
      toast.success('Krok rutyny został usunięty');
    }
  };

  const getRoutineForDayAndTime = (day: string, timeOfDay: 'morning' | 'evening') => {
    return routines.filter(r => r.day === day && r.timeOfDay === timeOfDay);
  };

  const getProductsByIds = (productIds: string[]) => {
    return products.filter(p => productIds.includes(p.id));
  };

  const checkIngredientConflicts = (productIds: string[]) => {
    const selectedProducts = getProductsByIds(productIds);
    const conflicts: string[] = [];
    
    // Simple conflict detection based on product types
    const hasAcid = selectedProducts.some(p => 
      p.name.toLowerCase().includes('acid') || 
      p.name.toLowerCase().includes('aha') || 
      p.name.toLowerCase().includes('bha')
    );
    const hasRetinol = selectedProducts.some(p => 
      p.name.toLowerCase().includes('retinol') || 
      p.name.toLowerCase().includes('retinoid')
    );
    const hasVitaminC = selectedProducts.some(p => 
      p.name.toLowerCase().includes('vitamin c') || 
      p.name.toLowerCase().includes('witamina c')
    );

    if (hasAcid && hasRetinol) conflicts.push('Kwasy + Retinoid');
    if (hasAcid && hasVitaminC) conflicts.push('Kwasy + Witamina C');
    if (hasRetinol && hasVitaminC) conflicts.push('Retinoid + Witamina C');

    return conflicts;
  };

  const handleAddRoutine = (day: string, timeOfDay: 'morning' | 'evening') => {
    setSelectedDay(day);
    setSelectedTimeOfDay(timeOfDay);
    setIsAddDialogOpen(true);
  };

  if (!isLoading && !me) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CardTitle>Brak danych konta</CardTitle>
            <p className="text-muted-foreground">
              Nie możemy wyświetlić rutyn. Spróbuj ponownie po odświeżeniu strony.
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
          <h1>Rutyna Tygodniowa</h1>
          <p className="text-muted-foreground">
            Planuj swoją rutynę pielęgnacyjną z uwzględnieniem aktywnych składników
          </p>
        </div>
      </div>

      {/* Active Ingredients Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Przewodnik po aktywnych składnikach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIVE_INGREDIENTS.map((ingredient) => (
              <div key={ingredient.name} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{ingredient.name}</Badge>
                  <Badge variant="secondary">
                    {ingredient.frequency === 'daily' && 'Codziennie'}
                    {ingredient.frequency === 'every-other-day' && 'Co 2-3 dni'}
                    {ingredient.frequency === '2-3-times-week' && '2-3x w tygodniu'}
                    {ingredient.frequency === 'weekly' && 'Raz w tygodniu'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{ingredient.description}</p>
                {ingredient.cannotCombineWith.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <AlertTriangle className="w-3 h-3" />
                    Nie łączyć z: {ingredient.cannotCombineWith.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Routine Grid */}
      <div className="block lg:hidden">
        {/* Mobile View - Collapsible Days */}
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => (
            <Card key={day.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Morning Routine */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Rano
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddRoutine(day.key, 'morning')}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {getRoutineForDayAndTime(day.key, 'morning').map((routine) => {
                    const routineProducts = getProductsByIds(routine.productIds);
                    const conflicts = checkIngredientConflicts(routine.productIds);
                    
                    return (
                      <div key={routine.id} className="p-3 rounded border">
                        {routineProducts.map((product) => (
                          <div key={product.id} className="text-sm mb-1">
                            <div className="font-medium">{product.brand}</div>
                            <div className="text-muted-foreground">{product.name}</div>
                          </div>
                        ))}
                        {conflicts.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-orange-600 mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            Konflikt składników!
                          </div>
                        )}
                        {routine.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{routine.notes}</p>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRoutineStep(routine.id)}
                          className="text-sm mt-2"
                        >
                          Usuń
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Evening Routine */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Moon className="w-4 h-4 text-blue-500" />
                      Wieczór
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddRoutine(day.key, 'evening')}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {getRoutineForDayAndTime(day.key, 'evening').map((routine) => {
                    const routineProducts = getProductsByIds(routine.productIds);
                    const conflicts = checkIngredientConflicts(routine.productIds);
                    
                    return (
                      <div key={routine.id} className="p-3 rounded border">
                        {routineProducts.map((product) => (
                          <div key={product.id} className="text-sm mb-1">
                            <div className="font-medium">{product.brand}</div>
                            <div className="text-muted-foreground">{product.name}</div>
                          </div>
                        ))}
                        {conflicts.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-orange-600 mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            Konflikt składników!
                          </div>
                        )}
                        {routine.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{routine.notes}</p>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRoutineStep(routine.id)}
                          className="text-sm mt-2"
                        >
                          Usuń
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden lg:grid grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => (
          <Card key={day.key} className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-center">{day.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Morning Routine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    Rano
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddRoutine(day.key, 'morning')}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                {getRoutineForDayAndTime(day.key, 'morning').map((routine) => {
                  const routineProducts = getProductsByIds(routine.productIds);
                  const conflicts = checkIngredientConflicts(routine.productIds);
                  
                  return (
                    <div key={routine.id} className="p-2 rounded border">
                      {routineProducts.map((product) => (
                        <div key={product.id} className="text-xs">
                          <div className="font-medium">{product.brand}</div>
                          <div className="text-muted-foreground">{product.name}</div>
                        </div>
                      ))}
                      {conflicts.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Konflikt!
                        </div>
                      )}
                      {routine.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{routine.notes}</p>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRoutineStep(routine.id)}
                        className="text-xs p-1 h-auto mt-1"
                      >
                        Usuń
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Evening Routine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Moon className="w-4 h-4 text-blue-500" />
                    Wieczór
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddRoutine(day.key, 'evening')}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                {getRoutineForDayAndTime(day.key, 'evening').map((routine) => {
                  const routineProducts = getProductsByIds(routine.productIds);
                  const conflicts = checkIngredientConflicts(routine.productIds);
                  
                  return (
                    <div key={routine.id} className="p-2 rounded border">
                      {routineProducts.map((product) => (
                        <div key={product.id} className="text-xs">
                          <div className="font-medium">{product.brand}</div>
                          <div className="text-muted-foreground">{product.name}</div>
                        </div>
                      ))}
                      {conflicts.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Konflikt!
                        </div>
                      )}
                      {routine.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{routine.notes}</p>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRoutineStep(routine.id)}
                        className="text-xs p-1 h-auto mt-1"
                      >
                        Usuń
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddRoutineDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addRoutineStep}
        day={selectedDay}
        timeOfDay={selectedTimeOfDay}
        products={products}
      />
    </div>
  );
}
