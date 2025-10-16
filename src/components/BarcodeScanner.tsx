import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Camera, X, Scan, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (productData: { name: string; brand: string; type?: string }) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScanResult }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    if (isOpen) {
      setShowPermissionRequest(true);
      setCameraPermission('pending');
    } else {
      stopCamera();
      setShowPermissionRequest(false);
      setCameraPermission('pending');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      setShowPermissionRequest(false);
      // Żądaj dostępu do kamery BEZ lokalizacji
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Preferuj tylną kamerę
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsScanning(true);
      toast.success('Dostęp do kamery został przyznany');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      toast.error('Nie udało się uzyskać dostępu do kamery. Sprawdź uprawnienia w przeglądarce.');
    }
  };

  const denyCameraPermission = () => {
    setShowPermissionRequest(false);
    setCameraPermission('denied');
    toast.info('Anulowano dostęp do kamery');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);

    // Symulujemy skanowanie kodu kreskowego
    const mockBarcode = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    onScanResult({
      name: `Produkt demo ${mockBarcode.slice(-4)}`,
      brand: 'Demo marka',
      type: 'Krem do twarzy',
    });
    toast.success('Zeskanowano kod kreskowy');
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    setShowPermissionRequest(false);
    setCameraPermission('pending');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Skanuj kod kreskowy
          </DialogTitle>
        </DialogHeader>

        {/* Okno prośby o pozwolenie na kamerę */}
        {showPermissionRequest && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-2">
                <h3>Pozwolenie na dostęp do kamery</h3>
                <p className="text-sm text-muted-foreground">
                  Aby zeskanować kod kreskowy, aplikacja potrzebuje dostępu do kamery urządzenia.
                </p>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  🔒 <strong>Prywatność:</strong> Nie zbieramy ani nie przechowujemy danych lokalizacyjnych.
                  Kamera jest używana wyłącznie do skanowania kodów kreskowych.
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={denyCameraPermission}
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={requestCameraPermission}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Zezwól na dostęp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Komunikat o odmowie dostępu */}
        {cameraPermission === 'denied' && !showPermissionRequest && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <div className="space-y-2">
                <h3>Brak dostępu do kamery</h3>
                <p className="text-sm text-muted-foreground">
                  Nie można uruchomić skanera bez dostępu do kamery.
                </p>
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  💡 <strong>Wskazówka:</strong> Sprawdź ustawienia przeglądarki i zezwól na dostęp do kamery dla tej strony.
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Zamknij
                </Button>
                <Button
                  onClick={() => setShowPermissionRequest(true)}
                  className="flex-1"
                >
                  Spróbuj ponownie
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scanner interface - wyświetlany tylko gdy pozwolenie zostało przyznane */}
        {cameraPermission === 'granted' && !showPermissionRequest && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />

                  {/* Ramka skanowania */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    </div>
                  </div>

                  {/* Animowana linia skanowania */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 relative overflow-hidden">
                      <div className="absolute w-full h-1 bg-blue-500 animate-pulse"
                        style={{
                          animation: 'scan 2s infinite',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Uruchamianie kamery...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Skieruj kamerę na kod kreskowy produktu kosmetycznego
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Anuluj
                </Button>

                <Button
                  onClick={captureFrame}
                  disabled={!isScanning}
                  className="flex-1"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Skanuj
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 Wskazówka: Dla lepszych rezultatów skanuj w dobrym oświetleniu i trzymaj telefon stabilnie
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
