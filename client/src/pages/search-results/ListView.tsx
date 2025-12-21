import { Card, CardContent } from "@/components/ui/card";
import { ZipCodeCard } from "./ZipCodeCard";
import type { ZipCodeData } from "./types";

export function ListView({ zipCodeSummaries, currentHealthMeasure }: { zipCodeSummaries: ZipCodeData[], currentHealthMeasure: string }) {
    return (
        <div className="space-y-6">
        {zipCodeSummaries.map((item) => (
          <Card key={item.zipcode} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <ZipCodeCard item={item} currentHealthMeasure={currentHealthMeasure} />
            </CardContent>
          </Card>
        ))}
      </div>
    )
}