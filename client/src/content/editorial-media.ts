/** Immutable M1 media mapping from the supplied raster manifest and Architect packets M2–M5.
 * No personal observations, data fetches or source selection belongs here. */
export type EditorialMediaMode = "banner" | "cutout" | "conceptual" | "state";
export interface EditorialMediaAsset {
  mode: EditorialMediaMode;
  placement: string;
  raster?: { src: string; src2x?: string; width: number; height: number; width2x?: number; height2x?: number; conceptual: boolean; mobile?:{src:string;width:number;height:number} };
  svg?: { src: string; width: number; height: number; conceptual: boolean };
  reserved?: { width: number; height: number; conceptual: boolean };
}
export const editorialMedia = {
  "lab-detail-ldl-hero": {mode:"conceptual",placement:"marker-editorial-hero",reserved:{width:1600,height:800,conceptual:true}},
  "lab-detail-ldl-particle": {mode:"conceptual",placement:"marker-education-what",reserved:{width:160,height:160,conceptual:true}},
  "lab-detail-ldl-artery": {mode:"conceptual",placement:"marker-education-why",reserved:{width:160,height:160,conceptual:true}},
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
  },
  "bloodwork-hero": {raster:{"src":"/images/editorial/bloodwork/BVA-0009-bloodwork-immersive-rbc-hero.webp","width":1672,"height":941,"conceptual":true},mode:"conceptual",placement:"bloodwork-hero",reserved:{width:1600,height:900,conceptual:true}},
  "bloodwork-heart": {raster:{"src":"/images/editorial/bloodwork/BVA-0010-cardiovascular-anatomy.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-sugar": {raster:{"src":"/images/editorial/bloodwork/BVA-0011-glycaemic-concept.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-liver": {raster:{"src":"/images/editorial/bloodwork/BVA-0012-liver-biliary-anatomy.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-cbc": {raster:{src:"/images/editorial/bloodwork/BVA-0036-complete-blood-count.webp",width:1254,height:1254,conceptual:true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-iron": {raster:{"src":"/images/editorial/bloodwork/BVA-0013-blood-rbc-morphology.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-bone": {raster:{"src":"/images/editorial/bloodwork/BVA-0014-bone-trabecular.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-hormones": {raster:{"src":"/images/editorial/bloodwork/BVA-0029-hormones-thyroid-anatomy.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-inflammation": {raster:{"src":"/images/editorial/bloodwork/BVA-0030-inflammation-immunity-response.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "bloodwork-other": {raster:{"src":"/images/editorial/bloodwork/BVA-0031-other-identification-network.webp","width":1254,"height":1254,"conceptual":true},mode:"conceptual",placement:"bloodwork-system",reserved:{width:480,height:480,conceptual:true}},
  "biology-bloodwork": {mode:"conceptual",placement:"biology-source-banner",raster:{"src":"/images/editorial/biology/BVA-0032-biology-bloodwork-vial-text-safe.webp","src2x":"/images/editorial/biology/BVA-0032-biology-bloodwork-vial-text-safe@2x.webp","width":1086,"height":362,"width2x":2172,"height2x":724,"conceptual":true},reserved:{width:2172,height:724,conceptual:true}},
  "biology-gut": {mode:"conceptual",placement:"biology-source-banner",raster:{"src":"/images/editorial/biology/BVA-0033-biology-gut-reports-text-safe.webp","src2x":"/images/editorial/biology/BVA-0033-biology-gut-reports-text-safe@2x.webp","width":1086,"height":362,"width2x":2172,"height2x":724,"conceptual":true},reserved:{width:2172,height:724,conceptual:true}},
  "biology-genetics": {mode:"conceptual",placement:"biology-source-banner",raster:{"src":"/images/editorial/biology/BVA-0034-biology-genetics-text-safe.webp","src2x":"/images/editorial/biology/BVA-0034-biology-genetics-text-safe@2x.webp","width":1086,"height":362,"width2x":2172,"height2x":724,"conceptual":true},reserved:{width:2172,height:724,conceptual:true}},
  "biology-measurements": {mode:"conceptual",placement:"biology-source-banner",raster:{"src":"/images/editorial/biology/BVA-0035-biology-measurements-text-safe.webp","src2x":"/images/editorial/biology/BVA-0035-biology-measurements-text-safe@2x.webp","width":1086,"height":362,"width2x":2172,"height2x":724,"conceptual":true},reserved:{width:2172,height:724,conceptual:true}},
  "gut-report-hero": {"mode":"conceptual","placement":"biology-banner","raster":{"src":"/images/editorial/biology/BVA-0017-microbiome-editorial-backdrop.webp","width":1672,"height":941,"conceptual":true},"reserved":{"width":1672,"height":941,"conceptual":true}},
  "genetics-accent": {"mode":"conceptual","placement":"genetics-banner","raster":{"src":"/images/editorial/biology/BVA-0018-genetics-editorial-accent.webp","width":1672,"height":941,"conceptual":true},"reserved":{"width":1672,"height":941,"conceptual":true}},
  "explore-atlas": {"mode":"conceptual","placement":"explore-banner","raster":{"src":"/images/editorial/explore/BVA-0019-explore-living-atlas.webp","width":1672,"height":941,"conceptual":true},"reserved":{"width":1672,"height":941,"conceptual":true}},
  "pathway-reference": {"mode":"conceptual","placement":"explore-reference","raster":{"src":"/images/editorial/explore/BVA-0020-explore-pathway-reference.webp","width":1448,"height":1086,"conceptual":true},"reserved":{"width":1448,"height":1086,"conceptual":true}},
  "progress-scene": {"mode":"conceptual","placement":"progress-banner","raster":{"src":"/images/editorial/progress/BVA-0021-progress-editorial-scene.webp","width":1672,"height":941,"conceptual":true},"reserved":{"width":1672,"height":941,"conceptual":true}},
  "athlete-recovery": {"mode":"conceptual","placement":"recovery-banner","raster":{"src":"/images/editorial/athlete/BVA-0023-athlete-recovery-runner-bench-desktop-16x9.webp","width":1536,"height":864,"conceptual":true,"mobile":{"src":"/images/editorial/athlete/BVA-0023-athlete-recovery-runner-bench-mobile-3x4.webp","width":768,"height":1024}},"reserved":{"width":1536,"height":864,"conceptual":true}},
  "coach-consultation": {"mode":"conceptual","placement":"coach-banner","raster":{"src":"/images/editorial/coach/BVA-0024-coach-client-consultation-desktop-16x9.webp","width":1536,"height":864,"conceptual":true,"mobile":{"src":"/images/editorial/coach/BVA-0024-coach-client-consultation-mobile-3x4.webp","width":768,"height":1024}},"reserved":{"width":1536,"height":864,"conceptual":true}}
} as const satisfies Record<string, EditorialMediaAsset>;
export type EditorialMediaSlot = keyof typeof editorialMedia;
