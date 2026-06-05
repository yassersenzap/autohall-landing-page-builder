-- Visual Studio V2 — document Puck isolé (sans impact page_blocks V1)

CREATE TABLE "page_version_studio_documents" (
    "id" UUID NOT NULL,
    "page_version_id" UUID NOT NULL,
    "engine" VARCHAR(40) NOT NULL DEFAULT 'puck',
    "document_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_version_studio_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "page_version_studio_documents_page_version_id_key" ON "page_version_studio_documents"("page_version_id");

CREATE INDEX "page_version_studio_documents_page_version_id_idx" ON "page_version_studio_documents"("page_version_id");

ALTER TABLE "page_version_studio_documents" ADD CONSTRAINT "page_version_studio_documents_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
