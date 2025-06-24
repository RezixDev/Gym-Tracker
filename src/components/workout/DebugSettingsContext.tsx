import { createContext, ReactNode, useContext, useState } from "react";

export type FieldVisibility = {
  showMachineNumber: boolean;
  showNotes: boolean;
};

type DebugSettingsContextType = {
  fieldVisibility: FieldVisibility;
  updateFieldVisibility: (settings: Partial<FieldVisibility>) => void;
};

const DebugSettingsContext = createContext<DebugSettingsContextType | undefined>(
  undefined,
);

export function DebugSettingsProvider({ children }: { children: ReactNode }) {
  const [fieldVisibility, setFieldVisibility] = useState<FieldVisibility>({
    showMachineNumber: true,
    showNotes: true,
  });

  const updateFieldVisibility = (settings: Partial<FieldVisibility>) => {
    setFieldVisibility((prev) => ({ ...prev, ...settings }));
  };

  return (
    <DebugSettingsContext value={{ fieldVisibility, updateFieldVisibility }}>
      {children}
    </DebugSettingsContext>
  );
}

export function useDebugSettings() {
  const context = useContext(DebugSettingsContext);
  if (!context) {
    throw new Error("useDebugSettings must be used within a DebugSettingsProvider");
  }
  return context;
}
