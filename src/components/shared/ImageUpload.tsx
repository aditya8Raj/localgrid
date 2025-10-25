"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string | null;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  onUpload,
  currentImage,
  label = "Upload Image",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      // Create FormData and upload to Cloudinary via API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setPreview(data.url);
      onUpload(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>

      {preview ? (
        <div className="relative w-full h-48 rounded-lg border overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="relative w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <p className="text-sm">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 mb-2" />
                <p className="text-sm">Click to upload image</p>
                <p className="text-xs mt-1">Max 5MB • PNG, JPG, WEBP</p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
}
