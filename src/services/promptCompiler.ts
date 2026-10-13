import type { Persona, ShotConfig, ShotFraming, CameraMovement, LightingAtmosphere, LensAesthetic } from '../types';

export const FRAMING_DESCRIPTIONS: Record<ShotFraming, { label: string; prompt: string }> = {
  extreme_close_up: { label: 'Extreme Close-Up (ตา/ใบหน้าชัดเจน)', prompt: 'extreme cinematic macro close-up shot focused on eyes and facial micro-expressions' },
  close_up: { label: 'Close-Up (ใบหน้าอก)', prompt: 'cinematic close-up portrait shot, capturing detailed facial features and emotions' },
  medium_close_up: { label: 'Medium Close-Up (อกถึงศีรษะ)', prompt: 'medium close-up shot from chest up, balanced character framing' },
  medium_shot: { label: 'Medium Shot (เอวถึงศีรษะ)', prompt: 'medium shot from the waist up, showing body language and environment context' },
  cowboy_shot: { label: 'Cowboy Shot (ต้นขาถึงศีรษะ)', prompt: 'cinematic cowboy shot framed from mid-thigh up' },
  wide_shot: { label: 'Wide Shot (เต็มตัว)', prompt: 'cinematic wide establishing shot, full body visible in spacious environment' },
  extreme_wide: { label: 'Extreme Wide (ทัศนียภาพกว้าง)', prompt: 'ultra-wide cinematic landscape shot, character integrated into breathtaking setting' },
  drone_aerial: { label: 'Drone Aerial (มุมสูง)', prompt: 'sweeping high-angle aerial drone shot overlooking the scene' },
};

export const CAMERA_DESCRIPTIONS: Record<CameraMovement, { label: string; prompt: string }> = {
  static_tripod: { label: 'Static Tripod (กล้องนิ่ง)', prompt: 'locked-off stationary tripod camera, zero shake, hyper-steady cinematic composition' },
  slow_dolly_in: { label: 'Slow Dolly In (ค่อยๆ ซูม/เคลื่อนเข้า)', prompt: 'smooth slow cinematic dolly-in camera movement pushing toward the subject' },
  slow_dolly_out: { label: 'Slow Dolly Out (ถอยหลังช้าๆ)', prompt: 'graceful slow dolly-out camera movement gently pulling back to reveal context' },
  steadycam_tracking: { label: 'Steadycam Tracking (เดินตามสมูท)', prompt: 'fluid steadycam tracking shot smoothly walking alongside subject with realistic parallax' },
  dynamic_orbit: { label: 'Dynamic Orbit (หมุนวนรอบตัว)', prompt: 'cinematic 360-degree rotational orbit camera moving around the subject smoothly' },
  pan_left_right: { label: 'Slow Pan (กวาดซ้าย-ขวา)', prompt: 'gentle horizontal panning camera movement gliding across the horizon' },
  handheld_cinematic: { label: 'Handheld Cinematic (กล้องฟิล์มถือมือ)', prompt: 'subtle organic handheld camera motion, realistic documentary kinetic feel' },
  crane_boom_down: { label: 'Crane Boom Down (กล้องเลื่อนลง)', prompt: 'vertical crane jib movement booming smoothly downward into eye-level framing' },
};

export const LIGHTING_DESCRIPTIONS: Record<LightingAtmosphere, { label: string; prompt: string }> = {
  golden_hour: { label: 'Golden Hour (แสงแดดอุ่นเย็น)', prompt: 'warm golden hour sunlight, soft volumetric amber glow, long gentle shadows, back-lit hair rim' },
  cinematic_neon_cyberpunk: { label: 'Neon Cyberpunk (แสงไฟนีออน)', prompt: 'vibrant cinematic dual-tone cyan and magenta neon lighting, reflective damp surfaces, moody contrast' },
  soft_studio_light: { label: 'Soft Studio Light (ไฟสตูดิโอนุ่ม)', prompt: 'diffused high-end studio beauty lighting, softbox wrap-around illumination, clean soft shadows' },
  moody_rim_lighting: { label: 'Moody Rim Light (ไฟขอบคมลึก)', prompt: 'moody dramatic low-key lighting with sharp edge rim light defining the character silhouette' },
  rainy_overcast_day: { label: 'Rainy Overcast (วันฝนตกฟ้าหม่น)', prompt: 'gloomy overcast diffused daylight, misty rain atmosphere, subtle desaturated cinematic tones' },
  direct_sunlight_sharp: { label: 'Direct Sunlight (แดดจ้าคมชัด)', prompt: 'crisp bright direct sunlight with sharp natural shadows, high dynamic range clarity' },
  dramatic_chiaroscuro: { label: 'Dramatic Chiaroscuro (แสงเงาคอนทราสต์จัด)', prompt: 'dramatic chiaroscuro lighting, deep rich blacks, painterly emotional lighting' },
  blue_hour_dusk: { label: 'Blue Hour Dusk (สนธยาฟ้าคราม)', prompt: 'tranquil blue hour twilight ambient light, twilight sky gradation, cool atmospheric hue' },
};

export const LENS_DESCRIPTIONS: Record<LensAesthetic, { label: string; prompt: string }> = {
  '35mm_anamorphic': { label: '35mm Anamorphic (เลนส์ภาพยนตร์ฮอลลีวูด)', prompt: 'shot on 35mm anamorphic cinema lens, subtle horizontal streak flares, shallow depth of field, 2.39:1 aspect ratio' },
  '50mm_natural': { label: '50mm Natural (มุมมองสายตาจริง)', prompt: 'shot on 50mm f/1.8 prime lens, natural human eye perspective, lifelike perspective rendering' },
  '85mm_portrait_bokeh': { label: '85mm Portrait (โบเก้ละลายหลังคมกริบ)', prompt: 'shot on 85mm f/1.4 portrait lens, creamy creamy background bokeh, tack-sharp focal subject' },
  '24mm_wide_cinematic': { label: '24mm Wide (ไวด์ทรงพลัง)', prompt: 'shot on 24mm wide-angle cinema lens, expansive field of view with minimal distortion' },
  '16mm_vintage_grain': { label: '16mm Vintage Grain (ฟิล์มคลาสสิก)', prompt: '16mm Kodak film stock aesthetic, organic fine film grain, warm nostalgic color grading' },
  '70mm_imax_sharp': { label: '70mm IMAX (คมชัดระดับมาสเตอร์พีซ)', prompt: 'shot on 70mm IMAX format, hyper-detailed photorealistic fidelity, immense clarity' },
};

export const DEFAULT_NEGATIVE_PROMPT = 
  'face distortion, face morphing, duplicate faces, asymmetrical eyes, distorted eyes, bad anatomy, extra limbs, fused fingers, cartoon, 3d render, anime, blurry, low resolution, bad proportions, unnatural head shape, jittery movement, temporal inconsistency, plastic skin texture, face bleeding, blended faces, merged facial features, clone glitch, multiple heads';

/**
 * Builds the Face Consistency Anchor formula
 */
export function buildFaceAnchor(persona: Persona): string {
  const dna = persona.faceDna;
  const parts: string[] = [];

  parts.push(`Consistent character identity of ${persona.name}`);
  if (dna.faceShape) parts.push(`face shape: ${dna.faceShape}`);
  if (dna.eyeDetails) parts.push(`eyes: ${dna.eyeDetails}`);
  if (dna.hairStyle) parts.push(`hair: ${dna.hairStyle}`);
  if (dna.skinTone) parts.push(`skin: natural authentic texture, ${dna.skinTone}`);
  if (dna.facialHair && dna.facialHair.toLowerCase() !== 'none') parts.push(`facial hair: ${dna.facialHair}`);
  if (dna.signatureFeatures) parts.push(`distinctive features: ${dna.signatureFeatures}`);

  // Active Wardrobe
  const activeWardrobe = persona.wardrobes.find((w) => w.id === persona.activeWardrobeId);
  if (activeWardrobe) {
    parts.push(`attire: wearing ${activeWardrobe.name} (${activeWardrobe.description})`);
  }

  return parts.join(', ');
}

/**
 * Compiles a full cinematic prompt for Google Flow / Veo with Multi-Character Support
 */
export function compileVeoPrompt(
  shot: Partial<ShotConfig>,
  persona: Persona,
  shotIndex: number = 0,
  isMultiShot: boolean = false,
  allPersonas: Persona[] = []
): string {
  const primaryFaceAnchor = buildFaceAnchor(persona);
  const framing = shot.framing ? FRAMING_DESCRIPTIONS[shot.framing].prompt : FRAMING_DESCRIPTIONS.medium_close_up.prompt;
  const camera = shot.cameraMovement ? CAMERA_DESCRIPTIONS[shot.cameraMovement].prompt : CAMERA_DESCRIPTIONS.slow_dolly_in.prompt;
  const lighting = shot.lighting ? LIGHTING_DESCRIPTIONS[shot.lighting].prompt : LIGHTING_DESCRIPTIONS.golden_hour.prompt;
  const lens = shot.lens ? LENS_DESCRIPTIONS[shot.lens].prompt : LENS_DESCRIPTIONS['35mm_anamorphic'].prompt;

  const userAction = shot.characterAction || shot.userPrompt || 'looking towards camera with subtle emotional expression';
  const environment = shot.sceneEnvironment || 'contemporary architectural environment with atmospheric depth';
  const emotion = shot.characterEmotion ? `emotional state: ${shot.characterEmotion}` : 'calm authentic expression';

  const motionPacingStr = shot.motionPacing === 'smooth_slowmo' 
    ? 'fluid 60fps cinematic slow-motion with organic motion blur' 
    : shot.motionPacing === 'fast_action' 
      ? 'dynamic brisk cinematic pacing' 
      : 'standard 24fps cinematic motion cadence';

  // Multi-shot continuity anchor
  const continuityTag = isMultiShot && shotIndex > 0
    ? `[Visual Continuity: Exact same character identity, clothing, hair, and facial structure as preceding shot ${shotIndex}; continuous scene lighting]`
    : `[Master Character Anchor: high facial fidelity, preserve facial features without drift]`;

  // Secondary characters (Gang of friends / co-stars in this scene)
  const secondaryPersonas = allPersonas.filter(
    (p) => p.id !== persona.id && shot.secondaryPersonaIds?.includes(p.id)
  );

  let castSection = `Subject: ${primaryFaceAnchor}`;
  if (secondaryPersonas.length > 0) {
    const friendAnchors = secondaryPersonas.map((friend) => buildFaceAnchor(friend)).join('; AND co-star: ');
    const interaction = shot.characterInteraction || 'interacting naturally, laughing, talking, and enjoying the moment together';
    castSection = `Ensemble Scene: Primary protagonist ${persona.name} (${primaryFaceAnchor}) TOGETHER WITH co-star(s) ${friendAnchors}. Group interaction: ${interaction}. Identity Disambiguation: each person must maintain their separate, distinct facial features, hair, and unique outfits without facial blending or face morphing`;
  }

  // Selected Hero Props (Boat, Desk, Weapon, Furniture, etc.)
  const selectedProps = (persona.props || []).filter((p) => shot.selectedPropIds?.includes(p.id));
  const propSection = selectedProps.length > 0
    ? `Hero Asset Continuity: precisely featuring ${selectedProps.map((p) => `${p.name} (${p.description})`).join('; ')}, maintaining exact object appearance, color, materials and design without shape drift across cuts`
    : '';

  const promptSections = [
    `Cinematic film clip: ${continuityTag}`,
    castSection,
    propSection,
    `Action & Mood: ${userAction}, ${emotion}`,
    `Environment & Setting: ${environment}`,
    `Cinematography: ${framing}, ${camera}, ${motionPacingStr}`,
    `Lighting & Ambience: ${lighting}`,
    `Optical Render: ${lens}, photorealistic 8K fidelity, Master Color Grading, filmic quality, lifelike skin pores and subsurface scattering`
  ];

  return promptSections.filter(Boolean).join('. ');
}

/**
 * Optional Gemini AI Director refinement call
 */
export async function refinePromptWithGemini(
  rawInput: string,
  persona: Persona,
  apiKey?: string
): Promise<{
  sceneEnvironment: string;
  characterAction: string;
  characterEmotion: string;
  suggestedFraming: ShotFraming;
  suggestedLighting: LightingAtmosphere;
  suggestedCamera: CameraMovement;
}> {
  // If API key is provided, we can do a real call; otherwise return smart rule-based heuristics
  if (apiKey) {
    try {
      const systemInstruction = `You are an elite Hollywood cinematographer and AI video director for Google Veo/Flow.
Given a raw user idea (in Thai or English) and a character persona, break it down into clean cinematic parameters.
Return ONLY valid JSON matching this schema:
{
  "sceneEnvironment": "detailed environment in English",
  "characterAction": "precise physical action in English",
  "characterEmotion": "authentic expression/emotion in English",
  "suggestedFraming": "extreme_close_up" | "close_up" | "medium_close_up" | "medium_shot" | "cowboy_shot" | "wide_shot" | "drone_aerial",
  "suggestedLighting": "golden_hour" | "cinematic_neon_cyberpunk" | "soft_studio_light" | "moody_rim_lighting" | "rainy_overcast_day" | "direct_sunlight_sharp" | "dramatic_chiaroscuro" | "blue_hour_dusk",
  "suggestedCamera": "static_tripod" | "slow_dolly_in" | "slow_dolly_out" | "steadycam_tracking" | "dynamic_orbit" | "pan_left_right" | "handheld_cinematic" | "crane_boom_down"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nCharacter Name: ${persona.name}\nUser Idea: ${rawInput}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local heuristics:', e);
    }
  }

  // Fallback intelligent heuristic parser
  const lower = rawInput.toLowerCase();
  let suggestedLighting: LightingAtmosphere = 'golden_hour';
  if (lower.includes('นีออน') || lower.includes('neon') || lower.includes('cyber')) suggestedLighting = 'cinematic_neon_cyberpunk';
  else if (lower.includes('ฝน') || lower.includes('rain') || lower.includes('หมอง')) suggestedLighting = 'rainy_overcast_day';
  else if (lower.includes('สตูดิโอ') || lower.includes('studio')) suggestedLighting = 'soft_studio_light';
  else if (lower.includes('ค่ำ') || lower.includes('sunset') || lower.includes('เย็น') || lower.includes('พระอาทิตย์ตก')) suggestedLighting = 'golden_hour';

  let suggestedCamera: CameraMovement = 'slow_dolly_in';
  if (lower.includes('เดิน') || lower.includes('walk') || lower.includes('ตาม')) suggestedCamera = 'steadycam_tracking';
  else if (lower.includes('หมุน') || lower.includes('orbit') || lower.includes('รอบ')) suggestedCamera = 'dynamic_orbit';
  else if (lower.includes('นิ่ง') || lower.includes('static')) suggestedCamera = 'static_tripod';

  let suggestedFraming: ShotFraming = 'medium_close_up';
  if (lower.includes('โคลสอัพ') || lower.includes('หน้า') || lower.includes('ตา') || lower.includes('close')) suggestedFraming = 'close_up';
  else if (lower.includes('เต็มตัว') || lower.includes('กว้าง') || lower.includes('wide')) suggestedFraming = 'wide_shot';

  return {
    sceneEnvironment: rawInput.includes('โตเกียว') ? 'vibrant Tokyo street corner with ambient reflections' : 'cinematic atmospheric outdoor location with natural ambient depth',
    characterAction: rawInput,
    characterEmotion: 'subtle, engaging, confident gaze',
    suggestedFraming,
    suggestedLighting,
    suggestedCamera
  };
}

/**
 * Multimodal Face Analysis with Gemini Vision
 */
export async function analyzeFaceWithGemini(
  base64DataUrl: string,
  apiKey?: string
): Promise<{
  faceShape: string;
  eyeDetails: string;
  hairStyle: string;
  skinTone: string;
  facialHair: string;
  signatureFeatures: string;
}> {
  if (apiKey) {
    try {
      const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];

        const prompt = `You are a forensic facial analyst and AI video avatar specialist.
Analyze this human face closely for character consistency preservation in Google Veo and Flow.
Extract fine visual attributes and return ONLY valid JSON matching this schema:
{
  "faceShape": "precise description of jawline and facial structure",
  "eyeDetails": "precise eye shape, color, and eyebrow contour",
  "hairStyle": "haircut, texture, color, and length",
  "skinTone": "authentic skin tone with undertone and realistic pore texture note",
  "facialHair": "description of facial hair or clean-shaven definition",
  "signatureFeatures": "distinctive marks, dimples, facial bone highlights, or unique traits"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: base64Data } }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return JSON.parse(text);
          }
        }
      }
    } catch (err) {
      console.warn('Gemini Vision analysis failed, falling back to smart defaults:', err);
    }
  }

  // Offline / instant intelligent smart defaults
  return {
    faceShape: 'chiseled jawline with proportional Asian oval face structure',
    eyeDetails: 'warm dark brown almond eyes, confident expressive gaze, defined natural browline',
    hairStyle: 'modern textured crop with clean tapered fade sides, natural jet black hair',
    skinTone: 'smooth warm honey-tan Asian skin tone with authentic realistic skin pores',
    facialHair: 'clean shaven with subtle defined shadow along the jawline',
    signatureFeatures: 'friendly subtle dimple, natural facial contour, charismatic smile'
  };
}

/**
 * 1-Click Storyboard Generator (3-Shot Narrative Sequences)
 */
export async function generateFullStoryboardWithAI(
  topic: string,
  templateType: 'podcast' | 'travel' | 'tech_review' | 'cinematic_story',
  persona: Persona,
  apiKey?: string
): Promise<ShotConfig[]> {
  // If API key is present, let Gemini compose custom 3-shot narrative
  if (apiKey && topic.trim()) {
    try {
      const systemInstruction = `You are an elite cinema director producing a 3-shot video sequence for Google Veo/Flow.
Given a topic, create exactly 3 sequential shots with visual continuity.
Return ONLY valid JSON array with 3 objects matching this schema:
[
  {
    "title": "Shot 1: Title",
    "userPrompt": "Thai or English summary",
    "framing": "medium_shot" | "close_up" | "wide_shot" | "cowboy_shot",
    "cameraMovement": "slow_dolly_in" | "steadycam_tracking" | "dynamic_orbit" | "static_tripod",
    "lighting": "golden_hour" | "cinematic_neon_cyberpunk" | "soft_studio_light" | "moody_rim_lighting",
    "lens": "35mm_anamorphic" | "85mm_portrait_bokeh" | "50mm_natural",
    "motionPacing": "smooth_slowmo" | "cinematic_standard",
    "sceneEnvironment": "detailed environment in English",
    "characterAction": "precise action in English",
    "characterEmotion": "emotion in English",
    "durationSeconds": 5
  }
]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nCharacter: ${persona.name}\nTopic: ${topic}\nStyle: ${templateType}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const rawShots = JSON.parse(text);
          return rawShots.map((s: Partial<ShotConfig>, idx: number) => ({
            id: `shot_${Date.now()}_${idx}`,
            title: s.title || `Shot ${idx + 1}`,
            userPrompt: s.userPrompt || topic,
            framing: s.framing || 'medium_shot',
            cameraMovement: s.cameraMovement || 'slow_dolly_in',
            lighting: s.lighting || 'golden_hour',
            lens: s.lens || '35mm_anamorphic',
            motionPacing: s.motionPacing || 'cinematic_standard',
            sceneEnvironment: s.sceneEnvironment || 'contemporary aesthetic backdrop',
            characterAction: s.characterAction || 'looking towards camera',
            characterEmotion: s.characterEmotion || 'authentic confident mood',
            durationSeconds: s.durationSeconds || 5,
            compiledPrompt: '',
            negativePrompt: DEFAULT_NEGATIVE_PROMPT
          }));
        }
      }
    } catch (e) {
      console.warn('AI Storyboard generation failed, falling back to preset template:', e);
    }
  }

  // Pre-crafted master Hollywood templates
  const timestamp = Date.now();
  if (templateType === 'podcast') {
    return [
      {
        id: `shot_${timestamp}_1`,
        title: 'Shot 1: The Hook (เปิดประเด็น)',
        userPrompt: 'นั่งในห้องสตูดิโอด้านหน้าไมโครโฟน พูดเปิดประเด็นด้วยความมั่นใจ',
        framing: 'medium_shot',
        cameraMovement: 'slow_dolly_in',
        lighting: 'soft_studio_light',
        lens: '50mm_natural',
        motionPacing: 'cinematic_standard',
        sceneEnvironment: 'modern warm-wood podcast studio with acoustic panels and warm Edison bulb background',
        characterAction: 'seated at podcast table leaning slightly forward, gesturing with hands while speaking engagingly',
        characterEmotion: 'passionate, articulate, energetic gaze',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      },
      {
        id: `shot_${timestamp}_2`,
        title: 'Shot 2: The Core Insight (ประเด็นสำคัญ)',
        userPrompt: 'กล้องโคลสอัพที่ใบหน้า เน้นการแสดงอารมณ์และคำพูดคมๆ',
        framing: 'close_up',
        cameraMovement: 'static_tripod',
        lighting: 'soft_studio_light',
        lens: '85mm_portrait_bokeh',
        motionPacing: 'cinematic_standard',
        sceneEnvironment: 'same acoustic podcast studio, dramatic soft shallow depth of field',
        characterAction: 'speaking with high focus, subtle eyebrow raise emphasizing a crucial point',
        characterEmotion: 'deeply convincing and sincere eye contact with camera',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      },
      {
        id: `shot_${timestamp}_3`,
        title: 'Shot 3: The Resolution (สรุปข้อคิด)',
        userPrompt: 'กล้องขยับออกเป็นมุมกว้าง ยิ้มอย่างพึงพอใจและสรุปความคิด',
        framing: 'medium_close_up',
        cameraMovement: 'slow_dolly_out',
        lighting: 'soft_studio_light',
        lens: '35mm_anamorphic',
        motionPacing: 'cinematic_standard',
        sceneEnvironment: 'podcast studio showing ambient environment context',
        characterAction: 'nodding in agreement with self, leaning back smoothly with a charismatic warm smile',
        characterEmotion: 'welcoming, inspiring, satisfied smile',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      }
    ];
  }

  if (templateType === 'travel') {
    return [
      {
        id: `shot_${timestamp}_1`,
        title: 'Shot 1: The Arrival (มาถึงสถานที่)',
        userPrompt: 'เดินก้าวเข้าสู่ถนนสายคึกคัก มองรอบๆ ด้วยความตื่นเต้น',
        framing: 'wide_shot',
        cameraMovement: 'steadycam_tracking',
        lighting: 'golden_hour',
        lens: '24mm_wide_cinematic',
        motionPacing: 'smooth_slowmo',
        sceneEnvironment: 'atmospheric historic street bathed in warm golden hour sunlight with pedestrians in soft focus background',
        characterAction: 'walking forward with effortless swagger, looking around in awe',
        characterEmotion: 'wonder, excitement, adventurous vibe',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      },
      {
        id: `shot_${timestamp}_2`,
        title: 'Shot 2: The Stroll (เดินชิลล์)',
        userPrompt: 'เดินถือเครื่องดื่มหรือกระเป๋า กล้องเดินตามด้านหน้าแบบสมูท',
        framing: 'medium_shot',
        cameraMovement: 'steadycam_tracking',
        lighting: 'golden_hour',
        lens: '35mm_anamorphic',
        motionPacing: 'smooth_slowmo',
        sceneEnvironment: 'scenic street alley lined with artisan cafes and lanterns glowing',
        characterAction: 'walking smoothly towards camera, occasional glance towards local storefronts',
        characterEmotion: 'relaxed, stylish, completely in the element',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      },
      {
        id: `shot_${timestamp}_3`,
        title: 'Shot 3: Sunset Gaze (ดื่มด่ำวิวเย็น)',
        userPrompt: 'หยุดยืนมองวิวพระอาทิตย์ตก แสงแดดสีทองส่องขอบผม',
        framing: 'close_up',
        cameraMovement: 'dynamic_orbit',
        lighting: 'golden_hour',
        lens: '85mm_portrait_bokeh',
        motionPacing: 'smooth_slowmo',
        sceneEnvironment: 'panoramic viewpoint overlooking city skyline bathed in amber dusk sky',
        characterAction: 'pausing and smiling gently into the sunset breeze as camera orbits 45 degrees',
        characterEmotion: 'pure tranquility and genuine happiness',
        durationSeconds: 5,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      }
    ];
  }

  // Default Cinematic Story
  return [
    {
      id: `shot_${timestamp}_1`,
      title: 'Shot 1: The Silhouette (เปิดตัวลึกลับ)',
      userPrompt: 'ยืนในเงามืด แสงไฟนีออนส่องขอบตัว ละอองฝนโปรยปราย',
      framing: 'cowboy_shot',
      cameraMovement: 'slow_dolly_in',
      lighting: 'cinematic_neon_cyberpunk',
      lens: '35mm_anamorphic',
      motionPacing: 'smooth_slowmo',
      sceneEnvironment: 'rain-slicked urban rooftop with glowing neon signs reflected on damp ground',
      characterAction: 'standing still with coat collar adjusted against the gentle rain mist',
      characterEmotion: 'enigmatic, resolute, commanding presence',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT
    },
    {
      id: `shot_${timestamp}_2`,
      title: 'Shot 2: The Face Reveal (เผยใบหน้าคมชัด)',
      userPrompt: 'หันหน้ามามองกล้อง แสงไฟนีออนสีฟ้าชมพูกระทบใบหน้า',
      framing: 'close_up',
      cameraMovement: 'slow_dolly_in',
      lighting: 'cinematic_neon_cyberpunk',
      lens: '85mm_portrait_bokeh',
      motionPacing: 'smooth_slowmo',
      sceneEnvironment: 'neon-lit city backdrop with creamy bokeh orbs floating in darkness',
      characterAction: 'turning gaze directly into camera lens with piercing confidence',
      characterEmotion: 'intense charismatic determination',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT
    },
    {
      id: `shot_${timestamp}_3`,
      title: 'Shot 3: The Forward Step (ก้าวเดินต่อ)',
      userPrompt: 'ก้าวเดินไปข้างหน้า กล้องหมุนตามตัวอย่างสมูท',
      framing: 'medium_shot',
      cameraMovement: 'steadycam_tracking',
      lighting: 'cinematic_neon_cyberpunk',
      lens: '35mm_anamorphic',
      motionPacing: 'smooth_slowmo',
      sceneEnvironment: 'cyberpunk street corridor with ambient steam rising from manholes',
      characterAction: 'walking forward with steady cinematic momentum passing out of frame',
      characterEmotion: 'unstoppable confidence',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT
    }
  ];
}

