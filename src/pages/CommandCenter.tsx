import { useCommandCenterData } from '../hooks/useCommandCenterData';

// Feature Components
import MapSection from '../components/CommandCenter/features/MapSection';
import KamtibmasRiskIndex from '../components/CommandCenter/features/KamtibmasRiskIndex';
import PublicSentiment from '../components/CommandCenter/features/PublicSentiment';
import CommodityIndex from '../components/CommandCenter/features/CommodityIndex';
import CrimeTrendChart from '../components/CommandCenter/features/CrimeTrendChart';
import TacticalTimeline from '../components/CommandCenter/features/TacticalTimeline';
import TopSummary from '../components/CommandCenter/features/TopSummary';
import RegionalSummaryModal from '../components/CommandCenter/features/RegionalSummaryModal';

export default function CommandCenter() {
  const data = useCommandCenterData();

  if (!data.mounted) return null;

  return (
    <>
      <div className="flex-1 p-1 space-y-6 relative z-10 custom-dashboard-layout selection:bg-cyan-500/30">
        {/* News Ticker & Quick Analytical Stats */}
        <TopSummary 
          nationalKamtibmasStats={data.nationalKamtibmasStats}
          commodityHetStats={data.commodityHetStats}
          sosmedSentiment={data.sosmedSentiment}
          accidentStats={data.accidentStats}
          tickerItems={data.dynamicTickerItems}
        />

        {/* Top Map Section */}
        <div className="h-[600px] w-full flex gap-5">
          <MapSection 
            activeMapMode={data.activeMapMode}
            isRainViewerActive={data.isRainViewerActive}
            isSatelliteMode={data.isSatelliteMode}
            selectedCity={data.selectedCity}
            setSelectedCity={data.setSelectedCity}
            cities={data.cities}
            cityBoundaries={data.cityBoundaries}
            radarFrames={data.radarFrames}
            radarIndex={data.radarIndex}
            isRadarPlaying={data.isRadarPlaying}
            setIsRadarPlaying={data.setIsRadarPlaying}
            setIsRainViewerActive={data.setIsRainViewerActive}
            setIsSatelliteMode={data.setIsSatelliteMode}
            isWeatherHeatmapVisible={data.isWeatherHeatmapVisible}
            setIsWeatherHeatmapVisible={data.setIsWeatherHeatmapVisible}
            mapCities={data.mapCities}
            weatherData={data.weatherData}
            addToast={data.addToast}
            setActiveMapMode={data.setActiveMapMode}
            riskScores={data.riskScores}
            setKamtibmasRegion={data.setKamtibmasRegion}
            openSummaryModal={data.openSummaryModal}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-3 gap-5 items-stretch">
          {/* Left Analytical Column */}
          <div className="col-span-2 space-y-5 flex flex-col">
            <KamtibmasRiskIndex 
              riskScores={data.riskScores} 
            />

            <div className="grid grid-cols-2 gap-5">
              <PublicSentiment />
              <CommodityIndex 
                commodityMatrix={data.commodityMatrix}
                isCommodityLoading={data.isCommodityLoading}
                foodRiskData={data.foodRiskData}
                foodRegion={data.foodRegion}
                setFoodRegion={data.setFoodRegion}
              />
            </div>

            <CrimeTrendChart 
              crimeTrendData={data.crimeTrendData}
              hoverIdx={data.hoverIdx}
              setHoverIdx={data.setHoverIdx}
            />
          </div>

          {/* Right Tactical Column */}
          <div className="col-span-1 flex flex-col h-full">
            <TacticalTimeline 
              filter={data.filter}
              setFilter={data.setFilter}
              filteredTimeline={data.filteredTimeline}
            />
          </div>
        </div>
      </div>

      {/* High-Fidelity Regional Summary Modal - Moved out of z-10 container */}
      <RegionalSummaryModal 
        isOpen={data.isSummaryModalOpen}
        onClose={() => data.setIsSummaryModalOpen(false)}
        regionCode={data.summaryRegion.code}
        regionName={data.summaryRegion.name}
        data={data.summaryData}
      />
    </>
  );
}
