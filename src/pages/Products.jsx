"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "../services/api";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import ProductDialog from "../components/ProductDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const categories = [
    { value: "", label: "Barcha kategoriyalar" },
    { value: "bathrobe", label: "Xalat" },
    { value: "towel", label: "Sochiq" },
    { value: "set", label: "To'plam" },
    { value: "accessories", label: "Aksessuarlar" },
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const response = await apiService.getProducts(params);
      setProducts(response.data?.products || []);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteProduct(deleteProduct._id);
      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot muvaffaqiyatli o'chirildi",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
    setDeleteProduct(null);
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200";
    return imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:3000${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mahsulotlar</h1>
          <p className="text-muted-foreground">
            Mahsulotlarni boshqaring va yangilarini qo'shing
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowProductDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi mahsulot
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={getImageUrl(product.images?.[0]) || "/placeholder.svg"}
                  alt={product.title_uz}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.title_uz}</CardTitle>
                  <Badge variant="secondary">
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {product.description_uz}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">${product.price}</p>
                    <p className="text-sm text-muted-foreground">
                      Sklad: {product.stockQuantity} dona
                    </p>
                  </div>
                  <div className="text-right">
                    {product.sizes?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        O'lchamlar: {product.sizes.join(", ")}
                      </p>
                    )}
                    {product.colors?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Ranglar: {product.colors.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mahsulotlar topilmadi
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Hozircha mahsulotlar yo'q yoki qidiruv natijasida hech narsa
              topilmadi.
            </p>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowProductDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Birinchi mahsulotni qo'shing
            </Button>
          </CardContent>
        </Card>
      )}

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={editingProduct}
        onSuccess={() => {
          fetchProducts();
          setShowProductDialog(false);
          setEditingProduct(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Mahsulotni o'chirish"
        description={`"${deleteProduct?.title}" mahsulotini o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`}
      />
    </div>
  );
};

export default Products;
