import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Plus, BarChart3, Target, Download } from "lucide-react";
import { X, Zap } from "lucide-react";


interface FloatingActionButtonProps {
  onAction: (action: string) => void;
}

export default function FloatingActionButton({ onAction }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: "analyze", icon: Brain, label: "🤖 تحلیل هوشمند", color: "bg-blue-500" },
    { id: "charts", icon: BarChart3, label: "📈 تولید نمودار", color: "bg-green-500" },
    { id: "goals", icon: Target, label: "🎯 برنامه ماهانه", color: "bg-purple-500" },
    { id: "export", icon: Download, label: "📤 صادرات PDF", color: "bg-orange-500" },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant="outline"
                  className="justify-start gap-2 h-10"
                  onClick={() => {
                    onAction(action.id);
                    setIsOpen(false);
                  }}
                >
                  <action.icon className={`h-4 w-4 text-white rounded p-0.5 ${action.color}`} />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full shadow-xl transition-transform ${
          isOpen ? "rotate-45" : ""
        } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </Button>
    </div>
  );
}