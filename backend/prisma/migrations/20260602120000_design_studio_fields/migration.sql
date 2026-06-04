-- Design Studio (GrapesJS) snapshots on page_versions
CREATE TYPE "DesignEngine" AS ENUM ('blocks', 'grapesjs');

ALTER TABLE "page_versions"
  ADD COLUMN "design_engine" "DesignEngine" NOT NULL DEFAULT 'blocks',
  ADD COLUMN "design_project_json" JSONB,
  ADD COLUMN "design_html_snapshot" TEXT,
  ADD COLUMN "design_css_snapshot" TEXT;
