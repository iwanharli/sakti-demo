import { pgTable, bigserial, integer, varchar, numeric, timestamp, foreignKey, date, jsonb, doublePrecision, uniqueIndex, index, text, bigint, serial, smallint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const nasionalRawApbnData = pgTable("nasional_raw_apbn_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportYear: integer("report_year").notNull(),
	category: varchar({ length: 64 }).default('pendapatan negara'),
	value: numeric({ precision: 18, scale:  2 }).notNull(),
	unit: varchar({ length: 32 }).default('triliun rupiah').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalPihpsCommodityItems = pgTable("nasional_pihps_commodity_items", {
	id: bigserial({ mode: "bigint" }).notNull(),
	commodityCode: varchar("commodity_code", { length: 128 }).notNull(),
	commodityName: varchar("commodity_name", { length: 255 }).notNull(),
	commodityUnit: varchar("commodity_unit", { length: 50 }).default('Rp./Kg').notNull(),
	treeId: varchar("tree_id", { length: 100 }).notNull(),
	parentId: varchar("parent_id", { length: 100 }).default(sql`NULL`),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalPihpsCommodityRegionalPrices = pgTable("nasional_pihps_commodity_regional_prices", {
	id: bigserial({ mode: "bigint" }).notNull(),
	marketType: varchar("market_type", { length: 50 }).notNull(),
	commodityCode: varchar("commodity_code", { length: 128 }).notNull(),
	regionCode: varchar("region_code", { length: 50 }).notNull(),
	regionName: varchar("region_name", { length: 255 }).notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	reportDate: date("report_date").notNull(),
	price: numeric({ precision: 15, scale:  2 }).notNull(),
	gapPrice: numeric("gap_price", { precision: 15, scale:  2 }),
	gapPercentage: numeric("gap_percentage", { precision: 8, scale:  2 }),
	gapChange: varchar("gap_change", { length: 10 }),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.commodityCode],
			foreignColumns: [nasionalPihpsCommodityItems.commodityCode],
			name: "fk_pihps_regional_price_commodity"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const nasionalKamtibmasCaseData = pgTable("nasional_kamtibmas_case_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportYear: integer("report_year").default(2026).notNull(),
	reportMonth: integer("report_month").default(1).notNull(),
	reportDate: date("report_date").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	poldaName: varchar("polda_name", { length: 100 }).notNull(),
	category: varchar({ length: 128 }).default('kejahatan').notNull(),
	subCategory: varchar("sub_category", { length: 128 }).default('kejahatan').notNull(),
	value: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalKamtibmasUnjukRasaData = pgTable("nasional_kamtibmas_unjuk_rasa_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportYear: integer("report_year").default(2026).notNull(),
	reportMonth: integer("report_month").default(1).notNull(),
	reportDate: date("report_date").notNull(),
	regionCode: varchar("region_code", { length: 8 }).notNull(),
	poldaName: varchar("polda_name", { length: 100 }).notNull(),
	category: varchar({ length: 128 }).default('total_unjuk_rasa').notNull(),
	value: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const regionIndonesiaProvinces = pgTable("region_indonesia_provinces", {
	regionCode: varchar("region_code", { length: 4 }).notNull(),
	regionName: varchar("region_name", { length: 64 }).notNull(),
});

export const regionIndonesiaCities = pgTable("region_indonesia_cities", {
	id: serial().primaryKey().notNull(),
	gid2: varchar("gid_2", { length: 50 }).notNull(),
	gid0: varchar("gid_0", { length: 10 }).default('IDN').notNull(),
	country: varchar({ length: 50 }).default('Indonesia').notNull(),
	gid1: varchar("gid_1", { length: 50 }),
	provinceName: varchar("province_name", { length: 100 }).notNull(),
	nlName1: varchar("nl_name_1", { length: 100 }),
	cityName: varchar("city_name", { length: 150 }).notNull(),
	varname2: varchar("varname_2", { length: 200 }),
	nlName2: varchar("nl_name_2", { length: 200 }),
	cityType: varchar("city_type", { length: 50 }),
	cityTypeEn: varchar("city_type_en", { length: 50 }),
	cc2: varchar("cc_2", { length: 20 }),
	hasc2: varchar("hasc_2", { length: 20 }),
	geometry: jsonb().notNull(),
	centroidLat: doublePrecision("centroid_lat"),
	centroidLon: doublePrecision("centroid_lon"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const calculationIndexRisiko = pgTable("calculation_index_risiko", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportDate: date("report_date").notNull(),
	category: varchar({ length: 64 }).notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	value: doublePrecision().notNull(),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalRawUmpData = pgTable("nasional_raw_ump_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportYear: integer("report_year").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	regionName: varchar("region_name", { length: 100 }).notNull(),
	value: numeric({ precision: 15, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	gapPercentage: numeric("gap_percentage", { precision: 10, scale:  4 }),
}, (table) => [
	uniqueIndex("uq_nasional_ump_year_region").using("btree", table.reportYear.asc().nullsLast().op("int4_ops"), table.regionCode.asc().nullsLast().op("int4_ops")),
]);

export const nasionalTradingEconomicData = pgTable("nasional_trading_economic_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	country: varchar({ length: 128 }).notNull(),
	category: varchar({ length: 256 }).notNull(),
	reportDate: date("report_date").notNull(),
	reportYear: integer("report_year"),
	reportMonth: integer("report_month"),
	value: numeric({ precision: 18, scale:  4 }).notNull(),
	frequency: varchar({ length: 64 }),
	historicalDataSymbol: varchar("historical_data_symbol", { length: 128 }),
	dataLastUpdate: timestamp("data_last_update", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalBpsInflationIhkData = pgTable("nasional_bps_inflation_ihk_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	country: varchar({ length: 64 }).default('indonesia').notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	category: varchar({ length: 64 }).notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	value: numeric({ precision: 10, scale:  4 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalOjkTwp90Data = pgTable("nasional_ojk_twp90_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	country: varchar({ length: 64 }).default('indonesia').notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	category: varchar({ length: 64 }).notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	value: numeric({ precision: 20, scale:  4 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalCommodityRegionalPrices = pgTable("nasional_commodity_regional_prices", {
	id: bigserial({ mode: "bigint" }).notNull(),
	commodityCode: varchar("commodity_code", { length: 64 }).notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	reportDate: date("report_date").notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	price: numeric({ precision: 18, scale:  2 }).notNull(),
	additionalInfo: jsonb("additional_info"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const analysisResultTopics = pgTable("analysis_result_topics", {
	id: bigserial({ mode: "bigint" }).notNull(),
	resultSummaryCode: varchar("result_summary_code", { length: 64 }).notNull(),
	topicName: varchar("topic_name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	reportDate: date("report_date"),
}, (table) => [
	index("idx_analysis_result_topics_region_date").using("btree", table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	index("idx_analysis_result_topics_summary_region_date").using("btree", table.resultSummaryCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_analysis_result_topics_summary_topic").using("btree", table.resultSummaryCode.asc().nullsLast().op("text_ops"), table.topicName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.resultSummaryCode],
			foreignColumns: [analysisResultSummaries.resultSummaryCode],
			name: "fk_analysis_result_topics_summary"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const nasionalRawPopulationData = pgTable("nasional_raw_population_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	country: varchar({ length: 64 }).default('Indonesia').notNull(),
	reportYear: integer("report_year").default(2020).notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	category: varchar({ length: 64 }).notNull(),
	value: numeric({ precision: 15, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_nasional_raw_population_upsert_key").using("btree", table.country.asc().nullsLast().op("int4_ops"), table.reportYear.asc().nullsLast().op("int4_ops"), table.regionCode.asc().nullsLast().op("int4_ops"), table.category.asc().nullsLast().op("int4_ops")),
]);

export const nasionalCommoditySp2Kp = pgTable("nasional_commodity_sp2kp", {
	id: bigserial({ mode: "bigint" }).notNull(),
	commodityCode: varchar("commodity_code", { length: 64 }).notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	reportDate: date("report_date").notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	price: numeric({ precision: 18, scale:  2 }).notNull(),
	additionalInfo: jsonb("additional_info"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const calculationCommodityDeviation = pgTable("calculation_commodity_deviation", {
	id: bigserial({ mode: "bigint" }).notNull(),
	sourceCode: varchar("source_code", { length: 50 }).default('badanpangan'),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	reportDate: date("report_date").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	regionName: varchar("region_name", { length: 100 }).notNull(),
	commodityCode: varchar("commodity_code", { length: 50 }).notNull(),
	todayPrice: numeric("today_price", { precision: 15, scale:  2 }).notNull(),
	p80Percentage: numeric("p80_percentage", { precision: 6, scale:  2 }),
	p95Percentage: numeric("p95_percentage", { precision: 6, scale:  2 }),
	deviasiPercentage: numeric("deviasi_percentage", { precision: 6, scale:  2 }),
	deviationPercentagePositive: numeric("deviation_percentage_positive", { precision: 6, scale:  2 }).default('0').notNull(),
	reportStatus: varchar("report_status", { length: 20 }).default('normal'),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_deviation_upsert_key").using("btree", table.sourceCode.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops"), table.commodityCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops")),
]);

export const nasionalBmkgWeatherByCity = pgTable("nasional_bmkg_weather_by_city", {
	id: bigserial({ mode: "bigint" }).notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	regionName: varchar("region_name", { length: 100 }),
	cityCode: varchar("city_code", { length: 20 }),
	cityName: varchar("city_name", { length: 100 }),
	reportYear: integer("report_year"),
	reportMonth: integer("report_month"),
	reportDate: date("report_date"),
	condition: varchar({ length: 100 }),
	tempAverage: numeric("temp_average"),
	humidityAverage: numeric("humidity_average"),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	uniqueIndex("nasional_bmkg_weather_by_city_unique_idx").using("btree", table.regionCode.asc().nullsLast().op("int4_ops"), table.cityCode.asc().nullsLast().op("int4_ops"), table.reportYear.asc().nullsLast().op("int4_ops"), table.reportMonth.asc().nullsLast().op("int4_ops"), table.reportDate.asc().nullsLast().op("int4_ops")),
]);

export const newsItems = pgTable("news_items", {
	id: bigserial({ mode: "bigint" }).notNull(),
	newsCode: varchar("news_code", { length: 64 }).notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	newsDate: date("news_date").notNull(),
	newsDomain: varchar("news_domain", { length: 255 }),
	newsUrl: varchar("news_url", { length: 550 }),
	newsTitle: varchar("news_title", { length: 500 }).notNull(),
	newsSnippet: varchar("news_snippet", { length: 1000 }),
	newsContent: text("news_content").notNull(),
	newsEnclosure: jsonb("news_enclosure"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	newsSentiment: varchar("news_sentiment", { length: 16 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	newsId: bigint("news_id", { mode: "number" }),
}, (table) => [
	index("idx_news_items_date_region").using("btree", table.newsDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops")),
]);

export const analysisIssueLists = pgTable("analysis_issue_lists", {
	id: bigserial({ mode: "bigint" }).notNull(),
	mainSummaryCode: varchar("main_summary_code", { length: 64 }).notNull(),
	issueName: varchar("issue_name", { length: 255 }).notNull(),
	percentage: numeric({ precision: 5, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	reportDate: date("report_date"),
	newsIdx: jsonb("news_idx"),
}, (table) => [
	index("idx_analysis_issue_lists_region_date").using("btree", table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	index("idx_analysis_issue_lists_summary_region_date").using("btree", table.mainSummaryCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_analysis_issue_lists_summary_issue").using("btree", table.mainSummaryCode.asc().nullsLast().op("text_ops"), table.issueName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.mainSummaryCode],
			foreignColumns: [analysisMainSummaries.mainSummaryCode],
			name: "fk_analysis_issue_lists_summary"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const statisticGeneral = pgTable("statistic_general", {
	id: bigserial({ mode: "bigint" }).notNull(),
	label: varchar({ length: 100 }).notNull(),
	tag: varchar({ length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	value: bigint({ mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_statistic_general_label_tag_name").using("btree", table.label.asc().nullsLast().op("text_ops"), table.tag.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
]);

export const calculationCommodityBaselinePrevYear = pgTable("calculation_commodity_baseline_prev_year", {
	id: bigserial({ mode: "bigint" }).notNull(),
	sourceCode: varchar("source_code", { length: 50 }).default('badanpangan'),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	reportDate: date("report_date").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	regionName: varchar("region_name", { length: 100 }).notNull(),
	commodityCode: varchar("commodity_code", { length: 50 }).notNull(),
	price: numeric({ precision: 15, scale:  2 }).notNull(),
	baselinePrice: numeric("baseline_price", { precision: 15, scale:  2 }).notNull(),
	deviationPercentage: numeric("deviation_percentage", { precision: 6, scale:  2 }).notNull(),
	deviationPercentagePositive: numeric("deviation_percentage_positive", { precision: 6, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_baseline_upsert_key").using("btree", table.sourceCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops"), table.commodityCode.asc().nullsLast().op("date_ops")),
]);

export const financeIhsgUpdateMinutes = pgTable("finance_ihsg_update_minutes", {
	id: serial().notNull(),
	spotDate: date("spot_date").notNull(),
	spotHour: smallint("spot_hour").notNull(),
	spotMinute: smallint("spot_minute").notNull(),
	spotPrice: numeric("spot_price", { precision: 20, scale:  8 }),
	openPrice: numeric("open_price", { precision: 20, scale:  8 }),
	closePrice: numeric("close_price", { precision: 20, scale:  8 }),
	gapPrice: numeric("gap_price", { precision: 20, scale:  8 }),
	gapPercentage: numeric("gap_percentage", { precision: 10, scale:  4 }),
	gapChange: varchar("gap_change", { length: 10 }),
	unit: varchar({ length: 50 }).default(sql`NULL`),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const queueEngineN8NFetcher = pgTable("queue_engine_n8n_fetcher", {
	id: bigserial({ mode: "bigint" }).notNull(),
	queueCode: varchar("queue_code", { length: 255 }).notNull(),
	parameter: jsonb(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const statisticRegionDate = pgTable("statistic_region_date", {
	id: bigserial({ mode: "bigint" }).notNull(),
	statisticDate: date("statistic_date").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	label: varchar({ length: 100 }).notNull(),
	tag: varchar({ length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	value: bigint({ mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_statistic_region_date_label_tag_name").using("btree", table.statisticDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops"), table.label.asc().nullsLast().op("date_ops"), table.tag.asc().nullsLast().op("date_ops"), table.name.asc().nullsLast().op("date_ops")),
]);

export const analysisMainSummaries = pgTable("analysis_main_summaries", {
	id: bigserial({ mode: "bigint" }).notNull(),
	mainSummaryCode: varchar("main_summary_code", { length: 64 }).notNull(),
	reportDate: date("report_date").notNull(),
	regionCode: varchar("region_code", { length: 20 }).notNull(),
	regionName: varchar("region_name", { length: 255 }),
	averageScore: numeric("average_score", { precision: 5, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("uq_analysis_main_summaries_date_region").using("btree", table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops")),
]);

export const analysisResultSummaries = pgTable("analysis_result_summaries", {
	id: bigserial({ mode: "bigint" }).notNull(),
	resultSummaryCode: varchar("result_summary_code", { length: 64 }).notNull(),
	mainSummaryCode: varchar("main_summary_code", { length: 64 }).notNull(),
	issueSummary: text("issue_summary").notNull(),
	impactAnalysis: jsonb("impact_analysis").notNull(),
	recommendationAnalysis: jsonb("recommendation_analysis").notNull(),
	significanceScore: integer("significance_score").default(1).notNull(),
	significanceScale: varchar("significance_scale", { length: 20 }).default('sedang').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	reportDate: date("report_date"),
	title: varchar(),
	issueTitle: varchar("issue_title"),
	percentage: numeric({ precision: 5, scale:  2 }).default('0'),
}, (table) => [
	index("idx_analysis_result_summaries_main").using("btree", table.mainSummaryCode.asc().nullsLast().op("text_ops")),
	index("idx_analysis_result_summaries_region_date").using("btree", table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops")),
	index("idx_analysis_result_summaries_summary_region_date").using("btree", table.mainSummaryCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.mainSummaryCode],
			foreignColumns: [analysisMainSummaries.mainSummaryCode],
			name: "fk_analysis_result_summaries_summary"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const analysisResultNewsList = pgTable("analysis_result_news_list", {
	id: bigserial({ mode: "bigint" }).notNull(),
	resultSummaryCode: varchar("result_summary_code", { length: 64 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	newsId: bigint("news_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	reportDate: date("report_date"),
}, (table) => [
	foreignKey({
			columns: [table.resultSummaryCode],
			foreignColumns: [analysisResultSummaries.resultSummaryCode],
			name: "fk_analysis_result_news_list_summary"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const nasionalCommodityMonthlyPrices = pgTable("nasional_commodity_monthly_prices", {
	id: serial().notNull(),
	commodityCode: varchar("commodity_code", { length: 255 }),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	price: numeric({ precision: 15, scale:  2 }),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const nasionalCommodityDailyPrices = pgTable("nasional_commodity_daily_prices", {
	id: serial().notNull(),
	commodityCode: varchar("commodity_code", { length: 255 }),
	todayDate: date("today_date").notNull(),
	todayPrice: numeric("today_price", { precision: 15, scale:  2 }),
	yesterdayDate: date("yesterday_date"),
	yesterdayPrice: numeric("yesterday_price", { precision: 15, scale:  2 }),
	gapPrice: numeric("gap_price", { precision: 15, scale:  2 }),
	gapPercentage: numeric("gap_percentage", { precision: 5, scale:  2 }),
	gapChange: varchar("gap_change", { length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const financeCurrencyUpdateMinutes = pgTable("finance_currency_update_minutes", {
	id: serial().notNull(),
	spotDate: date("spot_date").notNull(),
	spotHour: smallint("spot_hour").notNull(),
	spotMinute: smallint("spot_minute").notNull(),
	spotPrice: numeric("spot_price", { precision: 20, scale:  8 }),
	openPrice: numeric("open_price", { precision: 20, scale:  8 }),
	closePrice: numeric("close_price", { precision: 20, scale:  8 }),
	gapPrice: numeric("gap_price", { precision: 20, scale:  8 }),
	gapPercentage: numeric("gap_percentage", { precision: 10, scale:  4 }),
	gapChange: varchar("gap_change", { length: 10 }).notNull(),
	unit: varchar({ length: 50 }).default(sql`NULL`),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const nasionalCommodityItems = pgTable("nasional_commodity_items", {
	id: serial().notNull(),
	commodityCode: varchar("commodity_code", { length: 255 }).notNull(),
	commodityName: varchar("commodity_name", { length: 255 }).notNull(),
	commodityUnit: varchar("commodity_unit", { length: 50 }),
	referencePrice: jsonb("reference_price"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	bpid: varchar(),
	source: varchar({ length: 64 }).default('badanpangan').notNull(),
}, (table) => [
	uniqueIndex("idx_nasional_commodity_items_commodity_source").using("btree", table.commodityCode.asc().nullsLast().op("text_ops"), table.source.asc().nullsLast().op("text_ops")),
]);

export const analysisNewsSources = pgTable("analysis_news_sources", {
	id: bigserial({ mode: "bigint" }).notNull(),
	mainSummaryCode: varchar("main_summary_code", { length: 64 }).notNull(),
	sourceName: varchar("source_name", { length: 255 }).notNull(),
	sourceType: varchar("source_type", { length: 255 }).default('rss'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	regionCode: varchar("region_code", { length: 20 }),
	reportDate: date("report_date"),
}, (table) => [
	index("idx_analysis_news_sources_region_date").using("btree", table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	index("idx_analysis_news_sources_summary_region_date").using("btree", table.mainSummaryCode.asc().nullsLast().op("date_ops"), table.reportDate.asc().nullsLast().op("date_ops"), table.regionCode.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_analysis_news_sources_summary_source").using("btree", table.mainSummaryCode.asc().nullsLast().op("text_ops"), table.sourceName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.mainSummaryCode],
			foreignColumns: [analysisMainSummaries.mainSummaryCode],
			name: "fk_analysis_news_sources_summary"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const newsTopics = pgTable("news_topics", {
	id: bigserial({ mode: "bigint" }).notNull(),
	newsCode: varchar("news_code", { length: 64 }).notNull(),
	topicName: varchar("topic_name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_news_topics_topic").using("btree", table.topicName.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_news_topics_news_topic").using("btree", table.newsCode.asc().nullsLast().op("text_ops"), table.topicName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.newsCode],
			foreignColumns: [newsItems.newsCode],
			name: "fk_news_topics_news"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const financeBrentOilUpdateMinutes = pgTable("finance_brent_oil_update_minutes", {
	id: serial().notNull(),
	spotDate: date("spot_date").notNull(),
	spotHour: smallint("spot_hour").notNull(),
	spotMinute: smallint("spot_minute").notNull(),
	spotPrice: numeric("spot_price", { precision: 20, scale:  8 }),
	openPrice: numeric("open_price", { precision: 20, scale:  8 }),
	closePrice: numeric("close_price", { precision: 20, scale:  8 }),
	gapPrice: numeric("gap_price", { precision: 20, scale:  8 }),
	gapPercentage: numeric("gap_percentage", { precision: 10, scale:  4 }),
	gapChange: varchar("gap_change", { length: 10 }),
	unit: varchar({ length: 50 }).default(sql`NULL`),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const nasionalBpsUnemployedData = pgTable("nasional_bps_unemployed_data", {
	id: bigserial({ mode: "bigint" }).notNull(),
	reportYear: integer("report_year").notNull(),
	reportMonth: integer("report_month").notNull(),
	regionCode: varchar("region_code", { length: 32 }).notNull(),
	regionName: varchar("region_name", { length: 128 }).notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	unit: varchar({ length: 50 }).default('persen'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const nasionalBmkgWarningData = pgTable("nasional_bmkg_warning_data", {
	id: serial().notNull(),
	warningType: varchar("warning_type", { length: 255 }),
	warningEvent: text("warning_event"),
	warningTitle: text("warning_title"),
	warningDescription: text("warning_description"),
	additionalData: jsonb("additional_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
