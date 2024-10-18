import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import qs from "query-string";
import { useRef, useState } from "react";

interface CategoriesProps {
  items: Category[] | any[];
  ThemeOutlineColor: string;
  DarkThemeOutlineColor: string;
}

export const Categories = ({
  items,
  ThemeOutlineColor,
  DarkThemeOutlineColor,
}: CategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategoryId = searchParams?.get("categoryId");
  const currentTitle = searchParams?.get("title");
  const { theme } = useTheme();
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const all =
    items
      ?.map((each) => each?._count?.posts ?? 0)
      ?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) ??
    0;

  const getThemeColor = () => {
    return theme === "dark" ? DarkThemeOutlineColor : ThemeOutlineColor;
  };

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
        className="p-2 mb-6 mr-2 rounded-full hover:text-slate-600 text-slate-400 dark:text-slate-200"
        variant="ghost"
      >
        <ChevronLeftCircleIcon size={14} className="h-6 w-6" />
      </Button>

      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full items-center gap-x-2 overflow-x-auto pb-6 scroll-smooth"
      >
        <button
          onClick={() => {
            router?.push(
              qs?.stringifyUrl(
                {
                  // @ts-ignore
                  url: pathname,
                  query: {
                    title: currentTitle,
                    categoryId: null,
                  },
                },
                { skipNull: true, skipEmptyString: true }
              )
            );
          }}
          className={`flex items-center gap-x-1 rounded-full border px-3 py-2 text-[12px] font-[600] transition`}
          style={
            !currentCategoryId
              ? { borderColor: getThemeColor(), background: getThemeColor() }
              : { borderColor: "#cbd5e1" }
          }
          onMouseEnter={() => setHoveredCategoryId(null)}
          onMouseLeave={() => setHoveredCategoryId(null)}
          type="button"
        >
          <div className="truncate">All</div>
          <div>({all})</div>
        </button>
        {items?.map((item) => {
          const isSelected =
            currentCategoryId === item?.id || (!item?.id && !currentCategoryId);
          const isHovered = hoveredCategoryId === item?.id;
          const onClick = () => {
            const url = qs?.stringifyUrl(
              {
                // @ts-ignore
                url: pathname,
                query: {
                  title: currentTitle,
                  categoryId: isSelected ? null : item?.id,
                },
              },
              { skipNull: true, skipEmptyString: true }
            );

            router?.push(url);
          };
          return (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger>
                  <span
                    key={item?.id}
                    onClick={onClick}
                    className={`font-600 flex items-center gap-x-1 rounded-full border px-3 py-2 text-xs transition duration-300`}
                    style={
                      isSelected || isHovered
                        ? {
                            borderColor: item?.colorCode,
                            background: item?.colorCode,
                          }
                        : { borderColor: "#cbd5e1" }
                    }
                    onMouseEnter={() => setHoveredCategoryId(item?.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                  >
                    <span className="line-clamp-1 truncate text-start">
                      {item?.name?.toUpperCase()}
                    </span>
                    <div>({item?._count?.posts})</div>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-start text-sm whitespace-normal">
                    {item?.name?.toUpperCase()}
                  </span>
                  <span> ({item?._count?.posts})</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Button zum Scrollen nach rechts */}
      <Button
        onClick={scrollRight}
        className="p-2 mb-6 ml-2 rounded-full hover:text-slate-600 text-slate-400 dark:text-slate-200"
        variant="ghost"
      >
        <ChevronRightCircleIcon size={14} className="h-6 w-6" />
      </Button>
    </div>
  );
};
