import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  getBrands, 
  createBrand, 
  updateBrand, 
  deleteBrand, 
  BrandProfile 
} from "@/lib/api";
import { 
  Plus, 
  Briefcase, 
  Trash2, 
  Edit2, 
  Target, 
  Volume2, 
  AlertCircle,
  Gem,
  Settings2,
  ChevronRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const tones = [
  "Professional",
  "Friendly",
  "Luxury",
  "Urgent",
  "Playful",
  "Authoritative",
  "Minimalist",
  "Direct"
];

export default function BrandProfiles() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    tone: "Professional",
    targetAudience: "",
    brandVoice: "",
    bannedWords: "",
    keySellingPoints: ""
  });

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<BrandProfile, "id" | "createdAt" | "updatedAt">) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand created successfully");
      closeDialog();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandProfile> }) => updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated successfully");
      closeDialog();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEdit = (brand: BrandProfile) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      industry: brand.industry || "",
      tone: brand.tone,
      targetAudience: brand.targetAudience || "",
      brandVoice: brand.brandVoice || "",
      bannedWords: brand.bannedWords.join(", "),
      keySellingPoints: brand.keySellingPoints.join(", ")
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBrand(null);
    setFormData({
      name: "",
      industry: "",
      tone: "Professional",
      targetAudience: "",
      brandVoice: "",
      bannedWords: "",
      keySellingPoints: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      bannedWords: formData.bannedWords.split(",").map(w => w.trim()).filter(Boolean),
      keySellingPoints: formData.keySellingPoints.split(",").map(w => w.trim()).filter(Boolean),
    };

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <AppLayout>
      <div className="app-content">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Brand Identity Memory</h1>
          <p className="page-description">Manage your brand's unique voice, audience, and positioning.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingBrand ? 'Edit Brand Profile' : 'Create Brand Profile'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Name</label>
                  <Input 
                    placeholder="e.g. Acme Corp" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Input 
                    placeholder="e.g. SaaS, eCommerce" 
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Default Writing Tone</label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(val) => setFormData({ ...formData, tone: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Target Audience
                </label>
                <Textarea 
                  placeholder="Describe your ideal customers, their pain points and demographics..."
                  className="min-h-[100px]"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" /> Brand Voice & Guidelines
                </label>
                <Textarea 
                  placeholder="How should your brand sound? Are there specific phrases or styles to follow?"
                  className="min-h-[100px]"
                  value={formData.brandVoice}
                  onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" /> Banned Words (comma separated)
                </label>
                <Input 
                  placeholder="cheap, discount, guarantee..." 
                  value={formData.bannedWords}
                  onChange={(e) => setFormData({ ...formData, bannedWords: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Gem className="w-4 h-4 text-warning" /> Key Selling Points (comma separated)
                </label>
                <Input 
                  placeholder="Award winning support, 24h shipping, Organic materials..." 
                  value={formData.keySellingPoints}
                  onChange={(e) => setFormData({ ...formData, keySellingPoints: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-4 border-t gap-2">
                <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBrand ? 'Save Changes' : 'Create Brand Profile'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse bg-background-surface/50 h-[300px]" />
          ))
        ) : brands?.data?.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-background-surface/5 border border-dashed border-border-subtle rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No brand profiles yet</h3>
            <p className="text-foreground-muted mb-8 max-w-sm">Define your brand identity to automatically inject context into every AI generation.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create Your First Brand</Button>
          </div>
        ) : (
          brands?.data?.map((brand) => (
            <Card key={brand.id} variant="default" className="group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(brand)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(brand.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{brand.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">{brand.tone}</Badge>
                  {brand.industry && <span>{brand.industry}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {brand.targetAudience && (
                  <div className="text-sm">
                    <span className="font-medium block mb-1 text-foreground-subtle uppercase text-[10px] tracking-wider">Audience</span>
                    <p className="text-foreground-muted line-clamp-2">{brand.targetAudience}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {brand.bannedWords.length > 0 && (
                        <div className="w-7 h-7 rounded-full bg-destructive/10 border-2 border-background flex items-center justify-center" title="Banned words defined">
                          <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                        </div>
                      )}
                      {brand.keySellingPoints.length > 0 && (
                        <div className="w-7 h-7 rounded-full bg-warning/10 border-2 border-background flex items-center justify-center" title="Key selling points defined">
                          <Gem className="w-3.5 h-3.5 text-warning" />
                        </div>
                      )}
                      <div className="w-7 h-7 rounded-full bg-success/10 border-2 border-background flex items-center justify-center" title="Voice instructions active">
                        <Volume2 className="w-3.5 h-3.5 text-success" />
                      </div>
                   </div>
                   <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleEdit(brand)}>
                     Configure <ChevronRight className="w-3 h-3" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </AppLayout>
  );
}
