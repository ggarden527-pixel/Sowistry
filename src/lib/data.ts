import { offsetISO } from "./dates";
import type { Plant, Sunlight } from "./inventory";
import type { Task } from "./tasks";

export const LOCATIONS = [
  "Living Room",
  "Bedroom",
  "Kitchen Window",
  "Balcony",
  "Herb Garden",
  "Raised Bed A",
  "Raised Bed B",
  "Front Border",
] as const;

export function seedPlants(): Plant[] {
  const p = (
    id: string,
    name: string,
    species: string,
    imageKey: string,
    location: string,
    wateredAgo: number,
    waterEveryDays: number,
    sunlight: Sunlight,
    fertilizedAgo: number,
    fertilizeEveryDays: number,
    health: Plant["health"],
  ): Plant => ({
    id,
    name,
    species,
    imageKey,
    location,
    lastWatered: offsetISO(-wateredAgo),
    waterEveryDays,
    sunlight,
    lastFertilized: offsetISO(-fertilizedAgo),
    fertilizeEveryDays,
    health,
  });
  return [
    p("p1", "Monstera Deliciosa", "Swiss Cheese Plant", "monstera", "Living Room", 7, 7, "Indirect Light", 14, 30, "Thriving"),
    p("p2", "Cherry Tomato 'Sungold'", "Solanum lycopersicum", "tomato", "Raised Bed A", 2, 2, "Full Sun", 12, 14, "Healthy"),
    p("p3", "Sweet Basil", "Ocimum basilicum", "basil", "Herb Garden", 1, 2, "Full Sun", 20, 21, "Thriving"),
    p("p4", "Snake Plant", "Dracaena trifasciata", "snake-plant", "Bedroom", 6, 14, "Low Light", 40, 60, "Thriving"),
    p("p5", "English Lavender", "Lavandula angustifolia", "lavender", "Balcony", 10, 7, "Full Sun", 50, 45, "Needs Attention"),
    p("p6", "Alpine Strawberry", "Fragaria vesca", "strawberry", "Raised Bed B", 3, 3, "Partial Sun", 15, 14, "Healthy"),
    p("p7", "Fiddle Leaf Fig", "Ficus lyrata", "fiddle", "Living Room", 6, 7, "Indirect Light", 30, 30, "Needs Attention"),
    p("p8", "Rosemary", "Salvia rosmarinus", "rosemary", "Herb Garden", 4, 10, "Full Sun", 10, 60, "Thriving"),
    p("p9", "Bell Pepper 'California'", "Capsicum annuum", "pepper", "Raised Bed A", 1, 2, "Full Sun", 8, 14, "Healthy"),
    p("p10", "Butterhead Lettuce", "Lactuca sativa", "lettuce", "Kitchen Window", 3, 2, "Partial Sun", 5, 21, "At Risk"),
    p("p11", "Golden Pothos", "Epipremnum aureum", "pothos", "Bedroom", 2, 8, "Low Light", 25, 30, "Healthy"),
    p("p12", "French Marigold", "Tagetes patula", "marigold", "Front Border", 2, 4, "Full Sun", 18, 30, "Thriving"),
  ];
}

export function seedTasks(): Task[] {
  const t = (id: string, title: string, type: Task["type"], dueIn: number, time?: string, imageKey?: string, done = false): Task => ({
    id,
    title,
    type,
    due: offsetISO(dueIn),
    time,
    imageKey,
    done,
  });
  return [
    t("t1", "Water English Lavender", "water", -3, "08:00", "lavender"),
    t("t2", "Feed Alpine Strawberries", "fertilize", -1, "09:30", "strawberry"),
    t("t3", "Water Cherry Tomatoes", "water", 0, "07:30", "tomato"),
    t("t4", "Water Monstera Deliciosa", "water", 0, "08:00", "monstera"),
    t("t5", "Fertilize Fiddle Leaf Fig", "fertilize", 0, "10:00", "fiddle"),
    t("t6", "Prune Rosemary tips", "prune", 0, "17:30", "rosemary"),
    t("t7", "Water Sweet Basil", "water", 1, "08:00", "basil"),
    t("t8", "Harvest Cherry Tomatoes", "harvest", 1, "09:00", "tomato"),
    t("t9", "Feed tomato bed", "fertilize", 2, "08:30", "tomato"),
    t("t10", "Sow lettuce indoors", "plant", 3, "10:00", "lettuce"),
    t("t11", "Plant out garlic cloves", "plant", 6, "11:00"),
    t("t12", "Start pepper seedlings", "plant", 10, "10:00", "pepper"),
    t("t13", "Transplant basil seedlings", "plant", 13, "16:00", "basil"),
    t("t14", "Water Monstera Deliciosa", "water", -7, "08:00", "monstera", true),
    t("t15", "Prune Lavender", "prune", -5, "17:00", "lavender", true),
    t("t16", "Sow marigold seeds", "plant", 20, "10:00", "marigold"),
  ];
}

export type LibraryCategory = "Vegetables" | "Herbs" | "Fruits" | "Houseplants" | "Flowers";

export interface LibraryPlant {
  id: string;
  name: string;
  latin: string;
  imageKey: string;
  category: LibraryCategory;
  difficulty: "Easy" | "Moderate" | "Expert";
  sunlight: Sunlight;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  season: string;
  blurb: string;
}

export const LIBRARY: LibraryPlant[] = [
  { id: "l1", name: "Cherry Tomato", latin: "Solanum lycopersicum", imageKey: "tomato", category: "Vegetables", difficulty: "Moderate", sunlight: "Full Sun", waterEveryDays: 2, fertilizeEveryDays: 14, season: "Spring – Summer", blurb: "Sweet, prolific and perfect for containers. Stake early and pinch side shoots." },
  { id: "l2", name: "Bell Pepper", latin: "Capsicum annuum", imageKey: "pepper", category: "Vegetables", difficulty: "Moderate", sunlight: "Full Sun", waterEveryDays: 2, fertilizeEveryDays: 14, season: "Spring – Summer", blurb: "Loves heat. Start indoors early and transplant once nights stay warm." },
  { id: "l3", name: "Butterhead Lettuce", latin: "Lactuca sativa", imageKey: "lettuce", category: "Vegetables", difficulty: "Easy", sunlight: "Partial Sun", waterEveryDays: 2, fertilizeEveryDays: 21, season: "Spring & Autumn", blurb: "Tender cool-season leaves. Sow every two weeks for a steady harvest." },
  { id: "l4", name: "Sweet Basil", latin: "Ocimum basilicum", imageKey: "basil", category: "Herbs", difficulty: "Easy", sunlight: "Full Sun", waterEveryDays: 2, fertilizeEveryDays: 21, season: "Summer", blurb: "Pinch flower buds to keep leaves coming. Grows beautifully beside tomatoes." },
  { id: "l5", name: "Rosemary", latin: "Salvia rosmarinus", imageKey: "rosemary", category: "Herbs", difficulty: "Easy", sunlight: "Full Sun", waterEveryDays: 10, fertilizeEveryDays: 60, season: "Year-round", blurb: "Drought-tolerant Mediterranean shrub. Prefers lean, fast-draining soil." },
  { id: "l6", name: "English Lavender", latin: "Lavandula angustifolia", imageKey: "lavender", category: "Herbs", difficulty: "Moderate", sunlight: "Full Sun", waterEveryDays: 7, fertilizeEveryDays: 45, season: "Summer", blurb: "Fragrant, pollinator-friendly and happiest when slightly neglected." },
  { id: "l7", name: "Alpine Strawberry", latin: "Fragaria vesca", imageKey: "strawberry", category: "Fruits", difficulty: "Easy", sunlight: "Partial Sun", waterEveryDays: 3, fertilizeEveryDays: 14, season: "Late Spring – Autumn", blurb: "Small, intensely flavoured berries all season. Great for edging and pots." },
  { id: "l8", name: "Monstera Deliciosa", latin: "Monstera deliciosa", imageKey: "monstera", category: "Houseplants", difficulty: "Easy", sunlight: "Indirect Light", waterEveryDays: 7, fertilizeEveryDays: 30, season: "Year-round", blurb: "Iconic split leaves. Water when the top two inches of soil are dry." },
  { id: "l9", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", imageKey: "fiddle", category: "Houseplants", difficulty: "Expert", sunlight: "Indirect Light", waterEveryDays: 7, fertilizeEveryDays: 30, season: "Year-round", blurb: "Dramatic and a little fussy. Bright light and a consistent spot are key." },
  { id: "l10", name: "Snake Plant", latin: "Dracaena trifasciata", imageKey: "snake-plant", category: "Houseplants", difficulty: "Easy", sunlight: "Low Light", waterEveryDays: 14, fertilizeEveryDays: 60, season: "Year-round", blurb: "Nearly indestructible. Let the soil dry out completely between waterings." },
  { id: "l11", name: "Golden Pothos", latin: "Epipremnum aureum", imageKey: "pothos", category: "Houseplants", difficulty: "Easy", sunlight: "Low Light", waterEveryDays: 8, fertilizeEveryDays: 30, season: "Year-round", blurb: "Trailing vines that forgive almost anything. Perfect for shelves." },
  { id: "l12", name: "French Marigold", latin: "Tagetes patula", imageKey: "marigold", category: "Flowers", difficulty: "Easy", sunlight: "Full Sun", waterEveryDays: 4, fertilizeEveryDays: 30, season: "Summer – Autumn", blurb: "Cheerful companion plant that helps deter pests around vegetables." },
];

export interface Guide {
  id: string;
  title: string;
  category: "Watering" | "Soil" | "Seeds" | "Planning" | "Care" | "Seasonal";
  readMins: number;
  imageKey: string;
  summary: string;
  steps: string[];
}

export const GUIDES: Guide[] = [
  {
    id: "g1",
    title: "Watering 101: how much is enough?",
    category: "Watering",
    readMins: 5,
    imageKey: "tomato",
    summary: "Learn to read your soil, water deeply, and avoid the most common mistake: little and often.",
    steps: [
      "Push a finger two inches into the soil. If it's dry at that depth, it's time to water.",
      "Water deeply and less often so roots grow down instead of staying near the surface.",
      "Water in the early morning so leaves dry before evening and fungal problems stay away.",
      "Aim water at the base of the plant, not the foliage.",
      "Use the Watering Calculator to estimate weekly gallons for each bed.",
    ],
  },
  {
    id: "g2",
    title: "Building healthy, living soil",
    category: "Soil",
    readMins: 7,
    imageKey: "lettuce",
    summary: "Compost, structure and biology — the three ingredients behind every thriving garden bed.",
    steps: [
      "Add 2–3 inches of finished compost to beds every spring.",
      "Avoid walking on growing areas to keep soil loose and airy.",
      "Mulch bare soil to protect microbes and hold moisture.",
      "Rotate crop families each season to balance nutrients.",
      "Test pH every couple of years; most vegetables like 6.0–7.0.",
    ],
  },
  {
    id: "g3",
    title: "Starting seeds indoors",
    category: "Seeds",
    readMins: 6,
    imageKey: "pepper",
    summary: "Get a head start on the season with strong, stocky seedlings raised on a windowsill or under lights.",
    steps: [
      "Use fresh seed-starting mix — it's lighter and disease-free.",
      "Sow at a depth of about twice the seed's width.",
      "Keep mix evenly moist and warm until germination.",
      "Give seedlings 14–16 hours of light to stop them stretching.",
      "Harden off for 7–10 days before transplanting outside.",
    ],
  },
  {
    id: "g4",
    title: "Companion planting basics",
    category: "Planning",
    readMins: 4,
    imageKey: "marigold",
    summary: "Pair plants that help each other: deter pests, attract pollinators and make the most of space.",
    steps: [
      "Plant basil next to tomatoes for flavour and pest protection.",
      "Edge vegetable beds with marigolds to deter nematodes.",
      "Tuck lettuce into the shade of taller crops in summer.",
      "Keep fennel away from most vegetables — it inhibits growth.",
      "Plan your layout with the Garden Planner before planting.",
    ],
  },
  {
    id: "g5",
    title: "Pruning herbs for bushier growth",
    category: "Care",
    readMins: 3,
    imageKey: "basil",
    summary: "A few snips in the right place double your harvest and keep herbs from going woody.",
    steps: [
      "Cut just above a pair of leaves to encourage two new stems.",
      "Never remove more than a third of the plant at once.",
      "Pinch off flower buds on basil and mint to prolong leaf production.",
      "Trim woody herbs like rosemary after flowering.",
    ],
  },
  {
    id: "g6",
    title: "Preparing your garden for winter",
    category: "Seasonal",
    readMins: 5,
    imageKey: "rosemary",
    summary: "Put beds to rest, protect perennials and set yourself up for an easy spring.",
    steps: [
      "Clear diseased foliage, but leave healthy stems for overwintering insects.",
      "Mulch perennials and garlic beds with straw or leaves.",
      "Sow a cover crop or spread compost over empty beds.",
      "Bring tender herbs indoors to a bright windowsill.",
      "Clean and oil tools before storing them away.",
    ],
  },
];

/** Planting windows (month index 0–11) for the seasonal planner strip. */
export const PLANTING_WINDOWS = [
  { crop: "Tomato", sow: [1, 2, 3], plant: [4, 5], harvest: [6, 7, 8] },
  { crop: "Pepper", sow: [1, 2], plant: [4, 5], harvest: [7, 8, 9] },
  { crop: "Lettuce", sow: [2, 3, 7, 8], plant: [3, 4, 8], harvest: [4, 5, 9, 10] },
  { crop: "Basil", sow: [3, 4], plant: [4, 5], harvest: [6, 7, 8] },
  { crop: "Garlic", sow: [], plant: [9, 10], harvest: [5, 6] },
  { crop: "Strawberry", sow: [], plant: [2, 3, 8], harvest: [5, 6, 7] },
];
