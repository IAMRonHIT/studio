
"use client";
import { RonAILayout } from "@/components/ronai/RonAILayout";
import { IdeProvider } from "@/contexts/IdeContext";

export default function Home() {
  return (
    <IdeProvider>
      <RonAILayout />
    </IdeProvider>
  );
}
