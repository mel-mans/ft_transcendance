import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Home, Upload, Trash2 } from "lucide-react";
import CurrencySelect from "@/components/CurrencySelect";

interface ListingFormData {
  title: string;
  location: string;
  price: string;
  availableDate: string;
  roommatesWanted: number;
  roommatesFound: number;
  description: string;
  amenities: string[];
  images: string[];
}

const AMENITY_OPTIONS = [
  { emoji: "📶", label: "WiFi" },
  { emoji: "🍳", label: "Kitchen" },
  { emoji: "🧺", label: "Laundry" },
  { emoji: "🚇", label: "Metro nearby" },
  { emoji: "🌳", label: "Garden" },
  { emoji: "🅿️", label: "Parking" },
  { emoji: "🐕", label: "Pets OK" },
  { emoji: "🏋️", label: "Gym" },
  { emoji: "❄️", label: "AC" },
  { emoji: "🔒", label: "Secure" },
];

interface CreateListingFormProps {
  onClose: () => void;
  onPublish?: (
    listing: ListingFormData & { currency: string },
    imageFiles: File[]
  ) => Promise<void> | void;
  existingListing?: ListingFormData & { currency: string };
}

const CreateListingForm = ({ onClose, onPublish, existingListing }: CreateListingFormProps) => {
  const [currency, setCurrency] = useState(existingListing?.currency || "EUR");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState<ListingFormData>(
    existingListing || {
      title: "",
      location: "",
      price: "0",
      availableDate: "",
      roommatesWanted: 2,
      roommatesFound: 0,
      description: "",
      amenities: [],
      images: [],
    }
  );

  const toggleAmenity = (label: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter((a) => a !== label)
        : [...prev.amenities, label],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files).slice(0, Math.max(0, 6 - form.images.length));
    if (selectedFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate photos for new listings
    if (!existingListing && imageFiles.length < 2) {
      setSubmitError("Please upload at least 2 photos for a new listing.");
      return;
    }
    if (imageFiles.length > 6) {
      setSubmitError("Maximum 6 photos allowed.");
      return;
    }

    setSubmitting(true);
    try {
      await onPublish?.({ ...form, currency }, imageFiles);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Could not save listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          {existingListing ? "Edit Listing" : "Create a Listing"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="e.g. Cozy Apartment near Campus"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Location & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                placeholder="e.g. Paris 13e"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price</label>
              <div className="flex gap-2">
                <CurrencySelect value={currency} onChange={setCurrency} />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 650"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Roommates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Available Date</label>
              <Input
                type="date"
                value={form.availableDate}
                onChange={(e) => setForm({ ...form, availableDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Spots Total</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.roommatesWanted}
                onChange={(e) => setForm({ ...form, roommatesWanted: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Spots Filled</label>
              <Input
                type="number"
                min={0}
                max={form.roommatesWanted}
                value={form.roommatesFound}
                onChange={(e) => setForm({ ...form, roommatesFound: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Tell potential roommates about the place..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Images ({form.images.length}/6)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
              {form.images.length < 6 && (
                <label className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Add image
                    </span>
                  </div>
                </label>
              )}
            </div>
            {form.images.length === 6 && (
              <p className="text-xs text-muted-foreground">Maximum 6 images reached</p>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <button
                  key={amenity.label}
                  type="button"
                  onClick={() => toggleAmenity(amenity.label)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    form.amenities.includes(amenity.label)
                      ? "bg-primary/20 border-primary/50 text-foreground"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <span>{amenity.emoji}</span>
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button type="submit" className="w-full gap-2" disabled={submitting}>
            <Plus className="w-4 h-4" />
            {submitting ? "Saving..." : existingListing ? "Save Changes" : "Publish Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;
