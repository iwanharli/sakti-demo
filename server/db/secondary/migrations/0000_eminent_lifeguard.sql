-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "nasional_raw_apbn_data" (
	"id" bigserial NOT NULL,
	"report_year" integer NOT NULL,
	"category" varchar(64) DEFAULT 'pendapatan negara',
	"value" numeric(18, 2) NOT NULL,
	"unit" varchar(32) DEFAULT 'triliun rupiah' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_pihps_commodity_items" (
	"id" bigserial NOT NULL,
	"commodity_code" varchar(128) NOT NULL,
	"commodity_name" varchar(255) NOT NULL,
	"commodity_unit" varchar(50) DEFAULT 'Rp./Kg' NOT NULL,
	"tree_id" varchar(100) NOT NULL,
	"parent_id" varchar(100) DEFAULT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_pihps_commodity_regional_prices" (
	"id" bigserial NOT NULL,
	"market_type" varchar(50) NOT NULL,
	"commodity_code" varchar(128) NOT NULL,
	"region_code" varchar(50) NOT NULL,
	"region_name" varchar(255) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"report_date" date NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"gap_price" numeric(15, 2),
	"gap_percentage" numeric(8, 2),
	"gap_change" varchar(10),
	"additional_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_kamtibmas_case_data" (
	"id" bigserial NOT NULL,
	"report_year" integer DEFAULT 2026 NOT NULL,
	"report_month" integer DEFAULT 1 NOT NULL,
	"report_date" date NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"polda_name" varchar(100) NOT NULL,
	"category" varchar(128) DEFAULT 'kejahatan' NOT NULL,
	"sub_category" varchar(128) DEFAULT 'kejahatan' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_kamtibmas_unjuk_rasa_data" (
	"id" bigserial NOT NULL,
	"report_year" integer DEFAULT 2026 NOT NULL,
	"report_month" integer DEFAULT 1 NOT NULL,
	"report_date" date NOT NULL,
	"region_code" varchar(8) NOT NULL,
	"polda_name" varchar(100) NOT NULL,
	"category" varchar(128) DEFAULT 'total_unjuk_rasa' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "region_indonesia_provinces" (
	"region_code" varchar(4) NOT NULL,
	"region_name" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculation_index_risiko" (
	"id" bigserial NOT NULL,
	"report_date" date NOT NULL,
	"category" varchar(64) NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"value" double precision NOT NULL,
	"additional_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_raw_ump_data" (
	"id" bigserial NOT NULL,
	"report_year" integer NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"region_name" varchar(100) NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"gap_percentage" numeric(10, 4)
);
--> statement-breakpoint
CREATE TABLE "nasional_trading_economic_data" (
	"id" bigserial NOT NULL,
	"country" varchar(128) NOT NULL,
	"category" varchar(256) NOT NULL,
	"report_date" date NOT NULL,
	"report_year" integer,
	"report_month" integer,
	"value" numeric(18, 4) NOT NULL,
	"frequency" varchar(64),
	"historical_data_symbol" varchar(128),
	"data_last_update" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_bps_inflation_ihk_data" (
	"id" bigserial NOT NULL,
	"country" varchar(64) DEFAULT 'indonesia' NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_ojk_twp90_data" (
	"id" bigserial NOT NULL,
	"country" varchar(64) DEFAULT 'indonesia' NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"value" numeric(20, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_commodity_regional_prices" (
	"id" bigserial NOT NULL,
	"commodity_code" varchar(64) NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"report_date" date NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"price" numeric(18, 2) NOT NULL,
	"additional_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_result_topics" (
	"id" bigserial NOT NULL,
	"result_summary_code" varchar(64) NOT NULL,
	"topic_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"region_code" varchar(20),
	"report_date" date
);
--> statement-breakpoint
CREATE TABLE "nasional_raw_population_data" (
	"id" bigserial NOT NULL,
	"country" varchar(64) DEFAULT 'Indonesia' NOT NULL,
	"report_year" integer DEFAULT 2020 NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_commodity_sp2kp" (
	"id" bigserial NOT NULL,
	"commodity_code" varchar(64) NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"report_date" date NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"price" numeric(18, 2) NOT NULL,
	"additional_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculation_commodity_deviation" (
	"id" bigserial NOT NULL,
	"source_code" varchar(50) DEFAULT 'badanpangan',
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"report_date" date NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"region_name" varchar(100) NOT NULL,
	"commodity_code" varchar(50) NOT NULL,
	"today_price" numeric(15, 2) NOT NULL,
	"p80_percentage" numeric(6, 2),
	"p95_percentage" numeric(6, 2),
	"deviasi_percentage" numeric(6, 2),
	"deviation_percentage_positive" numeric(6, 2) DEFAULT '0' NOT NULL,
	"report_status" varchar(20) DEFAULT 'normal',
	"additional_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nasional_bmkg_weather_by_city" (
	"id" bigserial NOT NULL,
	"region_code" varchar(20),
	"region_name" varchar(100),
	"city_code" varchar(20),
	"city_name" varchar(100),
	"report_year" integer,
	"report_month" integer,
	"report_date" date,
	"condition" varchar(100),
	"temp_average" numeric,
	"humidity_average" numeric,
	"additional_data" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "news_items" (
	"id" bigserial NOT NULL,
	"news_code" varchar(64) NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"news_date" date NOT NULL,
	"news_domain" varchar(255),
	"news_url" varchar(550),
	"news_title" varchar(500) NOT NULL,
	"news_snippet" varchar(1000),
	"news_content" text NOT NULL,
	"news_enclosure" jsonb,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"news_sentiment" varchar(16),
	"news_id" bigint
);
--> statement-breakpoint
CREATE TABLE "analysis_issue_lists" (
	"id" bigserial NOT NULL,
	"main_summary_code" varchar(64) NOT NULL,
	"issue_name" varchar(255) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"region_code" varchar(20),
	"report_date" date,
	"news_idx" jsonb
);
--> statement-breakpoint
CREATE TABLE "statistic_general" (
	"id" bigserial NOT NULL,
	"label" varchar(100) NOT NULL,
	"tag" varchar(255),
	"name" varchar(255) NOT NULL,
	"value" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculation_commodity_baseline_prev_year" (
	"id" bigserial NOT NULL,
	"source_code" varchar(50) DEFAULT 'badanpangan',
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"report_date" date NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"region_name" varchar(100) NOT NULL,
	"commodity_code" varchar(50) NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"baseline_price" numeric(15, 2) NOT NULL,
	"deviation_percentage" numeric(6, 2) NOT NULL,
	"deviation_percentage_positive" numeric(6, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_ihsg_update_minutes" (
	"id" serial NOT NULL,
	"spot_date" date NOT NULL,
	"spot_hour" smallint NOT NULL,
	"spot_minute" smallint NOT NULL,
	"spot_price" numeric(20, 8),
	"open_price" numeric(20, 8),
	"close_price" numeric(20, 8),
	"gap_price" numeric(20, 8),
	"gap_percentage" numeric(10, 4),
	"gap_change" varchar(10),
	"unit" varchar(50) DEFAULT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "queue_engine_n8n_fetcher" (
	"id" bigserial NOT NULL,
	"queue_code" varchar(255) NOT NULL,
	"parameter" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistic_region_date" (
	"id" bigserial NOT NULL,
	"statistic_date" date NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"label" varchar(100) NOT NULL,
	"tag" varchar(255),
	"name" varchar(255) NOT NULL,
	"value" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_main_summaries" (
	"id" bigserial NOT NULL,
	"main_summary_code" varchar(64) NOT NULL,
	"report_date" date NOT NULL,
	"region_code" varchar(20) NOT NULL,
	"region_name" varchar(255),
	"average_score" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_result_summaries" (
	"id" bigserial NOT NULL,
	"result_summary_code" varchar(64) NOT NULL,
	"main_summary_code" varchar(64) NOT NULL,
	"issue_summary" text NOT NULL,
	"impact_analysis" jsonb NOT NULL,
	"recommendation_analysis" jsonb NOT NULL,
	"significance_score" integer DEFAULT 1 NOT NULL,
	"significance_scale" varchar(20) DEFAULT 'sedang' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"region_code" varchar(20),
	"report_date" date,
	"title" varchar,
	"issue_title" varchar,
	"percentage" numeric(5, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "analysis_result_news_list" (
	"id" bigserial NOT NULL,
	"result_summary_code" varchar(64) NOT NULL,
	"news_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"region_code" varchar(20),
	"report_date" date
);
--> statement-breakpoint
CREATE TABLE "nasional_commodity_monthly_prices" (
	"id" serial NOT NULL,
	"commodity_code" varchar(255),
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"price" numeric(15, 2),
	"additional_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nasional_commodity_daily_prices" (
	"id" serial NOT NULL,
	"commodity_code" varchar(255),
	"today_date" date NOT NULL,
	"today_price" numeric(15, 2),
	"yesterday_date" date,
	"yesterday_price" numeric(15, 2),
	"gap_price" numeric(15, 2),
	"gap_percentage" numeric(5, 2),
	"gap_change" varchar(20),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_currency_update_minutes" (
	"id" serial NOT NULL,
	"spot_date" date NOT NULL,
	"spot_hour" smallint NOT NULL,
	"spot_minute" smallint NOT NULL,
	"spot_price" numeric(20, 8),
	"open_price" numeric(20, 8),
	"close_price" numeric(20, 8),
	"gap_price" numeric(20, 8),
	"gap_percentage" numeric(10, 4),
	"gap_change" varchar(10) NOT NULL,
	"unit" varchar(50) DEFAULT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "nasional_commodity_items" (
	"id" serial NOT NULL,
	"commodity_code" varchar(255) NOT NULL,
	"commodity_name" varchar(255) NOT NULL,
	"commodity_unit" varchar(50),
	"reference_price" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"bpid" varchar,
	"source" varchar(64) DEFAULT 'badanpangan' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_news_sources" (
	"id" bigserial NOT NULL,
	"main_summary_code" varchar(64) NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"source_type" varchar(255) DEFAULT 'rss',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"region_code" varchar(20),
	"report_date" date
);
--> statement-breakpoint
CREATE TABLE "news_topics" (
	"id" bigserial NOT NULL,
	"news_code" varchar(64) NOT NULL,
	"topic_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_brent_oil_update_minutes" (
	"id" serial NOT NULL,
	"spot_date" date NOT NULL,
	"spot_hour" smallint NOT NULL,
	"spot_minute" smallint NOT NULL,
	"spot_price" numeric(20, 8),
	"open_price" numeric(20, 8),
	"close_price" numeric(20, 8),
	"gap_price" numeric(20, 8),
	"gap_percentage" numeric(10, 4),
	"gap_change" varchar(10),
	"unit" varchar(50) DEFAULT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "nasional_bps_unemployed_data" (
	"id" bigserial NOT NULL,
	"report_year" integer NOT NULL,
	"report_month" integer NOT NULL,
	"region_code" varchar(32) NOT NULL,
	"region_name" varchar(128) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'persen',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nasional_pihps_commodity_regional_prices" ADD CONSTRAINT "fk_pihps_regional_price_commodity" FOREIGN KEY ("commodity_code") REFERENCES "public"."nasional_pihps_commodity_items"("commodity_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "analysis_result_topics" ADD CONSTRAINT "fk_analysis_result_topics_summary" FOREIGN KEY ("result_summary_code") REFERENCES "public"."analysis_result_summaries"("result_summary_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "analysis_issue_lists" ADD CONSTRAINT "fk_analysis_issue_lists_summary" FOREIGN KEY ("main_summary_code") REFERENCES "public"."analysis_main_summaries"("main_summary_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "analysis_result_summaries" ADD CONSTRAINT "fk_analysis_result_summaries_summary" FOREIGN KEY ("main_summary_code") REFERENCES "public"."analysis_main_summaries"("main_summary_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "analysis_result_news_list" ADD CONSTRAINT "fk_analysis_result_news_list_summary" FOREIGN KEY ("result_summary_code") REFERENCES "public"."analysis_result_summaries"("result_summary_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "analysis_news_sources" ADD CONSTRAINT "fk_analysis_news_sources_summary" FOREIGN KEY ("main_summary_code") REFERENCES "public"."analysis_main_summaries"("main_summary_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_topics" ADD CONSTRAINT "fk_news_topics_news" FOREIGN KEY ("news_code") REFERENCES "public"."news_items"("news_code") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_nasional_ump_year_region" ON "nasional_raw_ump_data" USING btree ("report_year" int4_ops,"region_code" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_result_topics_region_date" ON "analysis_result_topics" USING btree ("report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_result_topics_summary_region_date" ON "analysis_result_topics" USING btree ("result_summary_code" date_ops,"report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_analysis_result_topics_summary_topic" ON "analysis_result_topics" USING btree ("result_summary_code" text_ops,"topic_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_nasional_raw_population_upsert_key" ON "nasional_raw_population_data" USING btree ("country" int4_ops,"report_year" int4_ops,"region_code" int4_ops,"category" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_deviation_upsert_key" ON "calculation_commodity_deviation" USING btree ("source_code" date_ops,"region_code" date_ops,"commodity_code" date_ops,"report_date" date_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "nasional_bmkg_weather_by_city_unique_idx" ON "nasional_bmkg_weather_by_city" USING btree ("region_code" int4_ops,"city_code" int4_ops,"report_year" int4_ops,"report_month" int4_ops,"report_date" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_news_items_date_region" ON "news_items" USING btree ("news_date" date_ops,"region_code" date_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_issue_lists_region_date" ON "analysis_issue_lists" USING btree ("report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_issue_lists_summary_region_date" ON "analysis_issue_lists" USING btree ("main_summary_code" date_ops,"report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_analysis_issue_lists_summary_issue" ON "analysis_issue_lists" USING btree ("main_summary_code" text_ops,"issue_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_statistic_general_label_tag_name" ON "statistic_general" USING btree ("label" text_ops,"tag" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_baseline_upsert_key" ON "calculation_commodity_baseline_prev_year" USING btree ("source_code" date_ops,"report_date" date_ops,"region_code" date_ops,"commodity_code" date_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_statistic_region_date_label_tag_name" ON "statistic_region_date" USING btree ("statistic_date" date_ops,"region_code" date_ops,"label" date_ops,"tag" date_ops,"name" date_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_analysis_main_summaries_date_region" ON "analysis_main_summaries" USING btree ("report_date" date_ops,"region_code" date_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_result_summaries_main" ON "analysis_result_summaries" USING btree ("main_summary_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_result_summaries_region_date" ON "analysis_result_summaries" USING btree ("report_date" date_ops,"region_code" date_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_result_summaries_summary_region_date" ON "analysis_result_summaries" USING btree ("main_summary_code" date_ops,"report_date" date_ops,"region_code" date_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_nasional_commodity_items_commodity_source" ON "nasional_commodity_items" USING btree ("commodity_code" text_ops,"source" text_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_news_sources_region_date" ON "analysis_news_sources" USING btree ("report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_analysis_news_sources_summary_region_date" ON "analysis_news_sources" USING btree ("main_summary_code" date_ops,"report_date" date_ops,"region_code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_analysis_news_sources_summary_source" ON "analysis_news_sources" USING btree ("main_summary_code" text_ops,"source_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_news_topics_topic" ON "news_topics" USING btree ("topic_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_news_topics_news_topic" ON "news_topics" USING btree ("news_code" text_ops,"topic_name" text_ops);
*/