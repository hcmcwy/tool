export type ToolId =
  | 'phillips_screwdriver' // 十字螺絲批
  | 'flathead_screwdriver'   // 一字螺絲批
  | 'adjustable_wrench'     // 活動扳手 (士巴拿)
  | 'claw_hammer'           // 羊角錘
  | 'rubber_mallet'         // 橡皮鎚
  | 'allen_key'             // 六角匙 (內六角扳手)
  | 'needle_nose_pliers'    // 尖嘴鉗
  | 'combination_pliers'    // 老虎鉗 (鋼絲鉗)
  | 'tape_measure'          // 捲尺 (拉尺)
  | 'spirit_level'          // 水平尺 (水泡尺)
  | 'utility_knife'         // 美工刀 (界刀)
  | 'teflon_tape'           // 止洩帶 (水管生料帶)
  | 'insulation_tape';      // 電工絕緣膠布

export interface ToolDefinition {
  id: ToolId;
  name: string;
  englishName: string;
  category: 'fastening' | 'turning' | 'striking' | 'pliers' | 'measuring' | 'cutting' | 'materials';
  icon: string;
  description: string;
  bestFor: string;
  dontUseFor: string;
  safetyTip: string;
  videoHighlight: string; // 來自《常用家居維修手動工具介紹》的要點
}

export interface MissionStep {
  id: string;
  title: string;
  prompt: string;
  detailHint: string;
  requiredToolId: ToolId;
  targetProgress: number; // e.g., 100
  actionType: 'rotate' | 'click_hold' | 'tap_strike' | 'balance' | 'measure_align' | 'extract' | 'wrap';
  toolExplanationOnWrong: string;
  successMessage: string;
}

export interface RepairMission {
  id: string;
  title: string;
  subtitle: string;
  category: 'furniture' | 'plumbing' | 'wall' | 'electronics' | 'doors';
  icon: string;
  description: string;
  difficulty: '簡單' | '中等' | '挑戰';
  steps: MissionStep[];
}

export interface QuickFixChallenge {
  id: string;
  scenario: string;
  itemImage: string;
  correctToolId: ToolId;
  wrongTools: ToolId[];
  explanation: string;
  actionPrompt: string;
}
