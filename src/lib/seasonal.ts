import { PLANTING_WINDOWS } from "./data";

/** Month-by-month advice for temperate gardens (index 0 = January). */
export const SEASONAL_ADVICE: { month: string; headline: string; tips: string[] }[] = [
  {
    month: "January",
    headline: "Plan, order and dream",
    tips: [
      "Order seeds early while popular varieties are in stock.",
      "Sketch next season's beds and rotate crop families.",
      "Check stored bulbs and tubers for rot.",
    ],
  },
  {
    month: "February",
    headline: "Start the earliest seeds",
    tips: [
      "Sow peppers and chillies indoors under bright light.",
      "Chit seed potatoes on a cool windowsill.",
      "Prune fruit trees while they are still dormant.",
    ],
  },
  {
    month: "March",
    headline: "Wake the beds up",
    tips: [
      "Spread 2–3 inches of compost over beds.",
      "Start tomatoes and basil indoors.",
      "Sow lettuce and peas outside under cover.",
    ],
  },
  {
    month: "April",
    headline: "Harden off and plant out",
    tips: [
      "Harden off seedlings for 7–10 days before transplanting.",
      "Succession-sow salad leaves every two weeks.",
      "Watch for late frosts and keep fleece handy.",
    ],
  },
  {
    month: "May",
    headline: "Plant out tender crops",
    tips: [
      "Plant tomatoes, peppers and basil once nights stay warm.",
      "Mulch beds to hold moisture as the weather warms.",
      "Stake tall plants before they need it.",
    ],
  },
  {
    month: "June",
    headline: "Water wisely",
    tips: [
      "Water deeply in the early morning, at the base of plants.",
      "Pinch tomato side shoots for stronger trusses.",
      "Harvest herbs often to keep them bushy.",
    ],
  },
  {
    month: "July",
    headline: "Keep up with the harvest",
    tips: [
      "Pick beans and courgettes young to keep them coming.",
      "Feed fruiting crops every one to two weeks.",
      "Sow autumn salads and kale.",
    ],
  },
  {
    month: "August",
    headline: "Save seeds and sow for autumn",
    tips: [
      "Save seed from your best-performing plants.",
      "Sow spinach, lettuce and spring onions for autumn.",
      "Keep containers watered during hot spells.",
    ],
  },
  {
    month: "September",
    headline: "Harvest and sow cool-season crops",
    tips: [
      "Sow cool-season greens for an autumn harvest.",
      "Lift and cure onions and squash in the sun.",
      "Plant spring bulbs for early colour.",
    ],
  },
  {
    month: "October",
    headline: "Plant garlic and tidy beds",
    tips: [
      "Plant garlic cloves pointy side up, 2 inches deep.",
      "Sow a cover crop on empty beds.",
      "Bring tender herbs indoors to a bright windowsill.",
    ],
  },
  {
    month: "November",
    headline: "Put the garden to bed",
    tips: [
      "Mulch beds before the first frost.",
      "Leave healthy seed heads for birds and insects.",
      "Clean and oil tools before storing them.",
    ],
  },
  {
    month: "December",
    headline: "Rest, reflect, regrow",
    tips: [
      "Note what worked this year while it's fresh.",
      "Grow microgreens on the windowsill.",
      "Check stored produce and use anything softening.",
    ],
  },
];

/** Crops with a sowing, planting or harvest window in the given month. */
export type CropAction = { crop: string; action: "Sow" | "Plant out" | "Harvest" };

export function cropsForMonth(month: number): CropAction[] {
  return PLANTING_WINDOWS.flatMap((w): CropAction[] => {
    if (w.sow.includes(month)) return [{ crop: w.crop, action: "Sow" }];
    if (w.plant.includes(month)) return [{ crop: w.crop, action: "Plant out" }];
    if (w.harvest.includes(month)) return [{ crop: w.crop, action: "Harvest" }];
    return [];
  });
}
