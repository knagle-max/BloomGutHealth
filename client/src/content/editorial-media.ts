/** Immutable M1 media mapping from the supplied raster manifest and Architect packets M2–M5.
 * No personal observations, data fetches or source selection belongs here. */
export type EditorialMediaMode = "banner" | "cutout" | "conceptual" | "state";
export interface EditorialMediaAsset {
  mode: EditorialMediaMode;
  placement: string;
  raster?: { src: string; src2x: string; width: number; height: number; width2x: number; height2x: number; conceptual: boolean };
  svg: { src: string; width: number; height: number; conceptual: boolean };
}
export const editorialMedia = {
  "today": {
    "placement": "today-hero",
    "mode": "banner",
    "raster": {
      "src": "/images/editorial/heroes/bloom-today-meadow.webp",
      "src2x": "/images/editorial/heroes/bloom-today-meadow@2x.webp",
      "width": 1200,
      "height": 500,
      "width2x": 2400,
      "height2x": 1000,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-1-original/hero-today.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  },
  "food": {
    "placement": "food-banner",
    "mode": "banner",
    "raster": {
      "src": "/images/editorial/heroes/bloom-food-oatmeal-linen.webp",
      "src2x": "/images/editorial/heroes/bloom-food-oatmeal-linen@2x.webp",
      "width": 1200,
      "height": 500,
      "width2x": 2400,
      "height2x": 1000,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-2-heroes/hero-food.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  },
  "biology": {
    "placement": "biology-banner",
    "mode": "conceptual",
    "raster": {
      "src": "/images/editorial/heroes/bloom-biology-abstract-cells.webp",
      "src2x": "/images/editorial/heroes/bloom-biology-abstract-cells@2x.webp",
      "width": 1200,
      "height": 500,
      "width2x": 2400,
      "height2x": 1000,
      "conceptual": true
    },
    "svg": {
      "src": "/brand/visual-v2/batch-4-food-science/concept-microbe-community.svg",
      "width": 480,
      "height": 480,
      "conceptual": true
    }
  },
  "explore": {
    "placement": "explore-banner",
    "mode": "banner",
    "raster": {
      "src": "/images/editorial/heroes/bloom-explore-blueberry-macro.webp",
      "src2x": "/images/editorial/heroes/bloom-explore-blueberry-macro@2x.webp",
      "width": 1200,
      "height": 500,
      "width2x": 2400,
      "height2x": 1000,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-2-heroes/hero-explore.svg",
      "width": 480,
      "height": 480,
      "conceptual": true
    }
  },
  "athlete": {
    "placement": "athlete-banner",
    "mode": "banner",
    "raster": {
      "src": "/images/editorial/heroes/bloom-athlete-mountains.webp",
      "src2x": "/images/editorial/heroes/bloom-athlete-mountains@2x.webp",
      "width": 1200,
      "height": 500,
      "width2x": 2400,
      "height2x": 1000,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-2-heroes/hero-athlete.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  },
  "progress": {
    "placement": "progress-corner",
    "mode": "cutout",
    "raster": {
      "src": "/images/editorial/cutouts/bloom-three-leaf-sprig.webp",
      "src2x": "/images/editorial/cutouts/bloom-three-leaf-sprig@2x.webp",
      "width": 600,
      "height": 600,
      "width2x": 1200,
      "height2x": 1200,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-5-system-onboarding/ornament-botanical-branch.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  },
  "profile": {
    "placement": "profile-corner",
    "mode": "cutout",
    "raster": {
      "src": "/images/editorial/cutouts/bloom-three-leaf-sprig.webp",
      "src2x": "/images/editorial/cutouts/bloom-three-leaf-sprig@2x.webp",
      "width": 600,
      "height": 600,
      "width2x": 1200,
      "height2x": 1200,
      "conceptual": false
    },
    "svg": {
      "src": "/brand/visual-v2/batch-5-system-onboarding/ornament-botanical-branch.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  },
  "journal-empty": {
    "placement": "journal-empty",
    "mode": "state",
    "svg": {
      "src": "/brand/visual-v2/batch-1-original/empty-journal.svg",
      "width": 480,
      "height": 480,
      "conceptual": false
    }
  }
} as const satisfies Record<string, EditorialMediaAsset>;
export type EditorialMediaSlot = keyof typeof editorialMedia;
