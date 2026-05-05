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

const CardPlatformDropdown = ({ selected, onSelect, options, isOpen, setIsOpen }: any) => {
  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('twitter') || p === 'x') return { icon: 'fa-brands fa-x-twitter', color: 'text-white' };
    if (p.includes('facebook')) return { icon: 'fa-brands fa-facebook', color: 'text-[#1877F2]' };
    if (p.includes('instagram')) return { icon: 'fa-brands fa-instagram', color: 'text-[#E4405F]' };
    if (p.includes('tiktok')) return { icon: 'fa-brands fa-tiktok', color: 'text-white' };
    if (p.includes('youtube')) return { icon: 'fa-brands fa-youtube', color: 'text-[#FF0000]' };
    if (p.includes('threads')) return { icon: 'fa-brands fa-threads', color: 'text-white' };
    return { icon: 'fa-solid fa-globe', color: 'text-cyan-400' };
  };

  const current = options?.find((o: any) => o.platform.toLowerCase() === selected.toLowerCase()) || { platform: 'SEMUA PLATFORM' };
  const currentStyle = getPlatformIcon(current.platform);

  return (
    <div className="relative platform-dropdown">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 hover:border-cyan-500/50 transition-all font-mono text-[10px] text-gray-300"
      >
        <i className={`${currentStyle.icon} ${currentStyle.color} text-[11px] drop-shadow-[0_0_3px_currentColor]`} />
        {current.platform.toUpperCase()}
        <i className={`fa-solid fa-chevron-down ml-1 text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onSelect('All');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-[10px] font-mono flex items-center gap-3 transition-colors hover:bg-white/5 ${selected === 'All' ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-globe text-cyan-400 w-4 text-[12px] flex justify-center" />
            SEMUA PLATFORM
          </button>
          
          {options?.map((opt: any) => {
            const style = getPlatformIcon(opt.platform);
            return (
              <button
                key={opt.platform}
                onClick={() => {
                  onSelect(opt.platform);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-[10px] font-mono flex items-center gap-3 transition-colors hover:bg-white/5 ${selected.toLowerCase() === opt.platform.toLowerCase() ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
              >
                <i className={`${style.icon} ${style.color} w-4 text-[12px] flex justify-center`} />
                {opt.platform.toUpperCase()}
              </button>
            );
          })}
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

export default function Osint({ view = 'overview' }: { view?: 'overview' | 'network' | 'repository' }) {
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
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  
  // Date Range States
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [globalDate, setGlobalDate] = useState(today);
  
  const [trendRange, setTrendRange] = useState({ start: sevenDaysAgo, end: today });
  const [keywordRange, setKeywordRange] = useState({ start: sevenDaysAgo, end: today });
  const [networkRange, setNetworkRange] = useState({ start: sevenDaysAgo, end: today });
  const [postRange, setPostRange] = useState({ start: sevenDaysAgo, end: today });

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

  const [isTrendFilterOpen, setIsTrendFilterOpen] = useState(false);
  const [isTrendPlatformOpen, setIsTrendPlatformOpen] = useState(false);
  const [isNetworkFilterOpen, setIsNetworkFilterOpen] = useState(false);
  const [isNetworkSentimentOpen, setIsNetworkSentimentOpen] = useState(false);
  const [isPostSentimentOpen, setIsPostSentimentOpen] = useState(false);
  const [isNetworkPlatformOpen, setIsNetworkPlatformOpen] = useState(false);

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
      if (!target.closest('.keyword-dropdown-container') && !target.closest('.sentiment-dropdown') && !target.closest('.platform-dropdown')) {
        setIsTrendFilterOpen(false);
        setIsNetworkFilterOpen(false);
        setIsTrendPlatformOpen(false);
        setIsNetworkPlatformOpen(false);
        setIsNetworkSentimentOpen(false);
        setIsPostSentimentOpen(false);
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
          height: isFullScreen ? window.innerHeight : (containerRef.current.clientHeight || 750)
        });
      }
    };
    updateDimensions();
    setTimeout(updateDimensions, 100);
    setTimeout(updateDimensions, 500);
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [mounted, isFullScreen, view]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cardRef.current?.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
    }
  };

  const fetchSummary = async (s?: string, e?: string, kws?: string[], plt?: string) => {
    setIsSummaryLoading(true);
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
          setKeywordRange({ start: sumData.startDate, end: sumData.endDate });
        }
      }
    } catch (err) {
      console.error('Fetch summary error:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const fetchTrend = async (s: string, e: string, kws: string[], platform: string = 'All') => {
    setIsTrendLoading(true);
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const pltParam = platform !== 'All' ? `&platform=${platform}` : '';
      const res = await authFetch(`${apiBase}/osint/sentiment-trend?startDate=${s}&endDate=${e}${kwParam}${pltParam}`);
      if (res.ok) setTrend(await res.json());
    } catch (err) {
      console.error('Fetch trend error:', err);
    } finally {
      setIsTrendLoading(false);
    }
  };

  const fetchKeywordSummary = async (s: string, e: string) => {
    setIsSummaryLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await authFetch(`${apiBase}/osint/summary?startDate=${s}&endDate=${e}`);
      if (res.ok) setKeywordSummary(await res.json());
    } catch (err) {
      console.error('Fetch keyword summary error:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const fetchNetwork = async (s: string, e: string, kws: string[], sent: string, plat: string, lim: number) => {
    setIsNetworkLoading(true);
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const sentParam = sent !== 'All' ? `&sentiment=${sent}` : '';
      const platParam = plat !== 'All' ? `&platform=${plat}` : '';
      const limParam = `&limit=${lim}`;
      const url = `${apiBase}/osint/network?startDate=${s}&endDate=${e}${kwParam}${sentParam}${platParam}${limParam}`;
      console.log('[OSINT FETCH] Network URL:', url);
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('[OSINT FETCH] Network Data received:', data.nodes?.length, 'nodes,', data.links?.length, 'links');
        setNetwork(data);
      } else {
        console.error('[OSINT FETCH] Network Error:', res.status, res.statusText);
      }
    } finally {
      setIsNetworkLoading(false);
    }
  };

  const fetchPosts = async (s: string, e: string, kws: string[], sent: string, plat: string, search?: string) => {
    setIsPostsLoading(true);
    try {
      const apiBase = getApiBase();
      const kwParam = !kws.includes('All') ? `&keyword=${kws.join(',')}` : '';
      const sentParam = sent !== 'All' ? `&sentiment=${sent}` : '';
      const platParam = plat !== 'All' ? `&platform=${plat}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await authFetch(`${apiBase}/osint/posts?startDate=${s}&endDate=${e}${kwParam}${sentParam}${platParam}${searchParam}`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setIsPostsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchSummary();
    };
    setMounted(true);
    init();
  }, []);

  useEffect(() => {
    if (mounted && (view === 'overview' || view === 'repository')) {
      fetchTrend(trendRange.start, trendRange.end, trendKeywords, trendPlatform);
      fetchSummary(trendRange.start, trendRange.end, trendKeywords, trendPlatform);
    }
  }, [mounted, view, trendRange, trendKeywords.join(','), trendPlatform]);

  useEffect(() => {
    if (mounted && view === 'network') {
      fetchNetwork(networkRange.start, networkRange.end, networkKeywords, networkSentiment, networkPlatform, networkLimit);
    }
  }, [mounted, view, networkRange, networkKeywords.join(','), networkSentiment, networkPlatform, networkLimit]);

  useEffect(() => {
    if (mounted && view === 'overview') {
      fetchKeywordSummary(keywordRange.start, keywordRange.end);
    }
  }, [mounted, view, keywordRange]);

  useEffect(() => {
    if (mounted && (view === 'overview' || view === 'repository')) {
      setPostPage(1); 
      fetchPosts(postRange.start, postRange.end, postKeywords, postSentiment, postPlatform, debouncedPostSearch);
    }
  }, [mounted, view, postRange, postKeywords.join(','), postSentiment, postPlatform, debouncedPostSearch]);

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

  const sentimentData = useMemo(() => {
    if (!trend.length) return [];
    return trend.map((d, i) => {
      const x = (i / (trend.length - 1 || 1)) * 1000;
      const date = new Date(d.hour);
      const label = i % 4 === 0 ? `${String(date.getHours()).padStart(2, '0')}:00` : '';
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
    if (!sentimentData || sentimentData.length === 0) return;
    
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

  const totalPosts = summary?.platforms?.reduce((acc: number, p: any) => acc + p.count, 0) || 0;
  const targetPlatforms = ['twitter', 'instagram', 'tiktok', 'youtube', 'facebook', 'threads'];
  const topPlatforms = (summary?.platforms || [])
    .filter((p: any) => targetPlatforms.includes(p.platform.toLowerCase()))
    .sort((a: any, b: any) => targetPlatforms.indexOf(a.platform.toLowerCase()) - targetPlatforms.indexOf(b.platform.toLowerCase()));
  const keywordCount = summary?.keywords?.length || 0;
  const totalNeg = summary?.platforms?.reduce((acc: number, p: any) => acc + (p.neg_count || 0), 0) || 0;
  const totalCount = summary?.platforms?.reduce((acc: number, p: any) => acc + (p.count || 0), 0) || 0;
  const avgNegPct = totalCount > 0 ? (totalNeg / totalCount) * 100 : 0;
  const emotions = summary?.emotions || { anger: 0, fear: 0, sadness: 0, joy: 0, surprise: 0, provocative: 0, panic: 0, neutral: 0 };

  const dominantEmotion = useMemo(() => {
    if (!summary?.emotions) return ['neutral', 0] as [string, number];
    return Object.entries(summary.emotions as Record<string, number>).reduce((a, b) => (a[1] > b[1] ? a : b), ['neutral', 0]);
  }, [summary?.emotions]);

  const emotionConfigs: Record<string, {label: string, icon: string, color: string, class: string}> = {
    anger: { label: 'MARAH', icon: 'fa-fire', color: 'text-red-500', class: 'red' },
    fear: { label: 'TAKUT', icon: 'fa-ghost', color: 'text-purple-500', class: 'purple' },
    sadness: { label: 'SEDIH', icon: 'fa-cloud-rain', color: 'text-blue-500', class: 'blue' },
    joy: { label: 'SENANG', icon: 'fa-sun', color: 'text-yellow-500', class: 'amber' },
    surprise: { label: 'KAGET', icon: 'fa-bolt', color: 'text-cyan-500', class: 'cyan' },
    provocative: { label: 'PROVOKATIF', icon: 'fa-hand-fist', color: 'text-orange-500', class: 'orange' },
    panic: { label: 'PANIK', icon: 'fa-triangle-exclamation', color: 'text-amber-500', class: 'amber' },
    neutral: { label: 'NETRAL', icon: 'fa-face-meh', color: 'text-gray-500', class: 'gray' }
  };

  const domConfig = emotionConfigs[dominantEmotion[0] as string] || emotionConfigs.neutral;

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>

      {/* Stats Grid - Global contexts */}
      <div className="grid grid-cols-4 gap-5 relative">
        {(isSummaryLoading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 bg-[#0a0a0a]/90 px-6 py-3 rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <i className="fa-solid fa-circle-notch fa-spin text-cyan-400"></i>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">Syncing Metrics...</span>
            </div>
          </div>
        )}
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

        <div className="ews-stat-card amber cursor-pointer hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden" onClick={() => setIsKeywordsModalOpen(true)}>
          <div className="absolute inset-0 bg-amber-500/0 group-hover/stat:bg-amber-500/[0.02] transition-colors" />
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 relative z-10">Keyword Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1 relative z-10">{keywordCount}</div>
          <div className="flex items-center gap-2 text-[13px] relative z-10">
            <span className="text-amber-400 uppercase font-black font-mono flex items-center gap-2">KATEGORI AKTIF <i className="fa-solid fa-chevron-right text-[8px] animate-bounce-x"></i></span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500 group-hover/stat:scale-110 transition-transform"><i className="fa-solid fa-bolt-lightning"></i></div>
        </div>

        <div className="ews-stat-card red cursor-pointer hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden" onClick={() => setIsNegModalOpen(true)}>
          <div className="absolute inset-0 bg-red-500/0 group-hover/stat:bg-red-500/[0.02] transition-colors" />
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 relative z-10">Sentimen Negatif</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1 relative z-10">{avgNegPct.toFixed(1)}%</div>
          <div className="flex items-center gap-2 text-[13px] relative z-10">
            <span className="text-red-500 uppercase font-black font-mono flex items-center gap-2">TINGKAT NEGATIF <i className="fa-solid fa-triangle-exclamation text-[10px] animate-pulse"></i></span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500 group/stat:scale-110 transition-transform"><i className="fa-solid fa-fire-alt"></i></div>
        </div>

        <div className={`ews-stat-card ${domConfig.class} cursor-pointer hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden`} onClick={() => setIsEmotionModalOpen(true)}>
          <div className={`absolute inset-0 opacity-0 group-hover/stat:opacity-100 bg-current transition-opacity pointer-events-none`} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 relative z-10">Emosi Dominan</div>
          <div className={`font-orbitron text-3xl font-bold ${domConfig.color} mb-1 relative z-10 truncate`}>{domConfig.label}</div>
          <div className="flex items-center gap-2 text-[13px] relative z-10">
            <span className={`${domConfig.color} uppercase font-black font-mono flex items-center gap-2`}>TRENDING SEKARANG <i className={`fa-solid ${domConfig.icon} text-[10px] animate-pulse`}></i></span>
          </div>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 ${domConfig.color} group-hover/stat:scale-110 transition-transform`}><i className={`fa-solid ${domConfig.icon}`}></i></div>
        </div>
      </div>

      {/* Centralized Global Filter Bar - Tactical Design */}
      {(view === 'overview' || view === 'network' || view === 'repository') && (
        <div className="bg-[#0c161d]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative z-50 mb-6">
          <div className="flex flex-wrap items-center gap-5 justify-center">
            
            {/* Analysis Range */}
            <div className="flex items-center gap-4 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-emerald-500/30 transition-all shadow-inner relative group/date">
              <span className="text-[11px] text-emerald-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-4 whitespace-nowrap">Periode</span>
              <CardDateRangePicker start={trendRange.start} end={trendRange.end} setRange={(r) => {
                setTrendRange(r);
                setKeywordRange(r);
                setPostRange(r);
                setNetworkRange(r);
              }} />
            </div>

            {/* Keyword Parameters */}
            <div className="flex items-center gap-4 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner relative group/keyword">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-4 whitespace-nowrap">Keyword</span>
              <CardFilterDropdown 
                selectedKeywords={trendKeywords} 
                onToggle={(kw: string) => handleToggle(kw, (val: any) => {
                  const next = typeof val === 'function' ? val(trendKeywords) : val;
                  setTrendKeywords(next);
                  setPostKeywords(next);
                  setNetworkKeywords(next);
                })} 
                options={summary?.keywords} 
                isOpen={isTrendFilterOpen} 
                setIsOpen={setIsTrendFilterOpen} 
              />
            </div>

            {/* Platform Source */}
            <div className="flex items-center gap-4 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-blue-500/30 transition-all shadow-inner relative group/platform">
              <span className="text-[11px] text-blue-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-4 whitespace-nowrap">Platform</span>
              <CardPlatformDropdown 
                selected={trendPlatform} 
                onSelect={(p: string) => {
                  setTrendPlatform(p);
                  setPostPlatform(p);
                  setNetworkPlatform(p);
                }} 
                options={summary?.platforms}
                isOpen={isTrendPlatformOpen} 
                setIsOpen={setIsTrendPlatformOpen} 
              />
            </div>

            {/* Sentiment Polarity */}
            <div className="flex items-center gap-4 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-red-500/30 transition-all shadow-inner relative group/sentiment">
              <span className="text-[11px] text-red-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-4 whitespace-nowrap">Sentimen</span>
              <CardSentimentDropdown 
                selected={postSentiment} 
                onSelect={(s: string) => {
                  setPostSentiment(s);
                  setNetworkSentiment(s);
                }} 
                isOpen={isPostSentimentOpen} 
                setIsOpen={setIsPostSentimentOpen} 
              />
            </div>

          </div>
        </div>
      )}

      {view === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Sentiment Chart */}
          <div className="ews-card p-0 relative z-30 group/card border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
            {(isTrendLoading || isSummaryLoading) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-2xl overflow-hidden">
                <div className="ews-hud-loader" />
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent mix-blend-overlay" />
            <div className="ews-hud-corner ews-hud-tl" /><div className="ews-hud-corner ews-hud-tr" /><div className="ews-hud-corner ews-hud-bl" /><div className="ews-hud-corner ews-hud-br" /><div className="ews-card-header-bar" />
            
            <div className="p-6 relative z-10">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"><i className="fa-solid fa-chart-line text-2xl drop-shadow-[0_0_8px_#22d3ee]"></i></div>
                  <div>
                    <span className="font-orbitron font-bold text-xl text-white tracking-wide block drop-shadow-lg">Sentimen Analisis</span>
                    <span className="text-[11px] text-cyan-400 font-mono uppercase tracking-[0.3em] flex items-center gap-2 mt-1.5 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />Analisis Volume • Pelacakan Polaritas</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 px-6 py-2 bg-black/20 rounded-2xl border border-white/5">
                  <div className="text-right">
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Analytic Range</div>
                    <div className="text-[11px] font-orbitron text-emerald-400 font-bold uppercase drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{trendRange.start === trendRange.end ? trendRange.start : `${trendRange.start} → ${trendRange.end}`}</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-right">
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Frequency</div>
                    <div className="text-[13px] font-orbitron text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{trend.length}h</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mb-8 px-6">
              <svg viewBox="0 0 1000 240" className="w-full h-80 cursor-crosshair" preserveAspectRatio="none" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}>
                <defs>
                  <linearGradient id="neonPos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient>
                  <linearGradient id="neonNeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></linearGradient>
                  <linearGradient id="neonNeut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient>
                </defs>
                {sentimentData.length > 0 && (
                  <><path d={posArea} fill="url(#neonPos)"/><path d={posPath} fill="none" stroke="#10b981" strokeWidth="1.2" /><path d={negArea} fill="url(#neonNeg)"/><path d={negPath} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,3" /><path d={neutArea} fill="url(#neonNeut)"/><path d={neutPath} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                    {hoverIdx !== null && sentimentData[hoverIdx] && (
                      <g><line x1={sentimentData[hoverIdx].x} y1="0" x2={sentimentData[hoverIdx].x} y2="220" stroke="#06b6d4" strokeWidth="1.5" /><circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].pos} r="4" fill="#10b981" /><circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].neg} r="4" fill="#ef4444" /><circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].neut} r="3" fill="#3b82f6" /><foreignObject x={sentimentData[hoverIdx].x > 800 ? sentimentData[hoverIdx].x - 170 : sentimentData[hoverIdx].x + 10} y="10" width="160" height="130"><div className="bg-[#0b1419]/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md"><div className="text-[9px] text-gray-400 font-mono mb-2 border-b border-white/5 pb-1 flex justify-between"><span>{sentimentData[hoverIdx].fullDate}</span><span className="text-cyan-400 font-bold">{sentimentData[hoverIdx].fullTime}</span></div><div className="flex justify-between items-center mb-1.5 px-1"><span className="text-[8px] text-gray-500 uppercase font-black">Positif</span><span className="text-[12px] font-orbitron text-emerald-400 font-bold">{sentimentData[hoverIdx].raw.pos}</span></div><div className="flex justify-between items-center mb-1.5 px-1"><span className="text-[8px] text-gray-500 uppercase font-black">Negatif</span><span className="text-[12px] font-orbitron text-red-500 font-bold">{sentimentData[hoverIdx].raw.neg}</span></div><div className="flex justify-between items-center px-1"><span className="text-[8px] text-gray-500 uppercase font-black">Netral</span><span className="text-[12px] font-orbitron text-blue-400 font-bold">{sentimentData[hoverIdx].raw.neut}</span></div></div></foreignObject></g>
                    )}
                  </>
                )}
                <g className="text-[9px] fill-gray-500 font-black">{sentimentData.map((d, i) => d.time && (<text key={i} x={d.x} y="232" textAnchor={i === 0 ? 'start' : i === sentimentData.length - 1 ? 'end' : 'middle'}>{d.time}</text>))}</g>
              </svg>
            </div>

            <div className="grid grid-cols-5 gap-6 px-6 pb-6 relative z-10">
              {topPlatforms.map((item: any) => {
                const pos = item.pos_count || 0; const neg = item.neg_count || 0; const total = item.count || 1;
                const posPct = Math.round((pos / total) * 100); const negPct = Math.round((neg / total) * 100); const neutPct = Math.max(0, 100 - posPct - negPct);
                return (
                  <div key={item.platform} className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer relative group/pcard">
                    <div className="flex items-center justify-between mb-3">
                      <i className={`${item.platform.toLowerCase() === 'twitter' ? 'fa-brands fa-x-twitter text-white' : item.platform.toLowerCase() === 'facebook' ? 'fa-brands fa-facebook text-[#1877F2]' : item.platform.toLowerCase() === 'instagram' ? 'fa-brands fa-instagram text-[#E4405F]' : item.platform.toLowerCase() === 'tiktok' ? 'fa-brands fa-tiktok text-white' : item.platform.toLowerCase() === 'youtube' ? 'fa-brands fa-youtube text-[#FF0000]' : item.platform.toLowerCase() === 'threads' ? 'fa-brands fa-threads text-white' : 'fa-solid fa-globe text-cyan-400'} text-lg drop-shadow-[0_0_5px_currentColor]`}></i>
                      <span className="text-[9px] font-mono text-gray-600">LIVE</span>
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 truncate">{item.platform}</div>
                    <div className="font-orbitron text-2xl font-bold text-gray-100 mb-4">{item.count}</div>
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <div className="flex justify-between items-center text-[8px] font-bold font-mono"><span className="text-emerald-500">POS {posPct}%</span><span className="text-blue-400">NEU {neutPct}%</span><span className="text-red-500">NEG {negPct}%</span></div>
                      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${posPct}%` }} /><div className="h-full bg-blue-500/50 transition-all duration-500" style={{ width: `${neutPct}%` }} /><div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${negPct}%` }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emotion Analysis Chart */}
          <div className="ews-card p-6 relative overflow-hidden">
            <div className="ews-card-header-bar" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <i className="fa-solid fa-face-smile text-xl"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-lg text-white block">Analisis Emosi</span>
                <span className="text-[10px] text-amber-500/70 font-mono uppercase tracking-widest">Deteksi Suasana Hati & Reaksi Publik</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(summary?.emotions || {}).map(([key, val]: [string, any]) => {
                const emotionLabels: Record<string, {label: string, icon: string, color: string}> = {
                  anger: { label: 'MARAH', icon: 'fa-fire', color: 'text-red-500' },
                  fear: { label: 'TAKUT', icon: 'fa-ghost', color: 'text-purple-500' },
                  sadness: { label: 'SEDIH', icon: 'fa-cloud-rain', color: 'text-blue-500' },
                  joy: { label: 'SENANG', icon: 'fa-sun', color: 'text-yellow-500' },
                  surprise: { label: 'KAGET', icon: 'fa-bolt', color: 'text-cyan-500' },
                  provocative: { label: 'PROVOKATIF', icon: 'fa-hand-fist', color: 'text-orange-500' },
                  panic: { label: 'PANIK', icon: 'fa-triangle-exclamation', color: 'text-amber-500' },
                  neutral: { label: 'NETRAL', icon: 'fa-face-meh', color: 'text-gray-500' }
                };
                const config = emotionLabels[key] || { label: key.toUpperCase(), icon: 'fa-face-smile', color: 'text-gray-400' };
                const total = Object.values(summary?.emotions || {}).reduce((a: any, b: any) => a + b, 0) as number;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;

                return (
                  <div key={key} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center group/emo hover:border-amber-500/30 transition-all">
                    <i className={`fa-solid ${config.icon} ${config.color} text-xl mb-3 group-hover/emo:scale-110 transition-transform`}></i>
                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">{config.label}</div>
                    <div className="font-orbitron text-xl font-bold text-white mb-1">{val}</div>
                    <div className="text-[9px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{pct}%</div>
                    <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${config.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyword Intelligence */}
          {keywordSummary ? <KeywordIntelligenceCard keywords={keywordSummary.keywords} range={keywordRange} setRange={setKeywordRange} hideFilters={true} /> : null}
        </div>
      )}

      {view === 'repository' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Post Feed */}
          <div className="ews-card p-6 relative overflow-hidden">
            {isPostsLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="flex items-center gap-3 bg-[#0a0a0a] px-6 py-3 rounded-xl border border-cyan-500/30 shadow-2xl">
                  <i className="fa-solid fa-database fa-bounce text-cyan-400"></i>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Retrieving Repository...</span>
                </div>
              </div>
            )}
            <div className="ews-card-header-bar" /><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><i className="fa-solid fa-rss text-cyan-400 animate-pulse"></i><span className="font-orbitron font-bold text-[15px] text-gray-100 tracking-wide">Repositori Sosial Media</span></div><div className="flex items-center gap-4"><div className="relative group/search"><div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><i className="fa-solid fa-magnifying-glass text-[10px] text-cyan-500/50 group-hover/search:text-cyan-400 transition-colors"></i></div><input type="text" placeholder="Search Actor Handle..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-[11px] text-gray-200 focus:outline-none focus:border-cyan-500/50 w-48 font-mono transition-all" /></div></div></div>
            <div className="overflow-x-auto ews-scrollbar">
              <table className="w-full border-separate border-spacing-y-2">
                <thead><tr className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] font-orbitron"><th className="text-left pb-4 pl-6">Platform</th><th className="text-left pb-4">Aktor & Narasi</th><th className="text-left pb-4">Keyword</th><th className="text-left pb-4 text-center">Status Sentimen</th><th className="text-right pb-4 pr-6">Waktu Kejadian</th></tr></thead>
                <tbody>
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="group transition-all duration-300 hover:translate-x-1">
                      <td className="py-4 pl-6 bg-[#0c161d]/80 backdrop-blur-md border-y border-l border-white/5 rounded-l-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border transition-all duration-300 ${
                            (post.platform.toLowerCase() === 'twitter' || post.platform.toLowerCase() === 'x') ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 
                            post.platform.toLowerCase() === 'facebook' ? 'bg-[#1877F2]/20 border-[#1877F2]/40 shadow-[0_0_15px_rgba(24,119,242,0.2)]' :
                            post.platform.toLowerCase() === 'instagram' ? 'bg-[#E4405F]/20 border-[#E4405F]/40 shadow-[0_0_15px_rgba(228,64,95,0.2)]' :
                            post.platform.toLowerCase() === 'tiktok' ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' :
                            post.platform.toLowerCase() === 'youtube' ? 'bg-[#FF0000]/20 border-[#FF0000]/40 shadow-[0_0_15px_rgba(255,0,0,0.2)]' :
                            post.platform.toLowerCase() === 'threads' ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' :
                            'bg-cyan-500/10 border-cyan-500/30'
                          }`}>
                            <i className={`${
                              (post.platform.toLowerCase() === 'twitter' || post.platform.toLowerCase() === 'x') ? 'fa-brands fa-x-twitter text-white' : 
                              post.platform.toLowerCase() === 'facebook' ? 'fa-brands fa-facebook text-[#1877F2]' : 
                              post.platform.toLowerCase() === 'instagram' ? 'fa-brands fa-instagram text-[#E4405F]' : 
                              post.platform.toLowerCase() === 'tiktok' ? 'fa-brands fa-tiktok text-[#00f2ea]' : 
                              post.platform.toLowerCase() === 'youtube' ? 'fa-brands fa-youtube text-[#FF0000]' : 
                              post.platform.toLowerCase() === 'threads' ? 'fa-brands fa-threads text-white' : 
                              'fa-solid fa-globe text-cyan-400'
                            } text-2xl drop-shadow-[0_0_15px_currentColor]`}></i>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 transition-colors"><div className="flex flex-col gap-1 relative pr-8"><span className="font-mono text-[13px] text-cyan-400 font-bold">@{post.username}</span><p className="text-[12px] text-gray-300 italic">"{post.post_content}"</p><div className="absolute -left-3 top-0 w-0.5 h-full bg-cyan-500/20 rounded-full" /></div></td>
                      <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 transition-colors"><div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] text-gray-400 font-mono uppercase truncate max-w-[120px]"><span className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />{post.keyword}</div></td>
                      <td className="py-4 bg-[#0c161d]/80 backdrop-blur-md border-y border-white/5 transition-colors text-center"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${post.sentiment === 'Negatif' ? 'bg-red-500/10 border-red-500/40 text-red-500' : post.sentiment === 'Positif' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'}`}><span className={`w-1.5 h-1.5 rounded-full animate-pulse ${post.sentiment === 'Negatif' ? 'bg-red-500' : post.sentiment === 'Positif' ? 'bg-emerald-500' : 'bg-cyan-400'}`} />{post.sentiment}</div></td>
                      <td className="py-4 pr-6 bg-[#0c161d]/80 backdrop-blur-md border-y border-r border-white/5 rounded-r-2xl transition-colors text-right"><div className="flex flex-col items-end"><span className="text-[11px] text-gray-100 font-orbitron font-bold">{new Date(post.post_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span><span className="text-[9px] text-gray-500 font-mono">{new Date(post.post_timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {posts.length > 0 && (
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5"><div className="text-[10px] text-gray-500 uppercase tracking-widest">Showing <span className="text-cyan-400 font-bold">{(postPage-1)*10+1}-{Math.min(posts.length, postPage*10)}</span> of <span className="text-white">{posts.length}</span></div><div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10"><button onClick={() => setPostPage(p => Math.max(1, p-1))} disabled={postPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-cyan-400 disabled:opacity-20"><i className="fa-solid fa-chevron-left"></i></button><span className="text-[11px] font-orbitron font-bold text-cyan-400 px-4">{postPage} / {totalPages}</span><button onClick={() => setPostPage(p => Math.min(totalPages, p+1))} disabled={postPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-cyan-400 disabled:opacity-20"><i className="fa-solid fa-chevron-right"></i></button></div></div>
            )}
          </div>
        </div>
      )}

      {view === 'network' && (
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div ref={cardRef} className={`ews-card relative z-20 transition-all duration-300 ${isFullScreen ? 'bg-[#061014] w-screen h-screen p-0 border-0 rounded-none' : 'h-[750px] p-6'}`}>
            {!isFullScreen && <div className="ews-card-header-bar" />}
            <div className={`${isFullScreen ? 'absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none' : 'flex items-center justify-between mb-6'}`}>
              <div className={`flex items-center gap-3 ${isFullScreen ? 'pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl' : ''}`}>
                <i className="fa-solid fa-share-nodes text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]"></i>
                <span className="font-orbitron font-bold text-[15px] text-gray-100 tracking-wide">Jaringan Interaksi Aktor Strategis</span>
              </div>
              <div className={`flex items-center gap-4 ${isFullScreen ? 'pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl' : ''}`}>
                
                {/* Fullscreen-only filters */}
                {isFullScreen && (
                  <>
                    <CardDateRangePicker start={networkRange.start} end={networkRange.end} setRange={(r) => {
                      setTrendRange(r);
                      setKeywordRange(r);
                      setPostRange(r);
                      setNetworkRange(r);
                    }} />
                    <CardPlatformDropdown 
                      selected={networkPlatform} 
                      onSelect={(p: string) => {
                        setTrendPlatform(p);
                        setPostPlatform(p);
                        setNetworkPlatform(p);
                      }} 
                      options={summary?.platforms}
                      isOpen={isNetworkPlatformOpen} 
                      setIsOpen={setIsNetworkPlatformOpen} 
                    />
                    <CardSentimentDropdown selected={networkSentiment} onSelect={(s: string) => {
                      setPostSentiment(s);
                      setNetworkSentiment(s);
                    }} isOpen={isNetworkSentimentOpen} setIsOpen={setIsNetworkSentimentOpen} />
                    <CardFilterDropdown 
                      selectedKeywords={networkKeywords} 
                      onToggle={(kw: string) => handleToggle(kw, (val: any) => {
                        const next = typeof val === 'function' ? val(networkKeywords) : val;
                        setTrendKeywords(next);
                        setPostKeywords(next);
                        setNetworkKeywords(next);
                      })} 
                      options={summary?.keywords} 
                      isOpen={isNetworkFilterOpen} 
                      setIsOpen={setIsNetworkFilterOpen} 
                    />
                    <div className="w-px h-6 bg-white/10 mx-1" />
                  </>
                )}

                {!isFullScreen && (
                  <div className="flex items-center gap-6 px-6 py-2 bg-black/20 rounded-2xl border border-white/5">
                    <div className="text-right">
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Analytic Range</div>
                      <div className="text-[10px] font-orbitron text-emerald-400 font-bold uppercase">{networkRange.start === networkRange.end ? networkRange.start : `${networkRange.start} → ${networkRange.end}`}</div>
                    </div>
                  </div>
                )}
                
                <button onClick={() => setShowHashtags(!showHashtags)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-mono ${showHashtags ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-gray-800/10 border-white/5 text-gray-500'}`}><i className="fa-solid fa-hashtag" /> {showHashtags ? 'HASHTAGS ON' : 'HASHTAGS OFF'}</button>
                <button onClick={toggleFullscreen} className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400"><i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i></button>
              </div>
            </div>
            
            <div ref={containerRef} className={`bg-black/40 overflow-hidden relative ${isFullScreen ? 'w-full h-full' : 'h-[630px] rounded-xl border border-white/5'}`}>
              {isNetworkLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <i className="fa-solid fa-hubspot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-400 animate-pulse" />
                  </div>
                  <span className="mt-4 font-orbitron text-[10px] text-blue-400 tracking-[0.3em] uppercase animate-pulse">Mapping Network...</span>
                </div>
              )}
              <FloatingNetworkHUD nodes={network.nodes.length} links={network.links.length} limit={networkLimit} setLimit={setNetworkLimit} />
              <ForceGraph2D ref={fgRef} graphData={filteredNetwork} width={graphDimensions.width} height={graphDimensions.height} backgroundColor="transparent" nodeLabel="id" d3AlphaDecay={0.02} d3VelocityDecay={0.3} onEngineStop={() => fgRef.current.zoomToFit(400)}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                  const isKeyword = node.type === 'keyword'; const isUser = node.type === 'user'; const isHashtag = node.type === 'hashtag';
                  const color = isKeyword ? '#ef4444' : (isHashtag ? '#a855f7' : '#06b6d4');
                  const baseRadius = isUser ? Math.sqrt(node.val) * 2 : (isHashtag ? 10 : 12);
                  const radius = Math.max(4, Math.min(30, baseRadius)) / globalScale;
                  if (isKeyword || isHashtag) {
                    const rotation = (Date.now() / 2000) % (Math.PI * 2);
                    ctx.beginPath(); ctx.setLineDash([5 / globalScale, 5 / globalScale]);
                    ctx.arc(node.x, node.y, radius + (isHashtag ? 6 : 8)/globalScale, rotation, rotation + Math.PI * 2);
                    ctx.strokeStyle = `${color}aa`; ctx.lineWidth = 1.5 / globalScale; ctx.stroke(); ctx.setLineDash([]);
                  }
                  ctx.shadowBlur = (isKeyword ? 25 : 5) / globalScale; ctx.shadowColor = color;
                  ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
                  const fontSize = (isKeyword ? 14 : 12) / globalScale; ctx.font = `${fontSize}px Orbitron`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                  const label = isUser ? `@${node.id}` : node.id; const textWidth = ctx.measureText(label).width;
                  ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(node.x - textWidth/2 - 4/globalScale, node.y + radius + 6/globalScale, textWidth + 8/globalScale, fontSize + 4/globalScale);
                  ctx.fillStyle = isKeyword ? '#fca5a5' : (isHashtag ? '#d8b4fe' : '#67e8f9'); ctx.fillText(label, node.x, node.y + radius + 8/globalScale);
                }}
                linkWidth={link => (link as any).value || 1}
                linkColor={(link: any) => {
                  if (link.key?.startsWith('m:')) return 'rgba(245, 158, 11, 0.4)'; // Mentions - Amber
                  if (link.key?.startsWith('h:')) return 'rgba(99, 102, 241, 0.4)'; // Hashtags - Indigo
                  return 'rgba(6, 182, 212, 0.4)'; // Keywords - Cyan
                }}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2.5}
                linkDirectionalParticleSpeed={0.006}
                linkDirectionalParticleColor={(link: any) => {
                  if (link.key?.startsWith('m:')) return '#f59e0b';
                  return '#06b6d4';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <KeywordsModal isOpen={isKeywordsModalOpen} onClose={() => setIsKeywordsModalOpen(false)} keywords={summary?.keywords || []} date={globalDate} />
      <NegativeSentimentModal isOpen={isNegModalOpen} onClose={() => setIsNegModalOpen(false)} keywords={summary?.keywords || []} date={trendRange.start === trendRange.end ? trendRange.start : `${trendRange.start} - ${trendRange.end}`} />
      <EmotionModal isOpen={isEmotionModalOpen} onClose={() => setIsEmotionModalOpen(false)} emotions={emotions} />
    </div>
  );
}
