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
export type WaterNeed = "Low" | "Moderate" | "High";

export interface LibraryPlant {
  id: string;
  name: string;
  latin: string;
  alternateNames?: string[];
  family?: string;
  nativeRegion?: string;
  plantType?: "Annual" | "Perennial" | "Shrub" | "Vine" | "Tree";
  environment?: "Indoor" | "Outdoor" | "Indoor & Outdoor";
  edible?: boolean;
  petSafe?: boolean;
  matureSize?: string;
  growthHabit?: string;
  imageKey: string;
  category: LibraryCategory;
  difficulty: "Easy" | "Moderate" | "Expert";
  /** Best general growing light; lower-light tolerance is described separately. */
  sunlight: Sunlight;
  sunlightSummary: string;
  waterNeed: WaterNeed;
  wateringSummary: string;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  flowering: boolean;
  season: string;
  blurb: string;
  care?: {
    introduction: string;
    watering: string;
    soil: string;
    sunlight: string;
    fertilizing: string;
    temperature: string;
    humidity: string;
    maintenance: string;
    problems: { symptom: string; likelyCause: string; solution: string }[];
  };
}

export const LIBRARY: LibraryPlant[] = [
  { id: "l1", name: "Cherry Tomato", latin: "Solanum lycopersicum", alternateNames: ["Tomato", "Sungold tomato"], family: "Solanaceae", nativeRegion: "Western South America", plantType: "Annual", environment: "Outdoor", edible: true, petSafe: false, matureSize: "1–3 m with support", growthHabit: "Vining, indeterminate or determinate", imageKey: "tomato", category: "Vegetables", difficulty: "Moderate", sunlight: "Full Sun", sunlightSummary: "Best fruiting in a sunny position; protect from prolonged extreme heat.", waterNeed: "High", wateringSummary: "Keep root-zone moisture steady; check soil daily in hot weather and water deeply when the surface begins to dry.", waterEveryDays: 2, fertilizeEveryDays: 14, flowering: true, season: "Spring – Summer", blurb: "Sweet, prolific and perfect for containers. Stake early and pinch side shoots." },
  { id: "l2", name: "Bell Pepper", latin: "Capsicum annuum", alternateNames: ["Sweet pepper", "Capsicum"], family: "Solanaceae", nativeRegion: "Central and South America", plantType: "Annual", environment: "Outdoor", edible: true, petSafe: false, matureSize: "45–90 cm", growthHabit: "Bushy upright", imageKey: "pepper", category: "Vegetables", difficulty: "Moderate", sunlight: "Full Sun", sunlightSummary: "Needs a warm, sunny growing site; shelter from cold winds and prolonged heat stress.", waterNeed: "Moderate", wateringSummary: "Water when the upper soil starts to dry; avoid cycles of severe drying and waterlogging while flowering and fruiting.", waterEveryDays: 2, fertilizeEveryDays: 14, flowering: true, season: "Spring – Summer", blurb: "Loves heat. Start indoors early and transplant once nights stay warm." },
  { id: "l3", name: "Butterhead Lettuce", latin: "Lactuca sativa", alternateNames: ["Bibb lettuce", "Boston lettuce"], family: "Asteraceae", nativeRegion: "Mediterranean region", plantType: "Annual", environment: "Outdoor", edible: true, petSafe: true, matureSize: "15–30 cm", growthHabit: "Compact rosette", imageKey: "lettuce", category: "Vegetables", difficulty: "Easy", sunlight: "Partial Sun", sunlightSummary: "Prefers cool conditions and sun to partial shade; some afternoon shade helps in warm weather.", waterNeed: "High", wateringSummary: "Keep the shallow root zone evenly moist, checking more often in warm or windy weather.", waterEveryDays: 2, fertilizeEveryDays: 21, flowering: true, season: "Spring & Autumn", blurb: "Tender cool-season leaves. Sow every two weeks for a steady harvest." },
  { id: "l4", name: "Sweet Basil", latin: "Ocimum basilicum", alternateNames: ["Common basil", "Basil"], family: "Lamiaceae", nativeRegion: "Tropical regions of Asia", plantType: "Annual", environment: "Outdoor", edible: true, petSafe: true, matureSize: "30–60 cm", growthHabit: "Bushy upright", imageKey: "basil", category: "Herbs", difficulty: "Easy", sunlight: "Full Sun", sunlightSummary: "Grows best warm with several hours of sun; give light afternoon shade in very hot climates.", waterNeed: "Moderate", wateringSummary: "Water when the top of the mix begins to dry; containers and hot weather need more frequent checks.", waterEveryDays: 2, fertilizeEveryDays: 21, flowering: true, season: "Summer", blurb: "Pinch flower buds to keep leaves coming. Grows beautifully beside tomatoes." },
  { id: "l5", name: "Rosemary", latin: "Salvia rosmarinus", alternateNames: ["Rosemary", "Rosmarinus officinalis"], family: "Lamiaceae", nativeRegion: "Mediterranean region", plantType: "Shrub", environment: "Outdoor", edible: true, petSafe: true, matureSize: "60–150 cm", growthHabit: "Woody evergreen shrub", imageKey: "rosemary", category: "Herbs", difficulty: "Easy", sunlight: "Full Sun", sunlightSummary: "Best in full sun and airy conditions; tolerates some light shade but may grow less densely.", waterNeed: "Low", wateringSummary: "Allow the upper soil to dry between deep waterings; pots dry faster than established garden plants.", waterEveryDays: 10, fertilizeEveryDays: 60, flowering: true, season: "Year-round", blurb: "Drought-tolerant Mediterranean shrub. Prefers lean, fast-draining soil." },
  { id: "l6", name: "English Lavender", latin: "Lavandula angustifolia", alternateNames: ["True lavender", "Common lavender"], family: "Lamiaceae", nativeRegion: "Western Mediterranean", plantType: "Shrub", environment: "Outdoor", edible: true, petSafe: false, matureSize: "45–90 cm", growthHabit: "Compact woody mound", imageKey: "lavender", category: "Herbs", difficulty: "Moderate", sunlight: "Full Sun", sunlightSummary: "Requires a sunny, open position for compact growth and good flowering.", waterNeed: "Low", wateringSummary: "Water new plants while establishing; established plants prefer soil to dry between waterings.", waterEveryDays: 7, fertilizeEveryDays: 45, flowering: true, season: "Summer", blurb: "Fragrant, pollinator-friendly and happiest when slightly neglected." },
  { id: "l7", name: "Alpine Strawberry", latin: "Fragaria vesca", alternateNames: ["Wild strawberry", "Woodland strawberry"], family: "Rosaceae", nativeRegion: "Europe and temperate Asia", plantType: "Perennial", environment: "Outdoor", edible: true, petSafe: true, matureSize: "15–25 cm", growthHabit: "Low spreading perennial", imageKey: "strawberry", category: "Fruits", difficulty: "Easy", sunlight: "Partial Sun", sunlightSummary: "Fruits best with sun, but tolerates partial shade; protect from hot afternoon sun in warm climates.", waterNeed: "Moderate", wateringSummary: "Keep soil lightly and consistently moist while flowering and fruiting, without leaving roots waterlogged.", waterEveryDays: 3, fertilizeEveryDays: 14, flowering: true, season: "Late Spring – Autumn", blurb: "Small, intensely flavoured berries all season. Great for edging and pots." },
  { id: "l8", name: "Monstera Deliciosa", latin: "Monstera deliciosa", alternateNames: ["Swiss cheese plant", "Mexican breadfruit"], family: "Araceae", nativeRegion: "Southern Mexico to Panama", plantType: "Vine", environment: "Indoor & Outdoor", edible: true, petSafe: false, matureSize: "1–3 m indoors", growthHabit: "Climbing evergreen vine", imageKey: "monstera", category: "Houseplants", difficulty: "Easy", sunlight: "Bright Indirect", sunlightSummary: "Bright indirect light is ideal indoors; tolerates lower light but growth slows and leaves may stay less divided.", waterNeed: "Moderate", wateringSummary: "Check the upper couple of inches of potting mix; water thoroughly when dry and let excess drain.", waterEveryDays: 7, fertilizeEveryDays: 30, flowering: true, season: "Year-round", blurb: "Iconic split leaves. Water when the top two inches of soil are dry." },
  { id: "l9", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", alternateNames: ["Fiddle-leaf fig", "Banjo fig"], family: "Moraceae", nativeRegion: "West and Central Africa", plantType: "Tree", environment: "Indoor", edible: false, petSafe: false, matureSize: "2–3 m indoors", growthHabit: "Single-stem upright tree", imageKey: "fiddle", category: "Houseplants", difficulty: "Expert", sunlight: "Bright Indirect", sunlightSummary: "Needs bright indirect light; can take some gentle direct morning sun after gradual acclimation.", waterNeed: "Moderate", wateringSummary: "Check the mix before watering and water when the upper layer has dried; avoid leaving the pot standing in water.", waterEveryDays: 7, fertilizeEveryDays: 30, flowering: false, season: "Year-round", blurb: "Dramatic and a little fussy. Bright light and a consistent spot are key." },
  { id: "l10", name: "Snake Plant", latin: "Dracaena trifasciata", alternateNames: ["Mother-in-law's tongue", "Saint George's sword"], family: "Asparagaceae", nativeRegion: "West Africa", plantType: "Perennial", environment: "Indoor", edible: false, petSafe: false, matureSize: "30–120 cm", growthHabit: "Clumping, upright evergreen", imageKey: "snake-plant", category: "Houseplants", difficulty: "Easy", sunlight: "Bright Indirect", sunlightSummary: "Bright indirect light is ideal; it tolerates lower light, but growth is slower. Avoid harsh midday sun.", waterNeed: "Low", wateringSummary: "Let the potting mix dry fully before watering; reduce checks and watering in cool, low-light months.", waterEveryDays: 14, fertilizeEveryDays: 60, flowering: false, season: "Year-round", blurb: "Nearly indestructible. Let the soil dry out completely between waterings." },
  { id: "l11", name: "Golden Pothos", latin: "Epipremnum aureum", alternateNames: ["Devil's ivy", "Money plant"], family: "Araceae", nativeRegion: "Society Islands, French Polynesia", plantType: "Vine", environment: "Indoor", edible: false, petSafe: false, matureSize: "Trailing 1–3 m", growthHabit: "Fast trailing or climbing vine", imageKey: "pothos", category: "Houseplants", difficulty: "Easy", sunlight: "Bright Indirect", sunlightSummary: "Bright indirect light supports strongest growth and variegation; it tolerates lower light with slower growth.", waterNeed: "Low", wateringSummary: "Water when the upper soil has dried; allow excess to drain and check less often in winter.", waterEveryDays: 8, fertilizeEveryDays: 30, flowering: false, season: "Year-round", blurb: "Trailing vines that forgive almost anything. Perfect for shelves." },
  { id: "l12", name: "French Marigold", latin: "Tagetes patula", alternateNames: ["Marigold", "Dwarf marigold"], family: "Asteraceae", nativeRegion: "Mexico and Guatemala", plantType: "Annual", environment: "Outdoor", edible: true, petSafe: false, matureSize: "20–50 cm", growthHabit: "Compact branching annual", imageKey: "marigold", category: "Flowers", difficulty: "Easy", sunlight: "Full Sun", sunlightSummary: "Flowers most freely in full sun; tolerates some light shade.", waterNeed: "Low", wateringSummary: "Water young plants as they establish; established plants prefer the surface to dry slightly between watering.", waterEveryDays: 4, fertilizeEveryDays: 30, flowering: true, season: "Summer – Autumn", blurb: "Cheerful companion plant that helps deter pests around vegetables." },
];

export function searchLibraryPlants(query: string, plants: LibraryPlant[] = LIBRARY): LibraryPlant[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return plants;
  return plants.filter((plant) =>
    [plant.name, plant.latin, plant.family ?? "", plant.growthHabit ?? "", ...(plant.alternateNames ?? [])]
      .some((value) => value.toLowerCase().includes(needle)),
  );
}

export interface LibraryFilters {
  category?: LibraryCategory | "All";
  environment?: "All" | "Indoor" | "Outdoor";
  difficulty?: LibraryPlant["difficulty"] | "All";
  sunlight?: Sunlight | "All";
  waterNeed?: WaterNeed | "All";
  season?: string | "All";
  edible?: boolean | "All";
  flowering?: boolean | "All";
}

export function filterLibraryPlants(plants: LibraryPlant[], filters: LibraryFilters): LibraryPlant[] {
  return plants.filter((plant) =>
    (filters.category === undefined || filters.category === "All" || plant.category === filters.category) &&
    (filters.environment === undefined ||
      filters.environment === "All" ||
      plant.environment === "Indoor & Outdoor" ||
      plant.environment?.includes(filters.environment)) &&
    (filters.difficulty === undefined || filters.difficulty === "All" || plant.difficulty === filters.difficulty) &&
    (filters.sunlight === undefined || filters.sunlight === "All" || plant.sunlight === filters.sunlight) &&
    (filters.waterNeed === undefined || filters.waterNeed === "All" || plant.waterNeed === filters.waterNeed) &&
    (filters.season === undefined || filters.season === "All" || plant.season === filters.season) &&
    (filters.edible === undefined || filters.edible === "All" || plant.edible === filters.edible) &&
    (filters.flowering === undefined || filters.flowering === "All" || plant.flowering === filters.flowering),
  );
}

export function findLibraryPlant(id: string): LibraryPlant | undefined {
  return LIBRARY.find((plant) => plant.id === id);
}

export function findLibraryPlantForGarden(name: string, species: string): LibraryPlant | undefined {
  const normalizedSpecies = species.trim().toLocaleLowerCase();
  const normalizedName = name.trim().toLocaleLowerCase();
  return LIBRARY.find((plant) => plant.latin.toLocaleLowerCase() === normalizedSpecies) ??
    LIBRARY.find((plant) => plant.name.toLocaleLowerCase() === normalizedName);
}

export function getLibraryPlantCare(plant: LibraryPlant): NonNullable<LibraryPlant["care"]> {
  if (plant.care) return plant.care;

  const waterAdvice =
    plant.waterNeed === "Low"
      ? "Allow the suitable upper part of the growing medium to dry between waterings."
      : plant.waterNeed === "High"
        ? "Check often and keep the root zone evenly moist, but never waterlogged."
        : "Check the growing medium and water when the suitable upper layer starts to dry.";
  return {
    introduction: plant.blurb,
    watering:
      `${plant.wateringSummary} ${waterAdvice} Check soil rather than relying on a calendar: pot size, drainage, temperature, humidity, light, rainfall and season all change how quickly it dries. Soggy mix with yellowing or limp growth can indicate overwatering; persistently dry mix with drooping can indicate underwatering. The ${plant.waterEveryDays}-day reminder is only a personal starting estimate, not a horticultural rule. Reduce watering in cool or dormant periods; containers usually dry faster than in-ground soil.`,
    soil:
      "Use a clean growing medium suited to the plant and provide drainage appropriate to its growing environment. Avoid waterlogging. A species-specific pH range has not been verified for this entry.",
    sunlight:
      `${plant.sunlight} describes the preferred light, not every condition the plant can tolerate. ${plant.sunlightSummary} Watch for stretched or weak growth in too little light and bleaching or scorch after sudden intense exposure.`,
    fertilizing:
      `The ${plant.fertilizeEveryDays}-day setting is a reminder default, not a verified universal feeding schedule. Feed only when appropriate for the growing medium and active growth; reduce or pause during dormancy and follow the fertilizer label. Species-specific deficiency signs have not been verified for this entry.`,
    temperature:
      "Protect the plant from conditions outside its locally suitable growing range. Exact preferred temperature and humidity ranges have not been verified for this entry.",
    humidity:
      "Adapt humidity care to the growing environment; an exact humidity target has not been verified for this entry.",
    maintenance:
      `Growth habit: ${plant.growthHabit ?? "not specified"}. Mature size: ${plant.matureSize ?? "not specified"}. Check local growing guidance for species-specific pruning, propagation, repotting and harvest timing.`,
    problems: [
      { symptom: "Yellowing leaves", likelyCause: "Overwatering, underwatering, poor drainage or nutrient imbalance", solution: "Check soil moisture and roots, improve drainage, and correct watering before changing fertilizer." },
      { symptom: "Brown leaf tips", likelyCause: "Low humidity, inconsistent watering or excess soluble salts", solution: "Stabilize watering and humidity; avoid repeated fertilizer use beyond plant needs." },
      { symptom: "Persistent wilting or soft roots", likelyCause: "Root damage or prolonged waterlogging", solution: "Check drainage and roots; remove clearly damaged tissue with clean tools and correct the moisture conditions." },
    ],
  };
}

export interface Guide {
  id: string;
  /** URL segment for the public guide page: /guides/<slug>. Never change once published. */
  slug: string;
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
    slug: "watering-101",
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
    slug: "healthy-living-soil",
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
    slug: "starting-seeds-indoors",
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
    slug: "companion-planting-basics",
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
    slug: "pruning-herbs",
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
    slug: "preparing-garden-for-winter",
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
