-- Remove a policy de SELECT atual
DROP POLICY IF EXISTS "admin_read_school_audit" ON school_audit_log;

-- Recria com subquery direta na tabela schools
CREATE POLICY "admin_read_school_audit"
ON school_audit_log FOR SELECT
USING (
  (SELECT is_admin FROM schools WHERE id = auth.uid()) = true
);