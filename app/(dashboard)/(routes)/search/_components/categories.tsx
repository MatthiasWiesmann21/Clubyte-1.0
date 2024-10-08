"use client";

import { Category } from "@prisma/client";
import { CategoryItem } from "./category-item";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedCategory extends Category {
  _count: {
    courses: number;
  };
}

interface CategoriesProps {
  items: EnhancedCategory[];
  DarkThemeOutlineColor: string;
  ThemeOutlineColor: string;
}

export const Categories = ({
  items,
  ThemeOutlineColor,
  DarkThemeOutlineColor,
}: CategoriesProps) => {
  const all =
    items
      ?.map((each) => each?._count?.courses ?? 0)
      ?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) ?? 0;

  const { theme } = useTheme();
  const getThemeColor = () => {
    return theme === "dark" ? DarkThemeOutlineColor : ThemeOutlineColor;
  };

  // Ref für den scrollbaren Container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Funktionen für Scroll-Buttons
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Button zum Scrollen nach links */}
      <Button
        onClick={scrollLeft}
        className="p-2 mb-2 mr-2 rounded-full"
        variant="ghost"
      >
        <ChevronLeftCircleIcon size={14} className="h-6 w-6" />
      </Button>
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-x-2 overflow-x-auto pb-2 scroll-smooth"
      >
        <CategoryItem
          label={"All"}
          colorCode={getThemeColor()}
          categoryAmmount={all}
        />
        {items.map((item) => (
          <CategoryItem
            key={item.id}
            label={item.name}
            value={item.id}
            colorCode={item.colorCode}
            categoryAmmount={item._count.courses}
          />
        ))}
      </div>

      {/* Button zum Scrollen nach rechts */}
      <Button
        onClick={scrollRight}
        className="p-2 mb-2 ml-2 rounded-full"
        variant="ghost"
      >
        <ChevronRightCircleIcon size={14} className="h-6 w-6" />
      </Button>
    </div>
  );
};
