-- Drop the existing migration table
DROP TABLE IF EXISTS "_prisma_migrations";

-- Recreate the migration table
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

-- Insert the initial migration as completed
INSERT INTO "_prisma_migrations" (
    "migration_name",
    "started_at",
    "finished_at",
    "applied_steps_count",
    "checksum"
) VALUES (
    '20250519110602_init',
    '2025-05-25 08:33:41.322924',
    '2025-05-25 08:33:41.322924',
    1,
    '0000000000000000000000000000000000000000'
); 