import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { saveContent, SaveContentInput } from "@/lib/api";
import { toast } from "sonner";

interface SaveContentButtonProps {
  contentType: "blog" | "ad" | "product";
  getTitle: () => string;
  getBody: () => string;
  getGeneratedOutput: () => any;
  getInputData?: () => any;
  disabled?: boolean;
}

export function SaveContentButton({
  contentType,
  getTitle,
  getBody,
  getGeneratedOutput,
  getInputData,
  disabled = false,
}: SaveContentButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (status: "DRAFT" | "COMPLETE") => {
      const title = getTitle();
      const body = getBody();

      if (!title || !body) {
        throw new Error("No content to save");
      }

      const data: SaveContentInput = {
        title,
        body,
        contentType,
        status,
        generatedOutput: getGeneratedOutput(),
        inputData: getInputData?.(),
      };
      return saveContent(data);
    },
    onSuccess: (_data, status) => {
      toast.success(
        status === "DRAFT"
          ? "Saved as draft — find it in My Content"
          : "Saved as complete — find it in My Content"
      );
      setShowDropdown(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save content");
    },
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || saveMutation.isPending}
        onClick={() => setShowDropdown(!showDropdown)}
        className="gap-1.5"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save
        <ChevronDown className="w-3 h-3" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-xl bg-popover border border-border-subtle shadow-xl z-50">
          <button
            onClick={() => saveMutation.mutate("DRAFT")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-muted hover:bg-background-hover transition-colors"
          >
            <FileText className="w-4 h-4 text-warning" />
            Save as Draft
          </button>
          <button
            onClick={() => saveMutation.mutate("COMPLETE")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-muted hover:bg-background-hover transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-success" />
            Save as Complete
          </button>
        </div>
      )}
    </div>
  );
}
