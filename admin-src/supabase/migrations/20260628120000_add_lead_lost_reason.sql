-- Tracks why a lead was marked Lost, captured either from the lead form
-- or the Kanban "mark as lost" prompt when dragging a card into Lost.

alter table public.leads add column lost_reason text;
