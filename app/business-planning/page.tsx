import { Metadata } from "next";
import { BusinessPlanningContent } from "@/components/business-planning-content";

export const metadata: Metadata = {
  title: "Business Planning",
  description: "Plan and organize your business strategy and client acquisition",
};

export default async function BusinessPlanningPage() {
  return <BusinessPlanningContent />;
} 