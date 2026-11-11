import monstera from "@/assets/plants/monstera.jpg";
import tomato from "@/assets/plants/tomato.jpg";
import basil from "@/assets/plants/basil.jpg";
import snakePlant from "@/assets/plants/snake-plant.jpg";
import lavender from "@/assets/plants/lavender.jpg";
import strawberry from "@/assets/plants/strawberry.jpg";
import fiddle from "@/assets/plants/fiddle-leaf-fig.jpg";
import rosemary from "@/assets/plants/rosemary.jpg";
import pepper from "@/assets/plants/pepper.jpg";
import lettuce from "@/assets/plants/lettuce.jpg";
import marigold from "@/assets/plants/marigold.jpg";
import pothos from "@/assets/plants/pothos.jpg";

export const plantImages = {
  monstera,
  tomato,
  basil,
  "snake-plant": snakePlant,
  lavender,
  strawberry,
  fiddle,
  rosemary,
  pepper,
  lettuce,
  marigold,
  pothos,
} as const;

export type PlantImageKey = keyof typeof plantImages;
export const plantImageKeys = Object.keys(plantImages) as PlantImageKey[];
export const plantImage = (key: string) => plantImages[key as PlantImageKey] ?? plantImages.monstera;
