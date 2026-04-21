import { useState, useEffect, useMemo, useRef } from 'react';
import { getApiBase, authFetch } from '../store/useAppStore';
import ForceGraph2D from 'react-force-graph-2d';
import KeywordsModal from '../components/KeywordsModal';
import NegativeSentimentModal from '../components/NegativeSentimentModal';
import EmotionModal from '../components/EmotionModal';
import KeywordIntelligenceCard from '../components/KeywordIntelligenceCard';

const CardFilterDropdown = ({ 
  selectedKeywords, 
  onToggle, 
  options, 
  isOpen, 
  setIsOpen 
}: any) => {
  return (
    <div className="relative keyword-dropdown-container z-40">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 hover:border-amber-500/50 transition-all group cursor-pointer"
      >
        <i className="fa-solid fa-filter text-amber-500 text-[11px] group-hover:drop-shadow-[0_0_5px_#f59e0b] transition-all" />
        <div className="bg-transparent text-[11px] text-gray-300 font-mono focus:outline-none truncate max-w-[120px]">
          {selectedKeywords.includes('All') 
            ? 'SEMUA KEYWORD' 
            : selectedKeywords.length === 1 
              ? selectedKeywords[0].toUpperCase() 
              : `${selectedKeywords.length} KEYWORD`}
        </div>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-gray-600 text-[9px] ml-1`}></i>
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0b1419] border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl py-2 overflow-hidden max-h-[300px] overflow-y-auto ews-scrollbar">
          <div className="text-[9px] font-orbitron text-gray-500 px-3 pb-2 mb-1 border-b border-white/5 uppercase tracking-widest">Filter Parameter</div>
          
          <label className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.03] cursor-pointer cursor-crosshair">
            <input 
              type="checkbox" 
              checked={selectedKeywords.includes('All')}
              onChange={() => onToggle('All')}
              className="appearance-none w-3.5 h-3.5 rounded-sm border border-gray-600 checked:bg-amber-500 checked:border-amber-500 focus:outline-none flex items-center justify-center shrink-0
              after:content-[''] after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:scale-0 checked:after:scale-100 after:transition-transform"
            />
            <span className={`text-[11px] font-mono tracking-widest flex-1 truncate ${selectedKeywords.includes('All') ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>SEMUA KEYWORD</span>
          </label>
          
          {options?.map((kw: any) => (
            <label key={kw.keyword} className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.03] cursor-pointer cursor-crosshair">
              <input 
                type="checkbox" 
                checked={selectedKeywords.includes(kw.keyword)}
                onChange={() => onToggle(kw.keyword)}
                className="appearance-none w-3.5 h-3.5 rounded-sm border border-gray-600 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none flex items-center justify-center shrink-0
                after:content-[''] after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:scale-0 checked:after:scale-100 after:transition-transform"
              />
              <span className={`text-[11px] font-mono tracking-widest flex-1 truncate ${selectedKeywords.includes(kw.keyword) ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-gray-400'}`}>
                {kw.keyword.toUpperCase()}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CardSentimentDropdown = ({ selected, onSelect, isOpen, setIsOpen }: any) => {
  const options = [
    { label: 'SEMUA SENTIMEN', value: 'All', color: 'bg-cyan-500' },
    { label: 'POSITIF', value: 'Positif', color: 'bg-emerald-500' },
    { label: 'NEGATIF', value: 'Negatif', color: 'bg-red-500' },
    { label: 'NETRAL', value: 'Netral', color: 'bg-gray-500' }
  ];

  const current = options.find(o => o.value === selected) || options[0];

  return (
    <div className="relative sentiment-dropdown">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 hover:border-cyan-500/50 transition-all font-mono text-[10px] text-gray-300"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${current.color} shadow-[0_0_5px_currentColor]`} />
        {current.label}
        <i className={`fa-solid fa-chevron-down ml-1 text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-[10px] font-mono flex items-center gap-3 transition-colors hover:bg-white/5 ${selected === opt.value ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${opt.color} ${selected === opt.value ? 'shadow-[0_0_8px_currentColor]' : ''}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CardPlatformDropdown = ({ selected, onSelect, isOpen, setIsOpen }: any) => {
  const options = [
    { label: 'SEMUA PLATFORM', value: 'All', icon: 'fa-solid fa-globe', color: 'text-cyan-400' },
    { label: 'X (TWITTER)', value: 'twitter', icon: 'fa-brands fa-x-twitter', color: 'text-white' },
    { label: 'INSTAGRAM', value: 'instagram', icon: 'fa-brands fa-instagram', color: 'text-[#E4405F]' },
    { label: 'TIKTOK', value: 'tiktok', icon: 'fa-brands fa-tiktok', color: 'text-white' },
    { label: 'YOUTUBE', value: 'youtube', icon: 'fa-brands fa-youtube', color: 'text-[#FF0000]' },
    { label: 'FACEBOOK', value: 'facebook', icon: 'fa-brands fa-facebook', color: 'text-[#1877F2]' }
  ];

  const current = options.find(o => o.value.toLowerCase() === selected.toLowerCase()) || options[0];

  return (
    <div className="relative platform-dropdown">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 hover:border-cyan-500/50 transition-all font-mono text-[10px] text-gray-300"
      >
        <i className={`${current.icon} ${current.color} text-[11px] drop-shadow-[0_0_3px_currentColor]`} />
        {current.label}
        <i className={`fa-solid fa-chevron-down ml-1 text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-[10px] font-mono flex items-center gap-3 transition-colors hover:bg-white/5 ${selected === opt.value ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
            >
              <i className={`${opt.icon} ${opt.color} w-4 text-[12px] flex justify-center`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FloatingNetworkHUD = ({ nodes, links, limit, setLimit }: any) => {
  const options = [
    { label: 'FAST', value: 200, color: 'text-emerald-400' },
    { label: 'BALANCED', value: 500, color: 'text-cyan-400' },
    { label: 'DETAILED', value: 1000, color: 'text-blue-400' },
    { label: 'MAXIMUM', value: 2000, color: 'text-purple-400' }
  ];

  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-3 pointer-events-auto">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-3 min-w-[160px]">
        {/* Telemetry Section */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Topology</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-circle-nodes text-cyan-400 text-[10px]"></i>
                <span className="text-[11px] font-mono text-gray-100 font-bold">{nodes}</span>
              </div>
              <div className="w-px h-2.5 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-share-nodes text-amber-500 text-[10px]"></i>
                <span className="text-[11px] font-mono text-gray-100 font-bold">{links}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Section */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Capacity Limit</span>
          <div className="flex flex-wrap gap-1.5">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLimit(opt.value)}
                className={`px-2 py-1 rounded border text-[9px] font-mono transition-all ${
                  limit === opt.value 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import CardDateRangePicker from '../components/CommandCenter/shared/CardDateRangePicker';

export default function Osint() {
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 1000, height: 550 });

  // Real Data States
  const [summary, setSummary] = useState<any>(null);
  const [keywordSummary, setKeywordSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [network, setNetwork] = useState<any>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Date Range States (Default: Today, with 5-day depth for tactical cards)
  const today = new Date().toISOString().split('T')[0];
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [globalDate, setGlobalDate] = useState(today); // For initial sync only
  
  const [trendRange, setTrendRange] = useState({ start: today, end: today });
  const [keywordRange, setKeywordRange] = useState({ start: fiveDaysAgo, end: today });
  const [networkRange, setNetworkRange] = useState({ start: today, end: today });
  const [postRange, setPostRange] = useState({ start: fiveDaysAgo, end: today });

  const [trendKeywords, setTrendKeywords] = useState<string[]>(['All']);
  const [trendPlatform, setTrendPlatform] = useState('All');
  const [networkKeywords, setNetworkKeywords] = useState<string[]>(['All']);
  const [postKeywords, setPostKeywords] = useState<string[]>(['All']);

  const [networkSentiment, setNetworkSentiment] = useState('All');
  const [postSentiment, setPostSentiment] = useState('All');
  const [networkPlatform, setNetworkPlatform] = useState('All');
  const [postPlatform, setPostPlatform] = useState('All');
  const [networkLimit, setNetworkLimit] = useState(1000);
  const [postSearch, setPostSearch] = useState('');
  const [debouncedPostSearch, setDebouncedPostSearch] = useState('');
  const [postPage, setPostPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPostSearch(postSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [postSearch]);

  // Menu states
  const [isTrendFilterOpen, setIsTrendFilterOpen] = useState(false);
  const [isTrendPlatformOpen, setIsTrendPlatformOpen] = useState(false);
  const [isNetworkFilterOpen, setIsNetworkFilterOpen] = useState(false);
  const [isPostFilterOpen, setIsPostFilterOpen] = useState(false);
  const [isNetworkSentimentOpen, setIsNetworkSentimentOpen] = useState(false);
  const [isPostSentimentOpen, setIsPostSentimentOpen] = useState(false);
  const [isNetworkPlatformOpen, setIsNetworkPlatformOpen] = useState(false);
  const [isPostPlatformOpen, setIsPostPlatformOpen] = useState(false);

  const [showHashtags, setShowHashtags] = useState(true);
  
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
  const [isNegModalOpen, setIsNegModalOpen] = useState(false);
  const [isEmotionModalOpen, setIsEmotionModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggle = (kw: string, setter: Function) => {
    setter((prev: string[]) => {
      if (kw === 'All') return ['All'];
      let next = prev.filter(k => k !== 'All');
      if (next.includes(kw)) {
        next = next.filter(k => k !== kw);
        return next.length === 0 ? ['All'] : next;
      }
      return [...next, kw];
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.keyword-dropdown-container')) {
        setIsTrendFilterOpen(false);
        setIsNetworkFilterOpen(false);
        setIsPostFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setGraphDimensions({
          width: isFullScreen ? window.innerWidth : containerRef.current.clientWidth,
          height: isFullScreen ? window.innerHeight : (containerRef.current.clientHeight || 530)
        });
      }
    };

    updateDimensions();
    // Multi-stage timeout to ensure layout stability
    setTimeout(updateDimensions, 100);
    setTimeout(updateDimensions, 500);
    setTimeout(updateDimensions, 1000);
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [mounted, isFullScreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cardRef.current?.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
    }
  };

  const fetchSummary = async (s?: string, e?: string, kws?: string[], plt?: string) => {
    try {
      const apiBase = getApiBase();
      const sParam = s ? `startDate=${s}` : '';
      const eParam = e ? `&endDate=${e}` : '';
      const kwParam = kws && !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const pltParam = plt && plt !== 'All' ? `&platform=${plt}` : '';
      const res = await authFetch(`${apiBase}/osint/summary?${sParam}${eParam}${kwParam}${pltParam}`);
      if (res.ok) {
        const sumData = await res.json();
        setSummary(sumData);
        if (!s && sumData.startDate) {
          setGlobalDate(sumData.startDate);
          setTrendRange({ start: sumData.startDate, end: sumData.endDate });
          setNetworkRange({ start: sumData.startDate, end: sumData.endDate });
          setPostRange({ start: sumData.startDate, end: sumData.endDate });
        }
      }
    } catch (err) {}
  };

  const fetchTrend = async (s: string, e: string, kws: string[], platform: string = 'All') => {
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const pltParam = platform !== 'All' ? `&platform=${platform}` : '';
      const res = await authFetch(`${apiBase}/osint/sentiment-trend?startDate=${s}&endDate=${e}${kwParam}${pltParam}`);
      if (res.ok) setTrend(await res.json());
    } catch (err) {}
  };

  const fetchKeywordSummary = async (s: string, e: string) => {
    try {
      const apiBase = getApiBase();
      const res = await authFetch(`${apiBase}/osint/summary?startDate=${s}&endDate=${e}`);
      if (res.ok) setKeywordSummary(await res.json());
    } catch (err) {}
  };

  const fetchNetwork = async (s: string, e: string, kws: string[], sent: string, plat: string, lim: number) => {
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const sentParam = sent !== 'All' ? `&sentiment=${sent}` : '';
      const platParam = plat !== 'All' ? `&platform=${plat}` : '';
      const limParam = `&limit=${lim}`;
      const res = await authFetch(`${apiBase}/osint/network?startDate=${s}&endDate=${e}${kwParam}${sentParam}${platParam}${limParam}`);
      if (res.ok) setNetwork(await res.json());
    } catch (err) {}
  };

  const fetchPosts = async (s: string, e: string, kws: string[], sent: string, plat: string, search?: string) => {
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const sentParam = sent !== 'All' ? `&sentiment=${sent}` : '';
      const platParam = plat !== 'All' ? `&platform=${plat}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      // Removed limit=20 to "load all" as requested
      const res = await authFetch(`${apiBase}/osint/posts?startDate=${s}&endDate=${e}${kwParam}${sentParam}${platParam}${searchParam}`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchSummary();
      setIsLoading(false);
    };
    setMounted(true);
    init();
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTrend(trendRange.start, trendRange.end, trendKeywords, trendPlatform);
      fetchSummary(trendRange.start, trendRange.end, trendKeywords, trendPlatform);
    }
  }, [mounted, trendRange, trendKeywords.join(','), trendPlatform]);

  useEffect(() => {
    if (mounted) {
      fetchNetwork(networkRange.start, networkRange.end, networkKeywords, networkSentiment, networkPlatform, networkLimit);
    }
  }, [mounted, networkRange, networkKeywords.join(','), networkSentiment, networkPlatform, networkLimit]);

  useEffect(() => {
    if (mounted) {
      fetchKeywordSummary(keywordRange.start, keywordRange.end);
    }
  }, [mounted, keywordRange]);

  useEffect(() => {
    if (mounted) {
      setPostPage(1); // Reset to first page on filter change
      fetchPosts(postRange.start, postRange.end, postKeywords, postSentiment, postPlatform, debouncedPostSearch);
    }
  }, [mounted, postRange, postKeywords.join(','), postSentiment, postPlatform, debouncedPostSearch]);

  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * 10;
    return posts.slice(start, start + 10);
  }, [posts, postPage]);

  const totalPages = Math.ceil(posts.length / 10);

  const filteredNetwork = useMemo(() => {
    if (showHashtags) return network;
    const nodes = network.nodes.filter((n: any) => n.type !== 'hashtag');
    const nodeIds = new Set(nodes.map((n: any) => n.id));
    const links = network.links.filter((l: any) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    return { nodes, links };
  }, [network, showHashtags]);

  // Sentiment Data Mapper for SVG Chart
  const sentimentData = useMemo(() => {
    if (!trend.length) return [];
    
    return trend.map((d, i) => {
      const x = (i / (trend.length - 1 || 1)) * 1000;
      const date = new Date(d.hour);
      const label = i % 4 === 0 ? `${String(date.getHours()).padStart(2, '0')}:00` : '';
      
      // Calculate Y positions (inverted SVG coordinates, 140 height)
      // Map counts (0-N) to Y (110-20)
      const maxCount = Math.max(...trend.map(t => Math.max(t.pos, t.neg, t.neut, 1)));
      const scale = 180 / maxCount;
      
      return {
        x,
        time: label,
        fullTime: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        fullDate: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        pos: 210 - (d.pos * scale),
        neg: 210 - (d.neg * scale),
        neut: 210 - (d.neut * scale),
        raw: d
      };
    });
  }, [trend]);

  const posPath = sentimentData.length > 0 ? `M${sentimentData.map(d => `${d.x},${d.pos}`).join(' L')}` : '';
  const negPath = sentimentData.length > 0 ? `M${sentimentData.map(d => `${d.x},${d.neg}`).join(' L')}` : '';
  const neutPath = sentimentData.length > 0 ? `M${sentimentData.map(d => `${d.x},${d.neut}`).join(' L')}` : '';
  const posArea = sentimentData.length > 0 ? `${posPath} L1000,210 L0,210 Z` : '';
  const negArea = sentimentData.length > 0 ? `${negPath} L1000,210 L0,210 Z` : '';
  const neutArea = sentimentData.length > 0 ? `${neutPath} L1000,210 L0,210 Z` : '';

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!sentimentData.length) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    
    let closestIdx = 0;
    let minDiff = Math.abs(sentimentData[0].x - x);
    
    sentimentData.forEach((d, i) => {
      const diff = Math.abs(d.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    setHoverIdx(closestIdx);
  };

  // Metric Calculation
  const totalPosts = summary?.platforms?.reduce((acc: number, p: any) => acc + p.count, 0) || 0;
  const targetPlatforms = ['twitter', 'instagram', 'tiktok', 'youtube', 'facebook'];
  const topPlatforms = (summary?.platforms || [])
    .filter((p: any) => targetPlatforms.includes(p.platform.toLowerCase()))
    .sort((a: any, b: any) => targetPlatforms.indexOf(a.platform.toLowerCase()) - targetPlatforms.indexOf(b.platform.toLowerCase()));
  const keywordCount = summary?.keywords?.length || 0;
  
  const totalNeg = summary?.platforms?.reduce((acc: number, p: any) => acc + (p.neg_count || 0), 0) || 0;
  const totalCount = summary?.platforms?.reduce((acc: number, p: any) => acc + (p.count || 0), 0) || 0;
  const avgNegPct = totalCount > 0 ? (totalNeg / totalCount) * 100 : 0;

  // Emotion Aggregation
  const emotions = summary?.emotions || { anger: 0, fear: 0, sadness: 0, joy: 0, surprise: 0 };
  const totalEmotions = Object.values(emotions).reduce((a: number, b: any) => a + b, 0) || 1;
  const sortedEmotions = Object.entries(emotions).sort(([,a]: any, [,b]: any) => b - a);
  const topEmotion = sortedEmotions[0][0];
  const topPct = (Number(sortedEmotions[0][1]) / totalEmotions) * 100;

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="ews-stat-card purple">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Jumlah Postingan</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">
            {totalPosts > 1000 ? `${(totalPosts / 1000).toFixed(1)}K` : totalPosts}
          </div>
          <div className="text-[13px] text-gray-500 uppercase tracking-widest font-mono">AKTIVITAS HARIAN</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-purple-500">
            <i className="fa-solid fa-earth-americas"></i>
          </div>
        </div>

        <div 
          className="ews-stat-card amber cursor-pointer hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden"
          onClick={() => setIsKeywordsModalOpen(true)}
        >
          <div className="absolute inset-0 bg-amber-500/0 group-hover/stat:bg-amber-500/[0.02] transition-colors" />
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 relative z-10">Keyword Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1 relative z-10">{keywordCount}</div>
          <div className="flex items-center gap-2 text-[13px] relative z-10">
            <span className="text-amber-400 uppercase font-black font-mono flex items-center gap-2">
              KATEGORI AKTIF
              <i className="fa-solid fa-chevron-right text-[8px] animate-bounce-x"></i>
            </span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500 group-hover/stat:scale-110 transition-transform">
            <i className="fa-solid fa-bolt-lightning"></i>
          </div>
        </div>

        <div 
          className="ews-stat-card red cursor-pointer hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden"
          onClick={() => setIsNegModalOpen(true)}
        >
          <div className="absolute inset-0 bg-red-500/0 group-hover/stat:bg-red-500/[0.02] transition-colors" />
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 relative z-10">Sentimen Negatif</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1 relative z-10">{avgNegPct.toFixed(1)}%</div>
          <div className="flex items-center gap-2 text-[13px] relative z-10">
            <span className="text-red-500 uppercase font-black font-mono flex items-center gap-2">
              TINGKAT NEGATIF
              <i className="fa-solid fa-triangle-exclamation text-[10px] animate-pulse"></i>
            </span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500 group-hover/stat:scale-110 transition-transform">
            <i className="fa-solid fa-fire-alt"></i>
          </div>
        </div>
      </div>

      {/* Real-time Sentiment - Full Width */}
      <div className="ews-card p-0 relative z-30 group/card border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
        {/* Decorative Backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent mix-blend-overlay" />
        
        <div className="ews-hud-corner ews-hud-tl" />
        <div className="ews-hud-corner ews-hud-tr" />
        <div className="ews-hud-corner ews-hud-bl" />
        <div className="ews-hud-corner ews-hud-br" />
        <div className="ews-card-header-bar" />
        
        <div className="p-6 relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <i className="fa-solid fa-chart-line text-2xl drop-shadow-[0_0_8px_#22d3ee]"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-xl text-white tracking-wide block drop-shadow-lg">
                  Sentimen Analisis
                </span>
                <span className="text-[11px] text-cyan-400 font-mono uppercase tracking-[0.3em] flex items-center gap-2 mt-1.5 opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                  Analisis Volume • Pelacakan Polaritas
                </span>
              </div>
            </div>
            
            {/* Control Panel */}
            <div className="flex items-center bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02]">
                <CardDateRangePicker 
                  start={trendRange.start} 
                  end={trendRange.end} 
                  setRange={setTrendRange} 
                />

                <CardFilterDropdown
                  selectedKeywords={trendKeywords}
                  onToggle={(kw: string) => handleToggle(kw, setTrendKeywords)}
                  options={summary?.keywords}
                  isOpen={isTrendFilterOpen}
                  setIsOpen={setIsTrendFilterOpen}
                />

                <CardPlatformDropdown
                  selected={trendPlatform}
                  onSelect={setTrendPlatform}
                  isOpen={isTrendPlatformOpen}
                  setIsOpen={setIsTrendPlatformOpen}
                />
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6 px-6 py-2 border-l border-white/10 bg-gradient-to-r from-transparent to-cyan-500/5">
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Analytic Range</div>
                  <div className="text-[11px] font-orbitron text-emerald-400 font-bold uppercase drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                    {trendRange.start === trendRange.end ? trendRange.start : `${trendRange.start} → ${trendRange.end}`}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Frequency</div>
                  <div className="text-[13px] font-orbitron text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{trend.length}h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-8 px-6">
          <svg 
            viewBox="0 0 1000 240" 
            className="w-full h-80 cursor-crosshair" 
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="neonPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="neonNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="neonNeut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {sentimentData.length > 0 && (
              <>
                <path d={posArea} fill="url(#neonPos)"/>
                <path d={posPath} fill="none" stroke="#10b981" strokeWidth="1.2" />
                <path d={negArea} fill="url(#neonNeg)"/>
                <path d={negPath} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,3" />
                <path d={neutArea} fill="url(#neonNeut)"/>
                <path d={neutPath} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>

                {hoverIdx !== null && sentimentData[hoverIdx] && (
                  <g>
                    <line x1={sentimentData[hoverIdx].x} y1="0" x2={sentimentData[hoverIdx].x} y2="220" stroke="#06b6d4" strokeWidth="1.5" />
                    <circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].pos} r="4" fill="#10b981" />
                    <circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].neg} r="4" fill="#ef4444" />
                    <circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].neut} r="3" fill="#3b82f6" />
                    
                    <foreignObject x={sentimentData[hoverIdx].x > 800 ? sentimentData[hoverIdx].x - 170 : sentimentData[hoverIdx].x + 10} y="10" width="160" height="130">
                      <div className="bg-[#0b1419]/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                        <div className="text-[9px] text-gray-400 font-mono mb-2 border-b border-white/5 pb-1 flex justify-between">
                          <span>{sentimentData[hoverIdx].fullDate}</span>
                          <span className="text-cyan-400 font-bold">{sentimentData[hoverIdx].fullTime}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5 px-1">
                          <span className="text-[8px] text-gray-500 uppercase font-black">Positif</span>
                          <span className="text-[12px] font-orbitron text-emerald-400 font-bold drop-shadow-[0_0_5px_#10b98144]">{sentimentData[hoverIdx].raw.pos}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5 px-1">
                          <span className="text-[8px] text-gray-500 uppercase font-black">Negatif</span>
                          <span className="text-[12px] font-orbitron text-red-500 font-bold drop-shadow-[0_0_5px_#ef444444]">{sentimentData[hoverIdx].raw.neg}</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] text-gray-500 uppercase font-black">Netral</span>
                          <span className="text-[12px] font-orbitron text-blue-400 font-bold drop-shadow-[0_0_5px_#3b82f644]">{sentimentData[hoverIdx].raw.neut}</span>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                )}
              </>
            )}

            <g className="text-[9px] fill-gray-500 font-black">
              {sentimentData.map((d, i) => d.time && (
                <text key={i} x={d.x} y="232" textAnchor={i === 0 ? 'start' : i === sentimentData.length - 1 ? 'end' : 'middle'}>
                  {d.time}
                </text>
              ))}
            </g>
          </svg>
        </div>

        <div className="grid grid-cols-5 gap-6 px-6 pb-6 relative z-10">
          {topPlatforms.map((item: any) => {
            const pos = item.pos_count || 0;
            const neg = item.neg_count || 0;
            const total = item.count || 1;
            const posPct = Math.round((pos / total) * 100);
            const negPct = Math.round((neg / total) * 100);
            const neutPct = Math.max(0, 100 - posPct - negPct);

            return (
              <div key={item.platform} className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer relative group/pcard">
                <div className="flex items-center justify-between mb-3">
                  <i className={`
                    ${item.platform.toLowerCase() === 'twitter' ? 'fa-brands fa-x-twitter text-white' : 
                      item.platform.toLowerCase() === 'facebook' ? 'fa-brands fa-facebook text-[#1877F2]' : 
                      item.platform.toLowerCase() === 'instagram' ? 'fa-brands fa-instagram text-[#E4405F]' :
                      item.platform.toLowerCase() === 'tiktok' ? 'fa-brands fa-tiktok text-white' :
                      item.platform.toLowerCase() === 'youtube' ? 'fa-brands fa-youtube text-[#FF0000]' : 'fa-solid fa-globe text-cyan-400'} 
                    text-lg drop-shadow-[0_0_5px_currentColor]
                  `}></i>
                  <span className="text-[9px] font-mono text-gray-600">LIVE</span>
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 truncate">{item.platform}</div>
                <div className="font-orbitron text-2xl font-bold text-gray-100 mb-4">{item.count}</div>
                {/* Sentiment Percentage Bar */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] font-bold font-mono">
                    <span className="text-emerald-500">POS {posPct}%</span>
                    <span className="text-blue-400">NEU {neutPct}%</span>
                    <span className="text-red-500">NEG {negPct}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500 shadow-[0_0_8px_#10b98188] transition-all duration-500" 
                      style={{ width: `${posPct}%` }}
                    />
                    <div 
                      className="h-full bg-blue-500/50 transition-all duration-500" 
                      style={{ width: `${neutPct}%` }}
                    />
                    <div 
                      className="h-full bg-red-500 shadow-[0_0_8px_#ef444488] transition-all duration-500" 
                      style={{ width: `${negPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Network Graph - Expanded to Full Width */}
        <div ref={cardRef} className={`ews-card relative z-20 transition-all duration-300 ${isFullScreen ? 'bg-[#061014] w-screen h-screen p-0 border-0 rounded-none' : 'h-[650px] p-6'}`}>
          {!isFullScreen && <div className="ews-card-header-bar" />}
          <div className={`${isFullScreen ? 'absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none' : 'flex items-center justify-between mb-6'}`}>
            <div className={`flex items-center gap-3 ${isFullScreen ? 'pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10' : ''}`}>
              <i className="fa-solid fa-share-nodes text-red-500"></i>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 tracking-wide">Jaringan Interaksi Aktor</span>
            </div>
            <div className={`flex items-center gap-4 ${isFullScreen ? 'pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10' : ''}`}>
              <CardDateRangePicker 
                start={networkRange.start} 
                end={networkRange.end} 
                setRange={setNetworkRange} 
              />

              <CardPlatformDropdown
                selected={networkPlatform}
                onSelect={setNetworkPlatform}
                isOpen={isNetworkPlatformOpen}
                setIsOpen={setIsNetworkPlatformOpen}
              />

              <CardSentimentDropdown
                selected={networkSentiment}
                onSelect={setNetworkSentiment}
                isOpen={isNetworkSentimentOpen}
                setIsOpen={setIsNetworkSentimentOpen}
              />

              <CardFilterDropdown
                selectedKeywords={networkKeywords}
                onToggle={(kw: string) => handleToggle(kw, setNetworkKeywords)}
                options={summary?.keywords}
                isOpen={isNetworkFilterOpen}
                setIsOpen={setIsNetworkFilterOpen}
              />

              <button 
                onClick={() => setShowHashtags(!showHashtags)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-mono text-[10px] ${
                  showHashtags 
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' 
                    : 'bg-gray-800/10 border-white/5 text-gray-500 hover:border-white/10'
                }`}
                title={showHashtags ? "Hide Hashtags" : "Show Hashtags"}
              >
                <i className={`fa-solid fa-hashtag text-[9px] ${showHashtags ? 'animate-pulse' : ''}`}></i>
                {showHashtags ? 'HASHTAGS ON' : 'HASHTAGS OFF'}
              </button>

              <div className="w-px h-6 bg-white/10 hidden md:block"></div>
              <button 
                onClick={toggleFullscreen}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
                title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                <i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
              </button>
            </div>
          </div>
          
          <div ref={containerRef} className={`bg-black/40 overflow-hidden relative ${isFullScreen ? 'w-full h-full' : 'h-[530px] rounded-xl border border-white/5'}`}>
            {/* Tactical HUD Overlay (Bottom Right) */}
            <FloatingNetworkHUD 
              nodes={network.nodes.length} 
              links={network.links.length} 
              limit={networkLimit} 
              setLimit={setNetworkLimit} 
            />

            <ForceGraph2D
              ref={fgRef}
              graphData={filteredNetwork}
              width={graphDimensions.width}
              height={graphDimensions.height}
              backgroundColor="transparent"
              nodeLabel="id"
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              onEngineStop={() => fgRef.current.zoomToFit(400)}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const isKeyword = node.type === 'keyword';
                const isUser = node.type === 'user';
                const isHashtag = node.type === 'hashtag';
                
                // Color Logic: Topik = Merah, Aktor = Cyan, Tagar = Purple
                const color = isKeyword ? '#ef4444' : (isHashtag ? '#a855f7' : '#06b6d4');
                
                // Radius Logic:
                const baseRadius = isUser ? Math.sqrt(node.val) * 2 : (isHashtag ? 10 : 12);
                const radius = Math.max(4, Math.min(30, baseRadius)) / globalScale;
                
                const isHighEngagement = isUser && node.val > 80;
                
                // 1. DASHED ROTATING OUTER RING (Untuk TOPIK / TAGAR)
                if (isKeyword || isHashtag) {
                  const rotation = (Date.now() / 2000) % (Math.PI * 2);
                  ctx.beginPath();
                  ctx.setLineDash([5 / globalScale, 5 / globalScale]);
                  ctx.arc(node.x, node.y, radius + (isHashtag ? 6 : 8)/globalScale, rotation, rotation + Math.PI * 2);
                  ctx.strokeStyle = `${color}aa`;
                  ctx.lineWidth = 1.5 / globalScale;
                  ctx.stroke();
                  ctx.setLineDash([]); // Reset
                }

                // 2. OUTER TACTICAL RING (Topik & Aktor High Engagement)
                if (isKeyword || isHighEngagement) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 4/globalScale, 0, 2 * Math.PI);
                  ctx.strokeStyle = `${color}66`;
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                }

                // 3. CORE GLOW
                ctx.shadowBlur = (isKeyword ? 25 : (isHighEngagement ? 15 : 5)) / globalScale;
                ctx.shadowColor = color;

                // 4. SOLID CORE
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                
                // Reset shadow
                ctx.shadowBlur = 0;

                // 5. PERSISTENT LABELS
                const fontSize = (isKeyword ? 14 : 12) / globalScale;
                ctx.font = `${fontSize}px Orbitron`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                
                const label = isUser ? `@${node.id}` : node.id;
                const textWidth = ctx.measureText(label).width;
                
                // Text background for contrast
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(
                  node.x - textWidth/2 - 4/globalScale, 
                  node.y + radius + 6/globalScale, 
                  textWidth + 8/globalScale, 
                  fontSize + 4/globalScale
                );
                
                // Text Color
                ctx.fillStyle = isKeyword ? '#fca5a5' : (isHashtag ? '#d8b4fe' : '#67e8f9');
                ctx.fillText(label, node.x, node.y + radius + 8/globalScale);
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleColor={() => '#06b6d4'}
              linkColor={() => 'rgba(255,255,255,0.12)'}
            />
          </div>
        </div>
      </div>

      {/* Keyword Intelligence Card */}
      {keywordSummary ? (
        keywordSummary.keywords && (
          <KeywordIntelligenceCard 
            keywords={keywordSummary.keywords} 
            range={keywordRange}
            setRange={setKeywordRange}
          />
        )
      ) : (
        <div className="ews-card p-12 text-center border-dashed border-white/10 mb-6 bg-black/20 backdrop-blur-sm">
          <i className="fa-solid fa-circle-notch fa-spin text-cyan-400 text-2xl mb-4"></i>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Sinkronisasi Intelijen Kata Kunci...</p>
        </div>
      )}

      {/* Live Post Feed */}
      <div className="ews-card p-6 relative overflow-hidden">
        <div className="ews-card-header-bar" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-rss text-cyan-400 animate-pulse"></i>
            <span className="font-orbitron font-bold text-[15px] text-gray-100 tracking-wide">Repositori Sosial Media</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative group/search">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-[10px] text-cyan-500/50 group-hover/search:text-cyan-400 transition-colors"></i>
              </div>
              <input
                type="text"
                placeholder="Search Actor Handle..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-[11px] text-gray-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-48 font-mono placeholder:text-gray-700 transition-all"
              />
            </div>

            <CardDateRangePicker 
              start={postRange.start} 
              end={postRange.end} 
              setRange={setPostRange} 
            />
            <CardPlatformDropdown
              selected={postPlatform}
              onSelect={setPostPlatform}
              isOpen={isPostPlatformOpen}
              setIsOpen={setIsPostPlatformOpen}
            />
            <CardSentimentDropdown
              selected={postSentiment}
              onSelect={setPostSentiment}
              isOpen={isPostSentimentOpen}
              setIsOpen={setIsPostSentimentOpen}
            />
            <CardFilterDropdown
              selectedKeywords={postKeywords}
              onToggle={(kw: string) => handleToggle(kw, setPostKeywords)}
              options={summary?.keywords}
              isOpen={isPostFilterOpen}
              setIsOpen={setIsPostFilterOpen}
            />
          </div>
        </div>

        <div className="overflow-x-auto ews-scrollbar">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] font-orbitron">
                <th className="text-left pb-4 pl-6">Platform</th>
                <th className="text-left pb-4">Aktor & Narasi</th>
                <th className="text-left pb-4">Keyword</th>
                <th className="text-left pb-4 text-center">Status Sentimen</th>
                <th className="text-right pb-4 pr-6">Waktu Kejadian</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.map((post) => (
                <tr key={post.id} className="group transition-all duration-300 hover:translate-x-1">
                  <td className="py-4 pl-6 bg-[#0c161d]/80 backdrop-blur-md border-y border-l border-white/5 rounded-l-2xl group-hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-cyan-500/50 transition-all">
                        <i className={`
                          ${post.platform.toLowerCase() === 'twitter' ? 'fa-brands fa-x-twitter text-white' : 
                            post.platform.toLowerCase() === 'facebook' ? 'fa-brands fa-facebook text-[#1877F2]' : 
                            post.platform.toLowerCase() === 'instagram' ? 'fa-brands fa-instagram text-[#E4405F]' :
                            post.platform.toLowerCase() === 'tiktok' ? 'fa-brands fa-tiktok text-white' :
                            post.platform.toLowerCase() === 'youtube' ? 'fa-brands fa-youtube text-[#FF0000]' : 'fa-solid fa-globe text-cyan-400'} 
                          text-base drop-shadow-[0_0_8px_currentColor]
                        `}></i>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 group-hover:border-cyan-500/30 transition-colors">
                    <div className="flex flex-col gap-1 relative pr-8">
                      <span className="font-mono text-[13px] text-cyan-400 font-bold tracking-tight">@{post.username}</span>
                      <p className="text-[12px] text-gray-300 leading-relaxed font-medium italic">
                        "{post.post_content}"
                      </p>
                      <div className="absolute -left-3 top-0 w-0.5 h-full bg-cyan-500/20 rounded-full" />
                    </div>
                  </td>
                  
                  <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 group-hover:border-cyan-500/30 transition-colors">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] text-gray-400 font-mono uppercase tracking-widest group-hover:border-amber-500/30 transition-colors">
                      <span className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />
                      {post.keyword}
                    </div>
                  </td>
                  
                  <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 group-hover:border-cyan-500/30 transition-colors text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                      post.sentiment === 'Negatif' ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
                      post.sentiment === 'Positif' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
                      'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        post.sentiment === 'Negatif' ? 'bg-red-500' :
                        post.sentiment === 'Positif' ? 'bg-emerald-500' : 'bg-cyan-400'
                      }`} />
                      {post.sentiment}
                    </div>
                  </td>
                  
                  <td className="py-4 pr-6 bg-[#0c161d]/80 backdrop-blur-md border-y border-r border-white/5 rounded-r-2xl group-hover:border-cyan-500/30 transition-colors text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-gray-100 font-orbitron font-bold tracking-tighter">
                        {new Date(post.post_timestamp).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                        {new Date(post.post_timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && !isLoading && (
            <div className="py-24 text-center border-2 border-dashed border-cyan-500/10 rounded-[2rem] bg-white/[0.01] backdrop-blur-xl group/empty">
              <div className="w-20 h-20 bg-cyan-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/10 group-hover/empty:scale-110 transition-transform duration-700">
                <i className="fa-solid fa-server text-cyan-500/30 text-3xl"></i>
              </div>
              <h4 className="text-gray-400 font-orbitron font-bold text-sm tracking-[0.2em] mb-2 uppercase">Data Repository Empty</h4>
              <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em]">No classified intelligence found for this specific period</p>
            </div>
          )}
        </div>

        {/* Pagination HUD */}
        {posts.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Showing</span>
                <span className="font-orbitron font-bold text-xs text-cyan-400">
                  {Math.min(posts.length, (postPage - 1) * 10 + 1)} - {Math.min(posts.length, postPage * 10)}
                </span>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">of</span>
                <span className="font-orbitron font-bold text-xs text-gray-300">{posts.length}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">narrative units</span>
              </div>
              <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-500" 
                  style={{ width: `${(postPage / totalPages) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setPostPage(p => Math.max(1, p - 1))}
                disabled={postPage === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && postPage > 3) {
                    pageNum = postPage - 2 + i;
                    if (pageNum + (4 - i) > totalPages) pageNum = totalPages - 4 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPostPage(pageNum)}
                      className={`w-9 h-9 rounded-lg font-orbitron text-[11px] font-bold transition-all ${
                        postPage === pageNum 
                          ? 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]' 
                          : 'text-gray-500 hover:text-gray-100 hover:bg-white/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPostPage(p => Math.min(totalPages, p + 1))}
                disabled={postPage === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modals */}
      <KeywordsModal 
        isOpen={isKeywordsModalOpen}
        onClose={() => setIsKeywordsModalOpen(false)}
        keywords={summary?.keywords || []}
        date={globalDate}
      />
      <NegativeSentimentModal 
        isOpen={isNegModalOpen} 
        onClose={() => setIsNegModalOpen(false)} 
        keywords={summary?.keywords || []} 
        date={trendRange.start === trendRange.end ? trendRange.start : `${trendRange.start} - ${trendRange.end}`}
      />
      <EmotionModal 
        isOpen={isEmotionModalOpen}
        onClose={() => setIsEmotionModalOpen(false)}
        emotions={emotions}
      />
    </div>
  );
}
