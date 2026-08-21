import { brand } from "@/data/copy";

type WordmarkSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<WordmarkSize, string> = {
  sm: "text-[0.6rem] wordmark-sm",
  md: "text-xl wordmark-sm",
  lg: "text-4xl wordmark",
  xl: "text-[3.25rem] leading-[0.9] wordmark",
};

interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  return (
    <span className={`inline-block select-none text-cream ${sizeClasses[size]} ${className}`}>
      {brand.wordmark}
    </span>
  );
}
