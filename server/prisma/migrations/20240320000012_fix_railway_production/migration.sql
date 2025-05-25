-- Start a transaction
BEGIN;

-- Try to update the failed migration
DO $$ 
BEGIN
    -- If the migration table exists, try to update the failed migration
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
        -- Update the failed migration to mark it as completed
        UPDATE "_prisma_migrations"
        SET "finished_at" = NOW(),
            "applied_steps_count" = 1,
            "rolled_back_at" = NULL
        WHERE "migration_name" = '20250519110602_init'
        AND "finished_at" IS NULL;

        -- If no rows were updated, insert the migration
        IF NOT FOUND THEN
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
    ELSE
        -- If the migration table doesn't exist, create it and insert the migration
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
EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs, rollback the transaction
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE;
END $$;

-- Commit the transaction
COMMIT; 