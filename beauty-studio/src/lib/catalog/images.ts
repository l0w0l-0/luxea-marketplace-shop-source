function toPromptText(value: string) {
  return encodeURIComponent(
    value
      .replaceAll(/[_-]+/g, " ")
      .trim()
      .toLowerCase(),
  );
}

export function getCatalogImageUrl(args: {
  productName: string;
  category: string;
  accent?: string;
}) {
  const prompt = toPromptText(
    `luxury ${args.category} ${args.productName} ${args.accent ?? ""} elegant product photography on soft ivory background high-end beauty campaign`,
  );

  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square_hd`;
}
