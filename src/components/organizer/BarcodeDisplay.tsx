import { useEffect, useRef } from 'react';
// @ts-ignore
import Barcode from 'react-barcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BarcodeDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: string;
  locationName: string;
}

export const BarcodeDisplay = ({ open, onOpenChange, barcode, locationName }: BarcodeDisplayProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = canvasRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${locationName}-barcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Barcode for {locationName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div ref={canvasRef} className="flex justify-center bg-white p-4 rounded-lg">
            <Barcode value={barcode} format="CODE128" width={2} height={80} />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Scan this barcode to view items in this location
          </p>

          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download Barcode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
