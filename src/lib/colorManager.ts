const pastelColors = [
  "#37123C", // pastel blue
  "#71677C", // pastel purple
  "#FFB347", // pastel orange
  "#0A014F", // powder blue
  "#6C9A8B", // pastel green
  "#272727", // pastel pink
  "#253C78", // light pink
  "#727D71", // peach
  "#1F0322", // lavender
  "#654C4F", // mint
  "#9DA9A0",
  "#605770",
  "#8D6B94",
  "#C3A29E",
  "#121619",
  "#191919",
  "#CED0CE",
];

class ColorManager {
  private colorMap = new Map<string, string>();
  private currentIndex = 0;

  getColor(key: string): string {
    if (!this.colorMap.has(key)) {
      this.colorMap.set(
        key,
        pastelColors[this.currentIndex % pastelColors.length]
      );
      this.currentIndex++;
    }
    return this.colorMap.get(key)!;
  }
}

export const colorManager = new ColorManager();
