-- First, check if the migration table exists
DO $$ 
BEGIN
    -- If the migration table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
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

        CREATE UNIQUE INDEX "_prisma_migrations_migration_name_key" ON "_prisma_migrations"("migration_name");
    END IF;

    -- Update the failed migration to mark it as completed
    UPDATE "_prisma_migrations"
    SET "finished_at" = NOW(),
        "applied_steps_count" = 1,
        "rolled_back_at" = NULL
    WHERE "migration_name" = '20250519110602_init'
    AND "finished_at" IS NULL;

    -- If the migration doesn't exist in the table, insert it
    IF NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations"
        WHERE "migration_name" = '20250519110602_init'
    ) THEN
        INSERT INTO "_prisma_migrations" (
            "migration_name",
            "started_at",
            "finished_at",
            "applied_steps_count",
            "checksum"
        ) VALUES (
            '20250519110602_init',
            '2025-05-25 08:33:41.322924',
            NOW(),
            1,
            '0000000000000000000000000000000000000000'
        );
    END IF;
END $$; 