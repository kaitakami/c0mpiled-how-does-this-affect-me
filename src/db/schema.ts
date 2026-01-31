import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ballot tables
export const ballot = pgTable("ballot", {
	id: text("id").primaryKey(),
	state: text("state").notNull(),
	county: text("county").notNull(),
	electionDate: timestamp("election_date").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const measure = pgTable("measure", {
	id: text("id").primaryKey(),
	ballotId: text("ballot_id")
		.notNull()
		.references(() => ballot.id, { onDelete: "cascade" }),
	code: text("code").notNull(),
	title: text("title").notNull(),
	summary: text("summary").notNull(),
	category: text("category").notNull(),
	impactFormula: text("impact_formula"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProfile = pgTable("user_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
	zipCode: text("zip_code").notNull(),
	housingStatus: text("housing_status").notNull(),
	homeValue: integer("home_value"),
	monthlyRent: integer("monthly_rent"),
	incomeRange: text("income_range"),
	jobSector: text("job_sector"),
	householdSize: integer("household_size"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
