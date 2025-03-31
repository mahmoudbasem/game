import { useState, useRef } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Gamepad2, Plus, Edit, Trash2, Tag, Upload, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Game {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

interface GameFormData {
  name: string;
  imageUrl: string;
  description: string;
}

export default function GamesPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    name: "",
    imageUrl: "",
    description: ""
  });
  
  // File upload references and state
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch all games
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    queryFn: getQueryFn<Game[]>({
      on401: "returnNull",
    }),
  });

  // Price option form state
  const [priceFormData, setPriceFormData] = useState({
    gameId: "",
    currency: "",
    amount: "",
    price: "",
    description: ""
  });
  const [editingPriceOption, setEditingPriceOption] = useState<any | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isEditPriceDialogOpen, setIsEditPriceDialogOpen] = useState(false);
  
  // Discount form state
  const [discountFormData, setDiscountFormData] = useState({
    code: "",
    discountPercent: "",
    gameId: "",
    expiresAt: "",
    maxUses: "",
    userId: ""
  });
  const [isGeneralDiscountOpen, setIsGeneralDiscountOpen] = useState(false);
  const [isUserDiscountOpen, setIsUserDiscountOpen] = useState(false);
  const [isMultipleUsers, setIsMultipleUsers] = useState(false);
  
  // Fetch users for discount selection
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });

  // Fetch price options per game
  const { data: priceOptions = [] } = useQuery<any[]>({
    queryKey: ["/api/price-options"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });
  
  // Create price option mutation
  const createPriceOptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/price-options", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-options"] });
      setIsPriceDialogOpen(false);
      setPriceFormData({
        gameId: "",
        currency: "",
        amount: "",
        price: "",
        description: ""
      });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة خيار السعر بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء إضافة خيار السعر",
        variant: "destructive",
      });
    },
  });
  
  // Update price option mutation
  const updatePriceOptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/price-options/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-options"] });
      setIsEditPriceDialogOpen(false);
      setEditingPriceOption(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث خيار السعر بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء تحديث خيار السعر",
        variant: "destructive",
      });
    },
  });
  
  // Delete price option mutation
  const deletePriceOptionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/price-options/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "حدث خطأ أثناء حذف خيار السعر");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-options"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف خيار السعر بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء حذف خيار السعر",
        variant: "destructive",
      });
    },
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (data: GameFormData) => {
      const res = await apiRequest("POST", "/api/admin/games", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", imageUrl: "", description: "" });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة اللعبة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء إضافة اللعبة",
        variant: "destructive",
      });
    },
  });

  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Game> }) => {
      const res = await apiRequest("PATCH", `/api/admin/games/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsEditDialogOpen(false);
      setEditingGame(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث اللعبة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء تحديث اللعبة",
        variant: "destructive",
      });
    },
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/games/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "حدث خطأ أثناء حذف اللعبة");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف اللعبة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء حذف اللعبة",
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle file uploading (in real implementation)
  const uploadFile = async (file: File): Promise<string> => {
    // في التطبيق الفعلي، ستقوم هنا برفع الملف إلى خادم أو خدمة تخزين
    // وإرجاع رابط URL للملف المرفوع
    
    // لأغراض العرض التوضيحي، نعود برابط URL محلي مؤقت
    return URL.createObjectURL(file);
    
    // مثال لما قد يبدو عليه الرفع الفعلي:
    /*
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result.imageUrl;
    */
  };

  // Handle create form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile) {
      try {
        // رفع الملف وتحديث عنوان URL للصورة
        const uploadedImageUrl = await uploadFile(selectedFile);
        
        // إذا أردنا تحديث البيانات بعنوان URL الحقيقي المرفوع
        const updatedFormData = {
          ...formData,
          imageUrl: uploadedImageUrl
        };
        
        createGameMutation.mutate(updatedFormData);
        // إعادة تعيين الملف المحدد
        setSelectedFile(null);
      } catch (error) {
        toast({
          title: "خطأ في رفع الصورة",
          description: "حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } else {
      // إذا لم يتم اختيار ملف، نستمر بالبيانات الحالية
      createGameMutation.mutate(formData);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGame) {
      if (selectedFile) {
        try {
          // رفع الملف وتحديث عنوان URL للصورة
          const uploadedImageUrl = await uploadFile(selectedFile);
          
          // إذا أردنا تحديث البيانات بعنوان URL الحقيقي المرفوع
          const updatedFormData = {
            ...formData,
            imageUrl: uploadedImageUrl
          };
          
          updateGameMutation.mutate({
            id: editingGame.id,
            data: updatedFormData
          });
          
          // إعادة تعيين الملف المحدد
          setSelectedFile(null);
        } catch (error) {
          toast({
            title: "خطأ في رفع الصورة",
            description: "حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        // إذا لم يتم اختيار ملف، نستمر بالبيانات الحالية
        updateGameMutation.mutate({
          id: editingGame.id,
          data: formData
        });
      }
    }
  };

  // Open edit dialog with game data
  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      imageUrl: game.imageUrl || "",
      description: game.description || ""
    });
    setIsEditDialogOpen(true);
  };

  // Count price options for a game
  const getPriceOptionsCount = (gameId: number) => {
    return priceOptions.filter((option: any) => option.gameId === gameId).length;
  };
  
  // Handle file selection for create form
  const handleCreateFileSelect = () => {
    createFileInputRef.current?.click();
  };
  
  // Handle file selection for edit form
  const handleEditFileSelect = () => {
    editFileInputRef.current?.click();
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a local URL for the file
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
      
      // In a real implementation, you would upload the file to a server here
      toast({
        title: "تم اختيار الصورة",
        description: "تم اختيار الصورة بنجاح. سيتم رفعها عند حفظ اللعبة.",
      });
    }
  };
  
  // Handle price option input changes
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('price-', '');
    setPriceFormData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  // Handle price option form submission
  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPriceOptionMutation.mutate({
      gameId: parseInt(priceFormData.gameId),
      currency: priceFormData.currency,
      amount: parseInt(priceFormData.amount),
      price: parseFloat(priceFormData.price),
      description: priceFormData.description || null
    });
  };
  
  // Open edit price option dialog with data
  const openEditPriceDialog = (option: any) => {
    setEditingPriceOption(option);
    setPriceFormData({
      gameId: option.gameId.toString(),
      currency: option.currency,
      amount: option.amount.toString(),
      price: option.price.toString(),
      description: option.description || ""
    });
    setIsEditPriceDialogOpen(true);
  };
  
  // Handle edit price option form submission
  const handleEditPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPriceOption) {
      updatePriceOptionMutation.mutate({
        id: editingPriceOption.id,
        data: {
          gameId: parseInt(priceFormData.gameId),
          currency: priceFormData.currency,
          amount: parseInt(priceFormData.amount),
          price: parseFloat(priceFormData.price),
          description: priceFormData.description || null
        }
      });
    }
  };
  
  // Confirm delete price option
  const confirmDeletePriceOption = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف خيار السعر هذا؟')) {
      deletePriceOptionMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة الألعاب</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> إضافة لعبة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة لعبة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل معلومات اللعبة الجديدة هنا
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right">اسم اللعبة</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-right">صورة اللعبة</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg أو رفع صورة"
                          className="text-right"
                          dir="rtl"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleCreateFileSelect}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        
                        <input
                          ref={createFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, false)}
                          className="hidden"
                        />
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="relative h-32 w-32 rounded border overflow-hidden">
                          {formData.imageUrl ? (
                            <img 
                              src={formData.imageUrl} 
                              alt="معاينة صورة اللعبة" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <Image className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-right">الوصف</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createGameMutation.isPending}>
                    {createGameMutation.isPending ? "جاري الإضافة..." : "إضافة اللعبة"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6" />
              إدارة الألعاب وخيارات الأسعار
            </CardTitle>
            <CardDescription>
              يمكنك إضافة وتعديل وحذف الألعاب وخيارات الأسعار الخاصة بها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="games">
              <TabsList className="mb-6">
                <TabsTrigger value="games">الألعاب</TabsTrigger>
                <TabsTrigger value="prices">خيارات الأسعار</TabsTrigger>
                <TabsTrigger value="discounts">الخصومات</TabsTrigger>
              </TabsList>

              <TabsContent value="games" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الإجراءات</TableHead>
                        <TableHead className="text-right">الصورة</TableHead>
                        <TableHead className="text-right">خيارات الأسعار</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">اللعبة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            جاري التحميل...
                          </TableCell>
                        </TableRow>
                      ) : games.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            لا توجد ألعاب متاحة حالياً
                          </TableCell>
                        </TableRow>
                      ) : (
                        games.map((game: Game) => (
                          <TableRow key={game.id}>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(game)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                  <AlertDialogContent dir="rtl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>هل أنت متأكد من حذف هذه اللعبة؟</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        سيتم حذف اللعبة وجميع خيارات الأسعار المرتبطة بها.
                                        لا يمكن حذف الألعاب التي لها طلبات مرتبطة بها.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteGameMutation.mutate(game.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        حذف
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-12 w-12 rounded overflow-hidden">
                                <img 
                                  src={game.imageUrl || "https://placehold.co/100x100?text=Game"} 
                                  alt={game.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>{getPriceOptionsCount(game.id)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                متاح
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {game.description || "لا يوجد وصف"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">{game.name}</div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="prices" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الإجراءات</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">العملة</TableHead>
                        <TableHead className="text-right">اللعبة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceOptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            لا توجد خيارات أسعار متاحة حالياً
                          </TableCell>
                        </TableRow>
                      ) : (
                        priceOptions.map((option: any) => {
                          const game = games.find(g => g.id === option.gameId);
                          return (
                            <TableRow key={option.id}>
                              <TableCell>
                                <div className="flex space-x-2 space-x-reverse">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditPriceDialog(option)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                    <AlertDialogContent dir="rtl">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>هل أنت متأكد من حذف خيار السعر هذا؟</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          سيتم حذف خيار السعر نهائياً ولا يمكن استرجاعه.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => deletePriceOptionMutation.mutate(option.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          حذف
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{option.description || "لا يوجد وصف"}</TableCell>
                              <TableCell className="text-right">{option.price} جنيه</TableCell>
                              <TableCell className="text-right">{option.amount}</TableCell>
                              <TableCell className="text-right">{option.currency}</TableCell>
                              <TableCell className="text-right font-medium">{game?.name || "غير معروف"}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      إضافة خيار سعر
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>إضافة خيار سعر جديد</DialogTitle>
                      <DialogDescription>
                        أضف خيار سعر جديد للعبة محددة
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePriceSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="price-gameId" className="text-right">اللعبة</Label>
                          <select
                            id="price-gameId"
                            value={priceFormData.gameId}
                            onChange={handlePriceInputChange}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-right"
                            dir="rtl"
                            required
                          >
                            <option value="">اختر اللعبة</option>
                            {games.map((game) => (
                              <option key={game.id} value={game.id}>{game.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price-currency" className="text-right">العملة</Label>
                          <Input
                            id="price-currency"
                            value={priceFormData.currency}
                            onChange={handlePriceInputChange}
                            placeholder="UC"
                            className="text-right"
                            dir="rtl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price-amount" className="text-right">الكمية</Label>
                          <Input
                            id="price-amount"
                            type="number"
                            min="1"
                            value={priceFormData.amount}
                            onChange={handlePriceInputChange}
                            placeholder="60"
                            className="text-right"
                            dir="rtl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price-price" className="text-right">السعر (جنيه)</Label>
                          <Input
                            id="price-price"
                            type="number"
                            min="1"
                            step="0.01"
                            value={priceFormData.price}
                            onChange={handlePriceInputChange}
                            placeholder="100"
                            className="text-right"
                            dir="rtl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price-description" className="text-right">الوصف (اختياري)</Label>
                          <Textarea
                            id="price-description"
                            value={priceFormData.description}
                            onChange={handlePriceInputChange}
                            placeholder="وصف مختصر للباقة"
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createPriceOptionMutation.isPending}>
                          {createPriceOptionMutation.isPending ? "جاري الإضافة..." : "إضافة خيار السعر"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="discounts" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الإجراءات</TableHead>
                        <TableHead className="text-right">عدد المستخدمين</TableHead>
                        <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                        <TableHead className="text-right">المستخدم المخصص</TableHead>
                        <TableHead className="text-right">اللعبة</TableHead>
                        <TableHead className="text-right">نسبة الخصم</TableHead>
                        <TableHead className="text-right">الكود</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          لا توجد أكواد خصم متاحة حالياً
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <Dialog open={isGeneralDiscountOpen} onOpenChange={setIsGeneralDiscountOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-1">
                        <Tag className="h-4 w-4" />
                        اضافة كود خصم عام
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>إضافة كود خصم عام</DialogTitle>
                        <DialogDescription>
                          أضف كود خصم عام يمكن استخدامه على جميع الأسعار
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        // هنا سيتم إضافة كود لإرسال البيانات
                        toast({
                          title: "تم إنشاء كود الخصم",
                          description: `تم إنشاء كود الخصم ${discountFormData.code} بنجاح`
                        });
                        setIsGeneralDiscountOpen(false);
                        // إعادة تعيين الحقول
                        setDiscountFormData({
                          code: "",
                          discountPercent: "",
                          gameId: "",
                          expiresAt: "",
                          maxUses: "",
                          userId: ""
                        });
                      }}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="discount-code" className="text-right">كود الخصم</Label>
                            <Input
                              id="discount-code"
                              placeholder="SALE50"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.code}
                              onChange={(e) => setDiscountFormData({...discountFormData, code: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount-percentage" className="text-right">نسبة الخصم (%)</Label>
                            <Input
                              id="discount-percentage"
                              type="number"
                              min="1"
                              max="99"
                              placeholder="10"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.discountPercent}
                              onChange={(e) => setDiscountFormData({...discountFormData, discountPercent: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount-game" className="text-right">اللعبة (اختياري)</Label>
                            <select
                              id="discount-game"
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-right"
                              dir="rtl"
                              value={discountFormData.gameId}
                              onChange={(e) => setDiscountFormData({...discountFormData, gameId: e.target.value})}
                            >
                              <option value="">جميع الألعاب</option>
                              {games.map((game) => (
                                <option key={game.id} value={game.id}>{game.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount-expiry" className="text-right">تاريخ الانتهاء</Label>
                            <Input
                              id="discount-expiry"
                              type="date"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.expiresAt}
                              onChange={(e) => setDiscountFormData({...discountFormData, expiresAt: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount-uses" className="text-right">عدد مرات الاستخدام</Label>
                            <Input
                              id="discount-uses"
                              type="number"
                              min="1"
                              placeholder="10"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.maxUses}
                              onChange={(e) => setDiscountFormData({...discountFormData, maxUses: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">إضافة الكود</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isUserDiscountOpen} onOpenChange={setIsUserDiscountOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-1">
                        <Tag className="h-4 w-4" />
                        اضافة كود خصم مخصص
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>إضافة كود خصم لمستخدم محدد</DialogTitle>
                        <DialogDescription>
                          أضف كود خصم يمكن استخدامه بواسطة مستخدم محدد فقط
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        // هنا سيتم إضافة كود لإرسال البيانات
                        toast({
                          title: "تم إنشاء كود الخصم",
                          description: `تم إنشاء كود الخصم ${discountFormData.code} للمستخدم المحدد بنجاح`
                        });
                        setIsUserDiscountOpen(false);
                        // إعادة تعيين الحقول
                        setDiscountFormData({
                          code: "",
                          discountPercent: "",
                          gameId: "",
                          expiresAt: "",
                          maxUses: "",
                          userId: ""
                        });
                        setIsMultipleUsers(false);
                      }}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="user-discount-code" className="text-right">كود الخصم</Label>
                            <Input
                              id="user-discount-code"
                              placeholder="USER50"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.code}
                              onChange={(e) => setDiscountFormData({...discountFormData, code: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-discount-percentage" className="text-right">نسبة الخصم (%)</Label>
                            <Input
                              id="user-discount-percentage"
                              type="number"
                              min="1"
                              max="99"
                              placeholder="15"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.discountPercent}
                              onChange={(e) => setDiscountFormData({...discountFormData, discountPercent: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox 
                                  id="multiple-users" 
                                  checked={isMultipleUsers}
                                  onCheckedChange={(checked) => setIsMultipleUsers(checked === true)}
                                />
                                <Label htmlFor="multiple-users" className="text-sm">اختيار عدة مستخدمين</Label>
                              </div>
                              <Label htmlFor="user-id" className="text-right">اختيار المستخدمين</Label>
                            </div>
                            {isMultipleUsers ? (
                              <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                                {users.map((user) => (
                                  <div key={user.id} className="flex items-center space-x-2 space-x-reverse my-1">
                                    <Checkbox 
                                      id={`user-${user.id}`} 
                                      onCheckedChange={(checked) => {
                                        // هنا يمكن إضافة منطق التعامل مع اختيار متعدد
                                        console.log(`User ${user.id} selected: ${checked}`);
                                      }}
                                    />
                                    <Label htmlFor={`user-${user.id}`} className="text-sm">
                                      {user.id} - {user.username}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Select
                                dir="rtl"
                                onValueChange={(value) => setDiscountFormData({...discountFormData, userId: value})}
                              >
                                <SelectTrigger className="text-right">
                                  <SelectValue placeholder="اختر مستخدم" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.username} - {user.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-discount-game" className="text-right">اللعبة (اختياري)</Label>
                            <select
                              id="user-discount-game"
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-right"
                              dir="rtl"
                              value={discountFormData.gameId}
                              onChange={(e) => setDiscountFormData({...discountFormData, gameId: e.target.value})}
                            >
                              <option value="">جميع الألعاب</option>
                              {games.map((game) => (
                                <option key={game.id} value={game.id}>{game.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-discount-expiry" className="text-right">تاريخ الانتهاء</Label>
                            <Input
                              id="user-discount-expiry"
                              type="date"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.expiresAt}
                              onChange={(e) => setDiscountFormData({...discountFormData, expiresAt: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-discount-uses" className="text-right">عدد مرات الاستخدام</Label>
                            <Input
                              id="user-discount-uses"
                              type="number"
                              min="1"
                              placeholder="5"
                              className="text-right"
                              dir="rtl"
                              value={discountFormData.maxUses}
                              onChange={(e) => setDiscountFormData({...discountFormData, maxUses: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">إضافة الكود</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Price Option Dialog */}
      <Dialog open={isEditPriceDialogOpen} onOpenChange={setIsEditPriceDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل خيار السعر</DialogTitle>
            <DialogDescription>
              قم بتعديل معلومات خيار السعر
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPriceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price-gameId" className="text-right">اللعبة</Label>
                <select
                  id="price-gameId"
                  value={priceFormData.gameId}
                  onChange={handlePriceInputChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-right"
                  dir="rtl"
                  required
                >
                  <option value="">اختر اللعبة</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-currency" className="text-right">العملة</Label>
                <Input
                  id="price-currency"
                  value={priceFormData.currency}
                  onChange={handlePriceInputChange}
                  placeholder="UC"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-amount" className="text-right">الكمية</Label>
                <Input
                  id="price-amount"
                  type="number"
                  min="1"
                  value={priceFormData.amount}
                  onChange={handlePriceInputChange}
                  placeholder="60"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-price" className="text-right">السعر (جنيه)</Label>
                <Input
                  id="price-price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={priceFormData.price}
                  onChange={handlePriceInputChange}
                  placeholder="100"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-description" className="text-right">الوصف (اختياري)</Label>
                <Textarea
                  id="price-description"
                  value={priceFormData.description}
                  onChange={handlePriceInputChange}
                  placeholder="وصف مختصر للباقة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updatePriceOptionMutation.isPending}>
                {updatePriceOptionMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل اللعبة</DialogTitle>
            <DialogDescription>
              قم بتعديل معلومات اللعبة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-right">اسم اللعبة</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl" className="text-right">صورة اللعبة</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg أو رفع صورة"
                      className="text-right"
                      dir="rtl"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleEditFileSelect}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="relative h-32 w-32 rounded border overflow-hidden">
                      {formData.imageUrl ? (
                        <img 
                          src={formData.imageUrl} 
                          alt="معاينة صورة اللعبة" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-right">الوصف</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateGameMutation.isPending}>
                {updateGameMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}