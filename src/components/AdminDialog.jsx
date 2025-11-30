import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "../services/api"
import { Loader2 } from "lucide-react"

const AdminDialog = ({ open, onOpenChange, admin, onSuccess }) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
  })

  useEffect(() => {
    if (admin) {
      setFormData({
        fullName: admin.fullName || "",
        phoneNumber: admin.phoneNumber || "",
        password: "", // Always empty for security
      })
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        password: "",
      })
    }
  }, [admin, open])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!admin && !formData.password) {
      toast({
        title: "Xatolik",
        description: "Yangi admin uchun parol majburiy",
        variant: "destructive",
      })
      return
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Xatolik",
        description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      }

      // Only include password if it's provided
      if (formData.password) {
        submitData.password = formData.password
      }

      if (admin) {
        await apiService.updateAdmin(admin._id, submitData)
        toast({
          title: "Muvaffaqiyat",
          description: "Admin muvaffaqiyatli yangilandi",
        })
      } else {
        await apiService.createAdmin(submitData)
        toast({
          title: "Muvaffaqiyat",
          description: "Admin muvaffaqiyatli yaratildi",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error.response?.data?.message || "Adminni saqlashda xatolik",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{admin ? "Adminni tahrirlash" : "Yangi admin qo'shish"}</DialogTitle>
          <DialogDescription>Admin ma'lumotlarini kiriting. Barcha majburiy maydonlarni to'ldiring.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">To'liq ism *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Telefon raqami *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+998901234567"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Parol {admin ? "(o'zgartirish uchun)" : "*"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required={!admin}
                placeholder={admin ? "Yangi parol (ixtiyoriy)" : "Parol"}
              />
              {admin && <p className="text-xs text-gray-500">Parolni o'zgartirmaslik uchun bo'sh qoldiring</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {admin ? "Yangilash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AdminDialog
