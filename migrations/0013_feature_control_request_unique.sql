-- Forward repair for a partial auto-reconciliation that removed the unique
-- request constraint. Preserve all encrypted audit rows and immutable triggers.
-- Duplicate data must fail this migration; never delete/truncate to force it.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.feature_control_audit'::regclass
    AND conname='feature_control_audit_request' AND contype='u') THEN
    ALTER TABLE public.feature_control_audit ADD CONSTRAINT feature_control_audit_request
      UNIQUE (service_id, environment, request_id);
  END IF;
END $$;
