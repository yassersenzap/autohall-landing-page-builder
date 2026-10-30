-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SI_DIGITAL', 'MARKETER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LandingPageStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExportJobStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "LeadEventStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'SYNCED', 'FAILED', 'PENDING_RETRY', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "LeadRequestType" AS ENUM ('TEST_DRIVE', 'CONTACT', 'OFFER_REQUEST', 'SERVICE_REQUEST', 'CALLBACK');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('FULL_NAME', 'PHONE', 'EMAIL', 'CITY', 'BRAND', 'MODEL', 'MESSAGE', 'TEXT', 'TEXTAREA', 'SELECT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MARKETER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100),
    "campaign_type" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "status" "LandingPageStatus" NOT NULL DEFAULT 'DRAFT',
    "public_base_url" VARCHAR(255),
    "last_exported_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_versions" (
    "id" UUID NOT NULL,
    "landing_page_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "label" VARCHAR(120),
    "status" "PageVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "theme_json" JSONB,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_blocks" (
    "id" UUID NOT NULL,
    "page_version_id" UUID NOT NULL,
    "block_key" VARCHAR(80) NOT NULL,
    "block_type" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "props_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" UUID NOT NULL,
    "page_version_id" UUID NOT NULL,
    "request_type" "LeadRequestType" NOT NULL,
    "title" VARCHAR(180),
    "subtitle" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" UUID NOT NULL,
    "form_id" UUID NOT NULL,
    "field_key" VARCHAR(80) NOT NULL,
    "field_type" "FormFieldType" NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "placeholder" VARCHAR(180),
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "options_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_assets" (
    "id" UUID NOT NULL,
    "landing_page_id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "stored_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "public_path" VARCHAR(500),
    "alt_text" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_page_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" UUID NOT NULL,
    "landing_page_id" UUID NOT NULL,
    "generated_by" UUID NOT NULL,
    "zip_filename" VARCHAR(255) NOT NULL,
    "zip_path" VARCHAR(500) NOT NULL,
    "checksum" VARCHAR(128),
    "status" "ExportJobStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_events" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "landing_page_id" UUID NOT NULL,
    "full_name" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(180),
    "city" VARCHAR(100),
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "request_type" "LeadRequestType" NOT NULL,
    "message" TEXT,
    "source_url" VARCHAR(500) NOT NULL,
    "user_agent" TEXT,
    "ip_address" VARCHAR(80),
    "raw_payload" JSONB NOT NULL,
    "status" "LeadEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "sync_destination" VARCHAR(80),
    "sync_error" TEXT,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulated_testdrive" (
    "id" UUID NOT NULL,
    "lead_event_id" UUID NOT NULL,
    "full_name" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(180),
    "city" VARCHAR(100),
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "preferred_date" DATE,
    "source_campaign" VARCHAR(180),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulated_testdrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulated_contacts" (
    "id" UUID NOT NULL,
    "lead_event_id" UUID NOT NULL,
    "full_name" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(180),
    "city" VARCHAR(100),
    "subject" VARCHAR(180),
    "message" TEXT,
    "source_campaign" VARCHAR(180),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulated_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "entity_type" VARCHAR(80),
    "entity_id" UUID,
    "ip_address" VARCHAR(80),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_created_by_idx" ON "campaigns"("created_by");

-- CreateIndex
CREATE INDEX "campaigns_created_at_idx" ON "campaigns"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_campaign_id_idx" ON "landing_pages"("campaign_id");

-- CreateIndex
CREATE INDEX "landing_pages_status_idx" ON "landing_pages"("status");

-- CreateIndex
CREATE INDEX "landing_pages_created_at_idx" ON "landing_pages"("created_at");

-- CreateIndex
CREATE INDEX "page_versions_landing_page_id_idx" ON "page_versions"("landing_page_id");

-- CreateIndex
CREATE INDEX "page_versions_status_idx" ON "page_versions"("status");

-- CreateIndex
CREATE INDEX "page_versions_created_at_idx" ON "page_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "page_versions_landing_page_id_version_number_key" ON "page_versions"("landing_page_id", "version_number");

-- CreateIndex
CREATE INDEX "page_blocks_page_version_id_idx" ON "page_blocks"("page_version_id");

-- CreateIndex
CREATE INDEX "page_blocks_page_version_id_sort_order_idx" ON "page_blocks"("page_version_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "page_blocks_page_version_id_block_key_key" ON "page_blocks"("page_version_id", "block_key");

-- CreateIndex
CREATE UNIQUE INDEX "forms_page_version_id_key" ON "forms"("page_version_id");

-- CreateIndex
CREATE INDEX "form_fields_form_id_idx" ON "form_fields"("form_id");

-- CreateIndex
CREATE INDEX "form_fields_form_id_sort_order_idx" ON "form_fields"("form_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "form_fields_form_id_field_key_key" ON "form_fields"("form_id", "field_key");

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_assets_stored_name_key" ON "landing_page_assets"("stored_name");

-- CreateIndex
CREATE INDEX "landing_page_assets_landing_page_id_idx" ON "landing_page_assets"("landing_page_id");

-- CreateIndex
CREATE INDEX "export_jobs_landing_page_id_idx" ON "export_jobs"("landing_page_id");

-- CreateIndex
CREATE INDEX "export_jobs_status_idx" ON "export_jobs"("status");

-- CreateIndex
CREATE INDEX "export_jobs_created_at_idx" ON "export_jobs"("created_at");

-- CreateIndex
CREATE INDEX "lead_events_campaign_id_idx" ON "lead_events"("campaign_id");

-- CreateIndex
CREATE INDEX "lead_events_landing_page_id_idx" ON "lead_events"("landing_page_id");

-- CreateIndex
CREATE INDEX "lead_events_status_idx" ON "lead_events"("status");

-- CreateIndex
CREATE INDEX "lead_events_email_idx" ON "lead_events"("email");

-- CreateIndex
CREATE INDEX "lead_events_created_at_idx" ON "lead_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "simulated_testdrive_lead_event_id_key" ON "simulated_testdrive"("lead_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulated_contacts_lead_event_id_key" ON "simulated_contacts"("lead_event_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_assets" ADD CONSTRAINT "landing_page_assets_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulated_testdrive" ADD CONSTRAINT "simulated_testdrive_lead_event_id_fkey" FOREIGN KEY ("lead_event_id") REFERENCES "lead_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulated_contacts" ADD CONSTRAINT "simulated_contacts_lead_event_id_fkey" FOREIGN KEY ("lead_event_id") REFERENCES "lead_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
