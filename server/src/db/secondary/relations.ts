import { relations } from "drizzle-orm/relations";
import { nasionalPihpsCommodityItems, nasionalPihpsCommodityRegionalPrices, analysisResultSummaries, analysisResultTopics, analysisMainSummaries, analysisIssueLists, analysisResultNewsList, analysisNewsSources, newsItems, newsTopics } from "./schema";

export const nasionalPihpsCommodityRegionalPricesRelations = relations(nasionalPihpsCommodityRegionalPrices, ({one}) => ({
	nasionalPihpsCommodityItem: one(nasionalPihpsCommodityItems, {
		fields: [nasionalPihpsCommodityRegionalPrices.commodityCode],
		references: [nasionalPihpsCommodityItems.commodityCode]
	}),
}));

export const nasionalPihpsCommodityItemsRelations = relations(nasionalPihpsCommodityItems, ({many}) => ({
	nasionalPihpsCommodityRegionalPrices: many(nasionalPihpsCommodityRegionalPrices),
}));

export const analysisResultTopicsRelations = relations(analysisResultTopics, ({one}) => ({
	analysisResultSummary: one(analysisResultSummaries, {
		fields: [analysisResultTopics.resultSummaryCode],
		references: [analysisResultSummaries.resultSummaryCode]
	}),
}));

export const analysisResultSummariesRelations = relations(analysisResultSummaries, ({one, many}) => ({
	analysisResultTopics: many(analysisResultTopics),
	analysisMainSummary: one(analysisMainSummaries, {
		fields: [analysisResultSummaries.mainSummaryCode],
		references: [analysisMainSummaries.mainSummaryCode]
	}),
	analysisResultNewsLists: many(analysisResultNewsList),
}));

export const analysisIssueListsRelations = relations(analysisIssueLists, ({one}) => ({
	analysisMainSummary: one(analysisMainSummaries, {
		fields: [analysisIssueLists.mainSummaryCode],
		references: [analysisMainSummaries.mainSummaryCode]
	}),
}));

export const analysisMainSummariesRelations = relations(analysisMainSummaries, ({many}) => ({
	analysisIssueLists: many(analysisIssueLists),
	analysisResultSummaries: many(analysisResultSummaries),
	analysisNewsSources: many(analysisNewsSources),
}));

export const analysisResultNewsListRelations = relations(analysisResultNewsList, ({one}) => ({
	analysisResultSummary: one(analysisResultSummaries, {
		fields: [analysisResultNewsList.resultSummaryCode],
		references: [analysisResultSummaries.resultSummaryCode]
	}),
}));

export const analysisNewsSourcesRelations = relations(analysisNewsSources, ({one}) => ({
	analysisMainSummary: one(analysisMainSummaries, {
		fields: [analysisNewsSources.mainSummaryCode],
		references: [analysisMainSummaries.mainSummaryCode]
	}),
}));

export const newsTopicsRelations = relations(newsTopics, ({one}) => ({
	newsItem: one(newsItems, {
		fields: [newsTopics.newsCode],
		references: [newsItems.newsCode]
	}),
}));

export const newsItemsRelations = relations(newsItems, ({many}) => ({
	newsTopics: many(newsTopics),
}));