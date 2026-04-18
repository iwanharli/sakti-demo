export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'error' | 'warning';
}

export interface AlertItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  time: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  badgeColor?: 'red' | 'amber';
}

export interface StatCardData {
  label: string;
  value: string | number;
  subtext: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: string;
  color: 'red' | 'amber' | 'green' | 'cyan' | 'purple';
}

export interface TimelineItem {
  time: string;
  event?: string;
  content: string;
  tags: string[];
  color: 'red' | 'amber' | 'green' | 'cyan' | 'purple';
  region?: string;
  subRegions?: string[];
  impact?: string;
  duration?: string;
  magnitude?: string;
  depth?: string;
  coordinates?: string;
  epicenter?: string;
  status?: string;
}

export interface CaseItem {
  id: string;
  type: string;
  typeColor: string;
  location: string;
  date: string;
  investigator: string;
  stage: string;
  stageColor: string;
  status: 'open' | 'progress' | 'closed';
}

export interface PatrolUnit {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'active' | 'responding' | 'monitoring' | 'investigating';
}

export interface PersonRisk {
  id: string;
  initials: string;
  name: string;
  description: string;
  score: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface KeywordAlert {
  keyword: string;
  platform: string;
  volume: string;
  spike: string;
  spikeColor: string;
  sentiment: string;
  sentimentColor: string;
  status: string;
  statusColor: string;
}

export interface CollabItem {
  icon: string;
  name: string;
  description: string;
  status: 'active' | 'partial' | 'offline';
}

export interface SystemLayer {
  name: string;
  health: number;
  status: string;
  statusColor: string;
}

export interface AuditLogItem {
  time: string;
  content: string;
  type: string;
  typeColor: string;
}

export interface BencanaAlert {
  time: string;
  source: string;
  content: string;
  tags: string[];
  color: 'red' | 'amber' | 'green' | 'cyan';
}

export interface ResourceItem {
  name: string;
  current: number;
  total: number;
  status: 'good' | 'warning' | 'critical';
}

export interface WeatherDay {
  day: string;
  isToday?: boolean;
  icon: string;
  high: number;
  low: number;
  rainChance: number;
}

export interface SembakoItem {
  name: string;
  icon: string;
  price: string;
  change: string;
  changeColor: string;
  het: string;
  status: string;
  statusColor: string;
  trend: string;
}

export interface RiskMatrixItem {
  kecamatan: string;
  score: number;
  level: string;
  levelColor: string;
  threats: string;
  trend: string;
  trendColor: string;
}

export interface VitalObject {
  name: string;
  type: string;
  status: 'safe' | 'warning' | 'critical';
}

export interface MitigationRecommendation {
  priority: number;
  title: string;
  description: string;
  color: 'red' | 'amber' | 'cyan' | 'green';
}

// End of types definition
