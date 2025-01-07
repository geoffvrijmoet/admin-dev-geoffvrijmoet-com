'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, CheckSquare, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessInsight {
  _id: string;
  type: 'insight' | 'action' | 'strategy';
  content: string;
  source?: string;
  timestamp: Date;
}

const INSIGHTS: BusinessInsight[] = [];

export function BusinessPlanningContent() {
  const [selectedType, setSelectedType] = useState<'all' | 'insight' | 'action' | 'strategy'>('all');

  const filteredInsights = INSIGHTS.filter(
    insight => selectedType === 'all' || insight.type === selectedType
  );

  const TypeIcon = {
    insight: Lightbulb,
    action: CheckSquare,
    strategy: Target,
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Business Planning</h2>
        <p className="text-muted-foreground">
          Collected insights, action items, and strategies for business growth
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedType('all')}
        >
          All
        </Button>
        <Button
          variant={selectedType === 'insight' ? 'default' : 'outline'}
          onClick={() => setSelectedType('insight')}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Insights
        </Button>
        <Button
          variant={selectedType === 'action' ? 'default' : 'outline'}
          onClick={() => setSelectedType('action')}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Action Items
        </Button>
        <Button
          variant={selectedType === 'strategy' ? 'default' : 'outline'}
          onClick={() => setSelectedType('strategy')}
        >
          <Target className="mr-2 h-4 w-4" />
          Strategies
        </Button>
      </div>

      <Card className="h-[calc(100vh-24rem)]">
        <CardHeader>
          <CardTitle>Business Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {filteredInsights.length > 0 ? (
                filteredInsights.map((insight) => {
                  const Icon = TypeIcon[insight.type];
                  return (
                    <div
                      key={insight._id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        insight.type === 'insight' && "bg-blue-500/5 border-blue-200/30",
                        insight.type === 'action' && "bg-green-500/5 border-green-200/30",
                        insight.type === 'strategy' && "bg-purple-500/5 border-purple-200/30"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "rounded-full p-2",
                          insight.type === 'insight' && "bg-blue-500/10 text-blue-500",
                          insight.type === 'action' && "bg-green-500/10 text-green-500",
                          insight.type === 'strategy' && "bg-purple-500/10 text-purple-500"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{insight.content}</p>
                          {insight.source && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Source: {insight.source}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Added: {new Date(insight.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No entries yet.</p>
                  <p className="text-sm mt-2">Add insights, action items, and strategies as we discuss them.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 