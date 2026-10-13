import type { Persona, StoryboardProject } from '../types';

export const INITIAL_PERSONAS: Persona[] = [
  {
    id: 'persona_1',
    name: 'Oakky (My Digital Twin)',
    isDefault: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    referenceImages: [
      {
        id: 'ref_1',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        angle: 'front',
        label: 'Front View (Neutral Light)'
      },
      {
        id: 'ref_2',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        angle: 'angle_45',
        label: '45° Semi-Profile'
      },
      {
        id: 'ref_3',
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
        angle: 'profile',
        label: 'Profile (Jawline definition)'
      },
      {
        id: 'ref_4',
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        angle: 'close_up',
        label: 'Expression Close-up'
      }
    ],
    faceDna: {
      faceShape: 'chiseled jawline with proportional Asian oval face structure',
      eyeDetails: 'warm dark brown almond eyes, confident expressive gaze',
      hairStyle: 'modern textured crop with subtle clean fade sides, natural jet black hair',
      skinTone: 'smooth warm honey-tan Asian skin tone with natural micro-texture and realistic pores',
      facialHair: 'clean shaven with subtle defined shadow along the jawline',
      signatureFeatures: 'friendly subtle dimple when smiling, confident sharp eyebrows'
    },
    wardrobes: [
      {
        id: 'wardrobe_1',
        name: 'Streetwear Minimalist',
        description: 'premium oversized charcoal grey hoodie, minimalist matte black watch',
        category: 'streetwear'
      },
      {
        id: 'wardrobe_2',
        name: 'Smart Tech Casual',
        description: 'clean crisp tailored navy linen shirt with rolled-up cuffs, minimalist titanium eyeglasses',
        category: 'casual'
      },
      {
        id: 'wardrobe_3',
        name: 'Cinematic Tokyo Neo-Jacket',
        description: 'matte black cyberpunk waterproof techwear jacket with subtle reflective accents',
        category: 'cinematic'
      }
    ],
    activeWardrobeId: 'wardrobe_1',
    props: [
      {
        id: 'prop_boat',
        name: 'เรือไม้หางยาวสีคราม (My Longtail Boat)',
        category: 'vehicle',
        photoUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80',
        description: 'traditional handcrafted teak wood longtail boat with vibrant turquoise-cyan hull, woven bow garland, and custom chrome propeller engine'
      },
      {
        id: 'prop_desk',
        name: 'โต๊ะทำงานไม้สั่งตัด (Custom Creator Desk)',
        category: 'furniture',
        photoUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80',
        description: 'bespoke dark solid walnut creator desk with matte black iron legs, integrated warm Edison glow lamp, and minimalist aluminum accessories'
      },
      {
        id: 'prop_gear',
        name: 'อุปกรณ์ประจำตัว (Signature Hero Gear)',
        category: 'gear_prop',
        photoUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
        description: 'sleek matte obsidian tactical device with carbon-fiber grip texture and amber indicator light'
      }
    ]
  },
  {
    id: 'persona_2',
    name: 'Bank (เพื่อน 1 / สายลุย)',
    isDefault: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    referenceImages: [
      {
        id: 'ref_b1',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        angle: 'front',
        label: 'Front View'
      }
    ],
    faceDna: {
      faceShape: 'strong square jawline with athletic facial proportions',
      eyeDetails: 'sharp focused dark eyes with thicker defined eyebrows',
      hairStyle: 'messy textured wavy brown-black hair with volume on top',
      skinTone: 'sun-kissed tanned skin with athletic complexion',
      facialHair: 'short designer stubble along jaw and chin',
      signatureFeatures: 'charismatic rugged smile and expressive laugh lines'
    },
    wardrobes: [
      {
        id: 'wardrobe_b1',
        name: 'Outdoor Adventure Jacket',
        description: 'olive green tactical utility jacket over a grey thermal crewneck',
        category: 'streetwear'
      }
    ],
    activeWardrobeId: 'wardrobe_b1',
    props: []
  },
  {
    id: 'persona_3',
    name: 'Aom (เพื่อน 2 / สายกล้อง)',
    isDefault: false,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    referenceImages: [
      {
        id: 'ref_a1',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        angle: 'front',
        label: 'Front View'
      }
    ],
    faceDna: {
      faceShape: 'delicate heart-shaped Asian face with gentle soft jawline',
      eyeDetails: 'bright expressive dark brown eyes with playful friendly gaze',
      hairStyle: 'shoulder-length layered dark brown hair with soft curtain bangs',
      skinTone: 'fair porcelain skin with natural radiant glow',
      facialHair: 'none',
      signatureFeatures: 'bright infectious smile and round rimless glasses'
    },
    wardrobes: [
      {
        id: 'wardrobe_a1',
        name: 'Creator Oversized Knit',
        description: 'cream beige oversized knit sweater and canvas camera cross-body bag',
        category: 'casual'
      }
    ],
    activeWardrobeId: 'wardrobe_a1',
    props: []
  }
];

export const INITIAL_PROJECT: StoryboardProject = {
  id: 'project_1',
  title: 'Cinematic City Walk',
  personaId: 'persona_1',
  createdAt: Date.now(),
  shots: [
    {
      id: 'shot_1',
      title: 'Shot 1: The Arrival',
      userPrompt: 'เดินออกจากสถานีรถไฟ ถือแก้วกาแฟ แสงแดดอุ่นๆ ยามเย็น',
      framing: 'medium_shot',
      cameraMovement: 'steadycam_tracking',
      lighting: 'golden_hour',
      lens: '35mm_anamorphic',
      motionPacing: 'smooth_slowmo',
      sceneEnvironment: 'modern glass train station concourse with warm sunlight streaming through architectural arches',
      characterAction: 'walking confidently forward while holding a sleek minimalist coffee cup',
      characterEmotion: 'serene, thoughtful, authentic smile',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: ''
    },
    {
      id: 'shot_2',
      title: 'Shot 2: Coffee & Reflection',
      userPrompt: 'หยุดยืนมองวิวเมือง ดื่มกาแฟ กล้องซูมเข้าใกล้ใบหน้า',
      framing: 'close_up',
      cameraMovement: 'slow_dolly_in',
      lighting: 'golden_hour',
      lens: '85mm_portrait_bokeh',
      motionPacing: 'cinematic_standard',
      sceneEnvironment: 'rooftop glass terrace overlooking a sprawling metropolis during sunset',
      characterAction: 'pausing to take a gentle sip of coffee then looking thoughtfully into the distant horizon',
      characterEmotion: 'deeply inspired and focused expression',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: ''
    }
  ]
};
