"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend_lib/components/ui/tabs";
import { TabConfig } from "@/frontend_lib/types";
import { cn } from "@/frontend_lib/utils/utils";

interface TabEngineProps {
    tabs: TabConfig[];
    defaultValue?: string;
}

export function TabEngine({ tabs, defaultValue }: TabEngineProps) {
    return (
        <Tabs defaultValue={defaultValue || tabs[0]?.value} className="w-full">
            <TabsList variant="line" className="w-full">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} variant="line" value={tab.value} className={cn(
                        "shrink-0 px-4 py-2 border-b-2 transition-all duration-200",
                        // Inactive State (Default)
                        "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                        // Active State (Triggered by Radix)
                        "data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    )}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4 animate-in fade-in duration-300">
                    {tab.component}
                </TabsContent>
            ))}
        </Tabs>
    );
}