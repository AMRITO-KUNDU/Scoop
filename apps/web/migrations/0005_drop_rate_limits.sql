-- The per-user spend guard on AI extraction is gone, so its counter table goes
-- with it. 0004 is deleted rather than rewritten (it may already be applied
-- somewhere); this drops the table on any database that ran it.
drop table if exists rate_limits;
