-- V6__notifications_audit_logs.sql

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    body TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    channels VARCHAR(60) NOT NULL DEFAULT 'IN_APP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_id VARCHAR(80),
    performed_by VARCHAR(120) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
