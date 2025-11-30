import { useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { IMaskInput } from "react-imask";

const PHONE_MASK = "+998 (00) 000-00-00";
const MIN_PASSWORD_LENGTH = 6;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "+998",
    password: "",
  });
  const [errors, setErrors] = useState({
    phoneNumber: "",
    password: "",
  });

  const validateForm = useCallback(() => {
    const newErrors = {};
    const rawPhone = formData.phoneNumber.replace(/\D/g, "");

    if (rawPhone.length !== 12 || !rawPhone.startsWith("998")) {
      newErrors.phoneNumber = "To'g'ri telefon raqam kiriting";
    }

    if (!formData.password) {
      newErrors.password = "Parol kiritish majburiy";
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Parol kamida ${MIN_PASSWORD_LENGTH} ta belgidan iborat bo'lishi kerak`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handlePhoneAccept = useCallback(
    (value) => {
      setFormData((prev) => ({ ...prev, phoneNumber: value }));
      if (errors.phoneNumber) {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    },
    [errors.phoneNumber]
  );

  const handlePhoneKeyDown = useCallback((e) => {
    const target = e.target;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;

    if (e.key === "Backspace" || e.key === "Delete") {
      if (selectionStart !== null && selectionStart <= 4) {
        e.preventDefault();
        return;
      }

      if (
        selectionStart !== selectionEnd &&
        selectionStart !== null &&
        selectionStart < 4
      ) {
        e.preventDefault();
        return;
      }
    }

    if (
      (e.key === "ArrowLeft" || e.key === "Home") &&
      selectionStart !== null &&
      selectionStart <= 4
    ) {
      e.preventDefault();
      target.setSelectionRange(4, 4);
    }
  }, []);

  const handlePhoneBeforeInput = useCallback((e) => {
    const target = e.target;
    const selectionStart = target.selectionStart;

    if (selectionStart !== null && selectionStart < 4) {
      e.preventDefault();
    }
  }, []);

  const handlePasswordChange = useCallback(
    (e) => {
      setFormData((prev) => ({ ...prev, password: e.target.value }));
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    },
    [errors.password]
  );

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, barcha maydonlarni to'g'ri to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const rawPhone = "+" + formData.phoneNumber.replace(/\D/g, "");
      const result = await login(rawPhone, formData.password);

      if (!result.success) {
        toast({
          title: "Xatolik",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Tizimga kirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Saipov Group</CardTitle>
          <CardDescription className="text-center">
            Admin panelga kirish uchun ma'lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefon raqami</Label>
              <IMaskInput
                id="phoneNumber"
                name="phoneNumber"
                mask={PHONE_MASK}
                value={formData.phoneNumber}
                unmask={false}
                onAccept={handlePhoneAccept}
                onKeyDown={handlePhoneKeyDown}
                onBeforeInput={handlePhoneBeforeInput}
                lazy={false}
                autofix={true}
                placeholder="+998 (90) 123-45-67"
                className={`flex h-10 w-full rounded-md border ${
                  errors.phoneNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
