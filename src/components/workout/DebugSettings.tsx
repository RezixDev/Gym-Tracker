import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDebugSettings } from "./DebugSettingsContext";

export function DebugSettings() {
  const { fieldVisibility, updateFieldVisibility } = useDebugSettings();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Debug Settings</CardTitle>
        <CardDescription>
          Control which fields are visible in the workout form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="machine-number" className="cursor-pointer">
            Show Machine Number Field
          </Label>
          <Switch
            id="machine-number"
            checked={fieldVisibility.showMachineNumber}
            onCheckedChange={(checked) =>
              updateFieldVisibility({ showMachineNumber: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notes" className="cursor-pointer">
            Show Notes Field
          </Label>
          <Switch
            id="notes"
            checked={fieldVisibility.showNotes}
            onCheckedChange={(checked) => updateFieldVisibility({ showNotes: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
