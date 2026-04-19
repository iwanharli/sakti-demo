import React, { useState } from 'react';
import { clsx } from 'clsx';
import './RegionalSummaryModal.css';

interface RegionalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionCode: string;
  regionName: string;
  data: any;
}

const RegionalSummaryModal: React.FC<RegionalSummaryModalProps> = ({
  isOpen,
  onClose,
  regionCode,
  regionName,
  data
}) => {
  const [currentAiPage, setCurrentAiPage] = useState(0);

  if (!isOpen) return null;

  // Utilities mirroring Svelte component
  const getStatusLabel = (score: number): string => {
    if (score > 60) return 'Darurat';
    if (score > 35) return 'Siaga';
    return 'Normal';
  };

  const getFoodRiskLabel = (score: number): string => {
    if (score > 60) return 'Sangat Tinggi';
    if (score > 40) return 'Tinggi';
    if (score >= 20) return 'Sedang';
    return 'Rendah';
  };

  const getFoodRiskClass = (score: number): string => {
    if (score > 40) return 'danger';
    if (score >= 20) return 'warning';
    return 'safe';
  };

  const getStatusClass = (score: number): string => {
    if (score > 60) return 'danger';
    if (score > 35) return 'warning';
    return 'safe';
  };

  const getStatusClassKamtibmas = (status: string): string => {
    const s = status?.trim().toLowerCase() || '';
    if (['bahaya', 'kritis', 'darurat', 'tinggi'].includes(s)) return 'danger';
    if (['waspada', 'siaga', 'sedang'].includes(s)) return 'warning';
    return 'safe';
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  // State abstractions
  const { generalRisk = {}, commodity = {}, sentiment = {}, issues = {}, kamtibmas = {}, aiAnalysis = {} } = data || {};

  return (
    <div className="modal-overlay" style={{ animation: 'fadeIn 0.25s' }}>
      <div className="modal-container" style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {/* Header */}
        <header className="modal-header">
          <div className="header-content">
            <div className="header-left">
              <i className="fa-solid fa-map-location-dot h-icon"></i>
              <h1 className="title">Ringkasan <span className="title-accent">Wilayah</span></h1>
              <div className="h-divider"></div>
              <div className="region-badge-v3">
                <i className="fa-solid fa-location-dot"></i>
                {regionName || 'Nasional'}
              </div>
            </div>

            <div className="header-right">
              <button className="close-btn-v3" onClick={onClose} aria-label="Close modal">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Modal Grid */}
        <div className="modal-grid">
          <div className="left-column">
            
            {/* Section 0: Inflasi */}
            <section className="summary-section inflasi">
              <div className="section-top">
                <div className="section-header">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <h3>INFLASI</h3>
                </div>
              </div>
              <div className="section-content">
                {generalRisk.loading ? (
                  <div className="inner-loading">
                    <div className="shimmer-box heroh" style={{ height: '60px' }}></div>
                  </div>
                ) : generalRisk.data ? (
                  <div className="inflasi-grid">
                    <div className={`inflasi-box ${getStatusClassKamtibmas(generalRisk.data['level_Inflasi MoM (%)'] || generalRisk.data.level_mom)}`}>
                      <span className="inf-label">MoM</span>
                      <span className="inf-val">{generalRisk.data['Inflasi MoM (%)'] ?? generalRisk.data.mom}%</span>
                      <div className="inf-status">{generalRisk.data['level_Inflasi MoM (%)'] || generalRisk.data.level_mom}</div>
                    </div>
                    <div className={`inflasi-box ${getStatusClassKamtibmas(generalRisk.data['level_Inflasi YoY (%)'] || generalRisk.data.level_yoy)}`}>
                      <span className="inf-label">YoY</span>
                      <span className="inf-val">{generalRisk.data['Inflasi YoY (%)'] ?? generalRisk.data.yoy}%</span>
                      <div className="inf-status">{generalRisk.data['level_Inflasi YoY (%)'] || generalRisk.data.level_yoy}</div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data-box" style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', margin: '0' }}>Data Inflasi tidak bersedia</p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 1: Pangan */}
            <section className="summary-section pangan">
              <div className="section-top">
                <div className="section-header">
                  <i className="fa-solid fa-wheat-awn"></i>
                  <h3>RISIKO PANGAN</h3>
                </div>
              </div>
              <div className="section-content">
                {commodity.loading ? (
                  <div className="inner-loading">
                    <div className="shimmer-box heroh"></div>
                    <div className="shimmer-box list"></div>
                  </div>
                ) : commodity.data ? (
                  <>
                    {(() => {
                      const score = generalRisk.data?.pangan_score ?? generalRisk.data?.['skor-pangan-agregasi'] ?? commodity.data?.nationalScore ?? 0;
                      const level = getFoodRiskLabel(score);
                      return (
                        <div className={`score-widget-v3 ${getFoodRiskClass(score)}`}>
                          <div className="widget-glare"></div>
                          <div className="widget-content">
                            <div className="value-wrap">
                              <span className="value-num">{Number(score).toFixed(1)}</span>
                              <span className="value-unit">INDEX RISK</span>
                            </div>
                            <div className="widget-status">
                              <div className="status-indicator"></div>
                              <span className="status-text">{level}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="data-table-mini">
                      <div className="table-header">
                        <span>KOMODITAS</span>
                        <span className="th-right">DEVIASI</span>
                      </div>
                      {(commodity.data.foodItems || []).slice(0, 12).map((item: any) => (
                        <div className="table-row" key={item.code}>
                          <div className="row-left">
                            <span className="name">{item.name}</span>
                            <span className="sub">Base: Rp {formatCurrency(item.baseline)}</span>
                          </div>
                          <div className="row-right">
                            <span className="price">Rp {formatCurrency(item.price)}</span>
                            <span className={`dev ${item.dev > 0 ? 'up' : 'down'}`}>
                              {item.dev > 0 ? '+' : ''}{Number(item.dev).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-data-box">
                    <i className="fa-solid fa-box-open"></i>
                    <p>Data Pangan tidak ditemukan</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Section 2: Keamanan (Kamtibmas) */}
          <section className="summary-section keamanan">
            <div className="section-top">
              <div className="section-header">
                <i className="fa-solid fa-shield-halved"></i>
                <h3>KAMTIBMAS</h3>
              </div>
            </div>
            <div className="section-content">
              {kamtibmas.loading ? (
                <div className="inner-loading">
                  <div className="shimmer-box heroh"></div>
                  <div className="shimmer-box grid"></div>
                </div>
              ) : kamtibmas.data ? (
                <>
                  {(() => {
                    let total = 0;
                    const categories = kamtibmas.data?.categories || kamtibmas.data;
                    if (categories && typeof categories === 'object' && !Array.isArray(categories)) {
                      total = Object.values(categories).reduce((a: any, b: any) => a + Number(b), 0) as number;
                    } else if (kamtibmas.data?.additional_data?.raw_total_week_prov) {
                      total = kamtibmas.data.additional_data.raw_total_week_prov;
                    }
                    
                    const caseDetailRaw = kamtibmas.data?.case_detail || kamtibmas.data?.additional_data?.case_detail || {};
                    const getCatTotal = (key: string) => {
                       const cats = kamtibmas.data?.categories || kamtibmas.data || {};
                       return cats[key] || caseDetailRaw[`${key}_total`]?.[0]?.kasus_mingguan || 0;
                    };
                    
                    const level = generalRisk.data?.['level_skor-kamtibmas'] || generalRisk.data?.kamtibmas_level || kamtibmas.data?.status || 'STABIL';
                    const score = generalRisk.data?.['skor-kamtibmas'] || generalRisk.data?.kamtibmas_score || kamtibmas.data?.score || 0;
                    
                    return (
                      <>
                        <div className={`score-widget-v3 kamtibmas ${getStatusClassKamtibmas(level)}`}>
                          <div className="widget-glare"></div>
                          <div className="widget-content">
                            <div className="value-wrap">
                              <span className="value-num">{(total || 0).toLocaleString('id-ID')}</span>
                              <span className="value-unit">INSIDEN</span>
                            </div>
                            <div className="status-col">
                              <div className="widget-status">
                                <div className="status-indicator"></div>
                                <span className="status-text">{level || 'STABIL'}</span>
                              </div>
                              <div className="k-score-mini">
                                <span className="ks-lbl">INDEX RISK </span>
                                <span className="ks-val">{Number(score).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="k-grid">
                          <div className="k-cell">
                            <span className="label">KEJAHATAN</span>
                            <span className="val">{getCatTotal('kejahatan').toLocaleString('id-ID')}</span>
                          </div>
                          <div className="k-cell">
                            <span className="label">GANGGUAN</span>
                            <span className="val">{getCatTotal('gangguan').toLocaleString('id-ID')}</span>
                          </div>
                          <div className="k-cell">
                            <span className="label">PELANGGARAN</span>
                            <span className="val">{getCatTotal('pelanggaran').toLocaleString('id-ID')}</span>
                          </div>
                          <div className="k-cell">
                            <span className="label">BENCANA</span>
                            <span className="val">{getCatTotal('bencana').toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="no-data-box">
                  <i className="fa-solid fa-shield-slash"></i>
                  <p>Data Kamtibmas tidak tersedia</p>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Isu Populer */}
          <section className="summary-section isu">
            <div className="section-top">
              <div className="section-header">
                <i className="fa-solid fa-fire-flame-curved"></i>
                <h3>ISU POPULER</h3>
              </div>
            </div>
            <div className="section-content">
              {issues.loading ? (
                <div className="inner-loading">
                  <div className="shimmer-box full"></div>
                  <div className="shimmer-box full"></div>
                </div>
              ) : issues.data?.length > 0 ? (
                <div className="isu-list-v3">
                  {issues.data.slice(0, 3).map((issue: any) => (
                    <div className="isu-row-v3" key={issue.title}>
                      <div className="isu-meta-v3">
                        <span className={`isu-dot ${issue.status?.toLowerCase()}`}></span>
                        <span className="isu-status-v3">{issue.status}</span>
                        <span className="isu-meta-divider"></span>
                        <span className="isu-intensity-v3">{issue.percentage}% INTENSITY</span>
                      </div>
                      <p className="isu-title-v3">{issue.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-box">
                  <i className="fa-solid fa-ghost"></i>
                  <p>Tidak ada isu menonjol hari ini</p>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Sentimen Berita */}
          <section className="summary-section sentimen">
            <div className="section-top">
              <div className="section-header">
                <i className="fa-solid fa-newspaper"></i>
                <h3>SENTIMEN MEDIA</h3>
              </div>
            </div>
            <div className="section-content">
              {sentiment.loading ? (
                <div className="inner-loading">
                  <div className="shimmer-box bar"></div>
                  <div className="shimmer-box cardh"></div>
                </div>
              ) : sentiment.data ? (
                <>
                  {(() => {
                    const sentimen_score = generalRisk.data?.['skor-sentimen'] || generalRisk.data?.sentimen_score || 0;
                    const sentimen_level = generalRisk.data?.['level_skor-sentimen'] || generalRisk.data?.sentimen_level || 'AMAN';
                    
                    const news = sentiment.data?.news || sentiment.data?.data?.news || sentiment.data?.data?.sentimentAnalysis || [];
                    let stats = sentiment.data?.stats || sentiment.data?.data?.stats;
                    
                    if (!stats && news.length > 0) {
                      const pos = news.filter((n: any) => (n.sentiment || '').toLowerCase().includes('pos')).length;
                      const neg = news.filter((n: any) => (n.sentiment || '').toLowerCase().includes('neg')).length;
                      const neu = news.length - pos - neg;
                      stats = { positive: Math.round((pos/news.length)*100), negative: Math.round((neg/news.length)*100), neutral: Math.round((neu/news.length)*100) };
                    } else if (!stats) {
                      stats = { positive: 0, negative: 0, neutral: 0 };
                    }
                    
                    return (
                      <>
                        <div className={`score-widget-v3 sentimen ${getStatusClassKamtibmas(sentimen_level)}`}>
                          <div className="widget-glare"></div>
                          <div className="widget-content">
                            <div className="value-wrap">
                              <span className="value-num">{Number(sentimen_score).toFixed(1)}</span>
                              <span className="value-unit">SENTIMENT SCORE</span>
                            </div>
                            <div className="widget-status">
                              <div className="status-indicator"></div>
                              <span className="status-text">{sentimen_level}</span>
                            </div>
                          </div>
                        </div>

                        <div className="sentiment-summary">
                          <div className="dist-bar-v2">
                            <div className="segment pos" style={{ width: `${stats.positive}%` }}></div>
                            <div className="segment neu" style={{ width: `${stats.neutral}%` }}></div>
                            <div className="segment neg" style={{ width: `${stats.negative}%` }}></div>
                          </div>
                          <div className="dist-labels">
                            <span className="l-pos">{stats.positive}% Positif</span>
                            <span className="l-neg">{stats.negative}% Negatif</span>
                          </div>
                        </div>

                        <div className="news-stack-mini">
                          {news.slice(0, 3).map((item: any, i: number) => (
                            <div className="news-card-v2" key={i}>
                              <div className="n-header">
                                <span className="n-source">{item.source || 'Portal Berita'}</span>
                                <span className={`n-sent ${item.sentiment?.toLowerCase()}`}>{item.sentiment}</span>
                              </div>
                              <p className="n-title">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="no-data-box">
                  <i className="fa-solid fa-comment-slash"></i>
                  <p>Berita regional tidak ditemukan</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Analysis Strategic Section */}
          <section className="summary-section ai-analysis-card long-empty-v3">
            <div className="section-top">
              <div className="section-header">
                <i className="fa-solid fa-robot"></i>
                <h3>EXECUTIVE INSIGHT</h3>
              </div>

              {aiAnalysis.data && aiAnalysis.data.length > 1 && (
                <div className="ai-pagination-v3">
                  <button
                    className="pag-btn"
                    disabled={currentAiPage === 0}
                    onClick={() => setCurrentAiPage(Math.max(0, currentAiPage - 1))}
                    aria-label="Previous insight"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span className="pag-info">
                    {currentAiPage + 1} <span className="pag-total">/ {aiAnalysis.data.length}</span>
                  </span>
                  <button
                    className="pag-btn"
                    disabled={currentAiPage === aiAnalysis.data.length - 1}
                    onClick={() => setCurrentAiPage(Math.min(aiAnalysis.data.length - 1, currentAiPage + 1))}
                    aria-label="Next insight"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              )}

              <div className="ai-status-badge">
                <span className="pulse-dot"></span>
                LIVE
              </div>
            </div>

            <div className="section-content">
              {aiAnalysis.loading ? (
                <div className="inner-loading ai-load">
                  <div className="shimmer-box title-h"></div>
                  <div className="shimmer-box body-h"></div>
                </div>
              ) : aiAnalysis.data && aiAnalysis.data[currentAiPage] ? (
                <div className="ai-insight-single-view">
                  {(() => {
                     const insight = aiAnalysis.data[currentAiPage];
                     const sig = insight.significance_scale?.toLowerCase() || '';
                     const sigClass = sig.includes('tinggi') || sig.includes('high') ? 'high' : (sig.includes('sedang') || sig.includes('medium') ? 'medium' : 'normal');
                     
                     return (
                       <>
                        <div className="ai-header-row">
                          <div className="ai-title-group">
                            <div className="ai-meta">
                              <span className={`ai-urgency ${sigClass}`}>
                                {insight.significance_scale || 'NORMAL'}
                              </span>
                              <span className="ai-date-v2">
                                {new Date(insight.date || Date.now()).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <h4 className="ai-main-title">
                              <span className="ai-index-no">#{currentAiPage + 1} </span>
                              {insight.issue_title}
                            </h4>
                            <p className="ai-summary-text">
                              {insight.issue_summary}
                            </p>
                          </div>
                        </div>

                        <div className="ai-brief-grid">
                          <div className="ai-brief-col">
                            <div className="brief-label">
                              <i className="fa-solid fa-bullseye"></i> ANALISIS DAMPAK
                            </div>
                            <p className="brief-text" dangerouslySetInnerHTML={{ __html: insight.impact?.description || insight.impact || 'Tidak ada uraian dampak.' }}></p>
                          </div>
                          <div className="ai-brief-col">
                            <div className="brief-label"><i className="fa-solid fa-bolt"></i> REKOMENDASI</div>
                            <div className="brief-text">
                              {Array.isArray(insight.recommendation) ? (
                                <ul className="ai-bullet-list">
                                  {insight.recommendation.map((rec: string, i: number) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: rec }}></li>
                                  ))}
                                </ul>
                              ) : (
                                <div dangerouslySetInnerHTML={{ __html: insight.recommendation || 'Belum ada rekomendasi.' }}></div>
                              )}
                            </div>
                          </div>
                        </div>
                       </>
                     );
                  })()}
                </div>
              ) : (
                <div className="no-data-box ai-empty">
                  <i className="fa-solid fa-brain"></i>
                  <p>Analisis AI untuk {regionName} belum tersedia hari ini.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RegionalSummaryModal;
