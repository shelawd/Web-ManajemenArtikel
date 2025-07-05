'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  itemType?: string;
}

export default function DeleteDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType = "category" 
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await onConfirm();
      // Dialog will be closed by the parent component after successful deletion
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        `Failed to delete ${itemType}. Please try again.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setErrorMessage(null);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <p className="mb-2">
              Are you sure you want to delete the 
              <span className="font-semibold text-gray-900"> {itemName} </span> 
              {itemType}?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. This will permanently delete the {itemType} and may affect associated articles.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={isDeleting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete {itemType}
              </div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
