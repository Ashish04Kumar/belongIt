import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanBarcode, X } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (barcode: string) => void;
}

export const BarcodeScanner = ({ open, onOpenChange, onScanSuccess }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (open && !scannerRef.current) {
      scannerRef.current = new Html5Qrcode("barcode-reader");
    }

    if (open && scannerRef.current && !isScanning) {
      startScanning();
    }

    return () => {
      if (scannerRef.current && isScanning) {
        stopScanning();
      }
    };
  }, [open]);

  const startScanning = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
          onOpenChange(false);
        },
        (errorMessage) => {
          // Scan error, ignore
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            Scan Location Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            id="barcode-reader" 
            className="w-full rounded-lg overflow-hidden border border-border"
          />
          <p className="text-sm text-muted-foreground text-center">
            Position the barcode within the frame to scan
          </p>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
