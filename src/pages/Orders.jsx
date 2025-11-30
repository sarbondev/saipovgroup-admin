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
import { Search, Eye, Phone, MapPin, Calendar, Package } from "lucide-react";
import OrderDialog from "../components/OrderDialog";

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: "", label: "Barcha holatlar" },
    { value: "not_contacted", label: "Bog'lanilmagan" },
    { value: "in_process", label: "Jarayonda" },
    { value: "delivered", label: "Yetkazilgan" },
    { value: "cancelled", label: "Bekor qilingan" },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders();

      setOrders(response.orders || []);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Buyurtmalarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      not_contacted: "Bog'lanilmagan",
      in_process: "Jarayonda",
      delivered: "Yetkazilgan",
      cancelled: "Bekor qilingan",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      not_contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_process: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer?.phoneNumber?.includes(searchTerm);

    const matchesStatus = !selectedStatus || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyurtmalar</h1>
          <p className="text-muted-foreground">
            Barcha buyurtmalarni ko'ring va boshqaring
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buyurtma yoki mijoz qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {order.orderNumber}
                      </CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {order.items?.length || 0} ta mahsulot
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ko'rish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Mijoz ma'lumotlari
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-medium">{order.customer?.fullName}</p>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.customer?.phoneNumber}
                      </p>
                      {order.customer?.address && (
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.customer.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Buyurtma ma'lumotlari
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Jami summa:{" "}
                        <span className="font-medium">
                          $
                          {order.items?.reduce(
                            (sum, item) => sum + (item.totalPrice || 0),
                            0
                          ) || 0}
                        </span>
                      </p>
                      <p>
                        Mahsulotlar soni:{" "}
                        <span className="font-medium">
                          {order.items?.length || 0}
                        </span>
                      </p>
                    </div>
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
              Buyurtmalar topilmadi
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Hozircha buyurtmalar yo'q yoki qidiruv natijasida hech narsa
              topilmadi.
            </p>
          </CardContent>
        </Card>
      )}

      <OrderDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />
    </div>
  );
};

export default Orders;
