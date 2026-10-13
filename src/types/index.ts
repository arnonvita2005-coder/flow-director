export interface FaceDNA {
  faceShape: string;
  eyeDetails: string;
  hairStyle: string;
  skinTone: string;
  facialHair: string;
  signatureFeatures: string;
}

export interface WardrobePreset {
  id: string;
  name: string;
  description: string;
  category: 'casual' | 'formal' | 'streetwear' | 'cinematic';
}

export interface PropAsset {
  id: string;
  name: string;
  category: 'vehicle' | 'furniture' | 'gear_prop' | 'custom';
  photoUrl?: string;
  description: string;
}

export interface Persona {
  id: string;
  name: string;
  isDefault: boolean;
  avatarUrl?: string;
  referenceImages: {
    id: string;
    url: string;
    angle: 'front' | 'angle_45' | 'profile' | 'close_up';
    label: string;
  }[];
  faceDna: FaceDNA;
  wardrobes: WardrobePreset[];
  activeWardrobeId: string;
  props: PropAsset[];
}

export type ShotFraming = 
  | 'extreme_close_up'
  | 'close_up'
  | 'medium_close_up'
  | 'medium_shot'
  | 'cowboy_shot'
  | 'wide_shot'
  | 'extreme_wide'
  | 'drone_aerial';

export type CameraMovement = 
  | 'static_tripod'
  | 'slow_dolly_in'
  | 'slow_dolly_out'
  | 'steadycam_tracking'
  | 'dynamic_orbit'
  | 'pan_left_right'
  | 'handheld_cinematic'
  | 'crane_boom_down';

export type LightingAtmosphere = 
  | 'golden_hour'
  | 'cinematic_neon_cyberpunk'
  | 'soft_studio_light'
  | 'moody_rim_lighting'
  | 'rainy_overcast_day'
  | 'direct_sunlight_sharp'
  | 'dramatic_chiaroscuro'
  | 'blue_hour_dusk';

export type LensAesthetic = 
  | '35mm_anamorphic'
  | '50mm_natural'
  | '85mm_portrait_bokeh'
  | '24mm_wide_cinematic'
  | '16mm_vintage_grain'
  | '70mm_imax_sharp';

export interface ShotConfig {
  id: string;
  title: string;
  userPrompt: string;
  framing: ShotFraming;
  cameraMovement: CameraMovement;
  lighting: LightingAtmosphere;
  lens: LensAesthetic;
  motionPacing: 'smooth_slowmo' | 'cinematic_standard' | 'fast_action';
  sceneEnvironment: string;
  characterAction: string;
  characterEmotion: string;
  durationSeconds: number;
  selectedPropIds?: string[];
  secondaryPersonaIds?: string[];
  characterInteraction?: string;
  compiledPrompt: string;
  negativePrompt: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  personaId: string;
  shots: ShotConfig[];
  createdAt: number;
}
