-- Drop the existing migration table if it exists
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Create a new migration table
CREATE TABLE "_prisma_migrations" (
    "id" SERIAL NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Create unique index on migration_name
CREATE UNIQUE INDEX "_prisma_migrations_migration_name_key" ON "_prisma_migrations"("migration_name");

-- Insert all migrations as completed
INSERT INTO "_prisma_migrations" (
    "migration_name",
    "started_at",
    "finished_at",
    "applied_steps_count",
    "checksum"
) VALUES 
    ('20250519110602_init', '2025-05-25 08:33:41.322924', '2025-05-25 08:33:41.322924', 1, '0000000000000000000000000000000000000000'),
    ('20240320000003_init', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000004_add_teams', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000005_fix_failed_migration', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000006_fix_production', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000007_fix_failed_state', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000008_reset_migration_state', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000009_consolidate_migrations', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000010_fix_railway', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'),
    ('20240320000011_fix_failed_migration_state', NOW(), NOW(), 1, '0000000000000000000000000000000000000000'); 