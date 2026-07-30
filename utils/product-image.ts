import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const productImages = () => new Directory(Paths.document, "product-images");

export function persistProductImage(uri: string, productId: string): string {
  if (Platform.OS === "web") return uri;

  const directory = productImages();
  directory.create({ idempotent: true, intermediates: true });

  const source = new File(uri);
  const destination = new File(
    directory,
    `${productId}${source.extension || ".jpg"}`,
  );
  source.copy(destination);
  return destination.uri;
}

export function deleteProductImage(uri: string | undefined): void {
  if (!uri || Platform.OS === "web") return;

  const directory = productImages();
  if (!uri.startsWith(directory.uri)) return;

  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    console.warn("Could not delete a locally stored product image");
  }
}

export function deleteAllProductImages(): void {
  if (Platform.OS === "web") return;

  const directory = productImages();
  if (directory.exists) directory.delete();
}
