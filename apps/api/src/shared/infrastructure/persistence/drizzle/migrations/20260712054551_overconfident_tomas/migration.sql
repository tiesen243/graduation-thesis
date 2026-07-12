CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY,
	"username" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" varchar(255),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
