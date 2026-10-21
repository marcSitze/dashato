"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { MediaUploader } from "@/components/admin/media-uploader";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProductFormClientProps {
  initialData?: any;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  vendors: {
    id: string;
    businessName: string;
    store?: { name: string } | null;
  }[];
  isVendorUser?: boolean;
  userVendorId?: string;
  redirectPath?: string;
}

export function ProductFormClient({
  initialData,
  categories,
  brands,
  vendors,
  isVendorUser = false,
  userVendorId,
  redirectPath,
}: ProductFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryList, setCategoryList] = React.useState(categories);
  const [newCatModalOpen, setNewCatModalOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatDesc, setNewCatDesc] = React.useState('');
  const [isCreatingCat, setIsCreatingCat] = React.useState(false);

  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(
    initialData?.description || "",
  );
  const [shortDesc, setShortDesc] = React.useState(
    initialData?.shortDesc || "",
  );
  const [sku, setSku] = React.useState(
    initialData?.sku || `SKU-${Date.now().toString().substring(6)}`,
  );
  const [price, setPrice] = React.useState(
    initialData?.price?.toString() || "",
  );
  const [compareAtPrice, setCompareAtPrice] = React.useState(
    initialData?.compareAtPrice?.toString() || "",
  );
  const [categoryId, setCategoryId] = React.useState(
    initialData?.categories?.[0]?.categoryId || categories[0]?.id || "",
  );

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCat(true);
    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create category');
      }

      toast.success(`Category "${data.data.name}" created!`);
      setCategoryList((prev) => [...prev, data.data]);
      setCategoryId(data.data.id);
      setNewCatName('');
      setNewCatDesc('');
      setNewCatModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Category creation error');
    } finally {
      setIsCreatingCat(false);
    }
  };
  const [brandId, setBrandId] = React.useState(
    initialData?.brandId || brands[0]?.id || "",
  );
  const [vendorId, setVendorId] = React.useState(
    userVendorId || initialData?.vendorId || vendors[0]?.id || ""
  );
  const [status, setStatus] = React.useState(initialData?.status || "ACTIVE");
  const [quantity, setQuantity] = React.useState(
    initialData?.inventory?.quantity?.toString() || "20",
  );

  // Media URLs list (Images & Videos)
  const [images, setImages] = React.useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || [],
  );
  const [newImageUrl, setNewImageUrl] = React.useState("");

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !sku || !price || !categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        shortDesc,
        sku,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        brandId: brandId || null,
        vendorId,
        status,
        quantity: parseInt(quantity, 10),
        images: images.map((url, idx) => ({ url, isMain: idx === 0 })),
      };

      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement du produit");

      toast.success(
        initialData
          ? "Produit mis à jour avec succès !"
          : "Produit créé avec succès !",
      );
      const targetPath = redirectPath || (isVendorUser ? "/vendor/products" : "/admin/products");
      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl p-4 sm:p-8 border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Informations Générales sur le Produit
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Titre du Produit *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Apple MacBook Pro 16 M3 Max"
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SKU Produit *
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Statut de Publication
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                <option value="ACTIVE">ACTIF</option>
                <option value="PENDING_APPROVAL">EN ATTENTE D'APPROBATION</option>
                <option value="DRAFT">BROUILLON</option>
                <option value="ARCHIVED">ARCHIVÉ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description Complète *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Spécifications détaillées, caractéristiques et fonctionnalités..."
              required
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Tarification & Stock d'Inventaire
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Prix de Vente ($USD) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499.00"
                className="rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Prix Conseillé (MSRP)
              </label>
              <Input
                type="number"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="2799.00"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Quantité en Stock Disponible *
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Category, Brand, & Vendor */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Classification & Boutique Vendeur
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catégorie *
                </label>
                <button
                  type="button"
                  onClick={() => setNewCatModalOpen(true)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Ajouter Catégorie
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Marque
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Boutique Vendeur d'Expédition *
                </label>
                {(isVendorUser || userVendorId) && (
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Votre boutique
                  </span>
                )}
              </div>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                disabled={isVendorUser || !!userVendorId}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.store?.name || v.businessName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Media Gallery Manager */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Galerie Médias du Produit (Téléversement Supabase)
          </h3>

          <MediaUploader mediaUrls={images} onChange={setImages} />
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base px-8 shadow-lg shadow-amber-500/20 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" variant="white" className="mr-2" />
                <span>Enregistrement du produit...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>{initialData ? 'Mettre à jour le Produit' : 'Créer le Produit'}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick Add Category Dialog Modal */}
      <Dialog open={newCatModalOpen} onOpenChange={setNewCatModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Création Rapide de Catégorie
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ajoutez un nouveau rayon au catalogue pour classer vos produits.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickAddCategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nom de la Catégorie *
              </label>
              <Input
                type="text"
                required
                placeholder="ex: Audio & Son Spatial"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="h-10 text-sm rounded-xl font-bold bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description (Optionnelle)
              </label>
              <Input
                type="text"
                placeholder="Bref résumé des articles du rayon..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewCatModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isCreatingCat}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-6 shadow-sm"
              >
                {isCreatingCat ? (
                  <>
                    <Spinner size="sm" variant="primary" className="mr-2" />
                    <span>Création...</span>
                  </>
                ) : (
                  'Créer la Catégorie'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
