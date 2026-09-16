import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  schoolEvents,
  schoolMessages,
  schoolSources,
  schoolTasks,
  userProfiles,
  userInstructions,
} from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { google } from "googleapis";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";
import { getAuthenticatedClient } from "../lib/googleOAuth";

const router: IRouter = Router();

const sourceDefaults = [
  ["email", "Email", "Connect", "Connect Gmail to read school emails", "Not connected"],
  ["whatsapp", "WhatsApp", "Connect", "Connect a WhatsApp Web session to read selected school groups", "Not connected"],
  ["calendar", "Calendar", "Connect", "Connect Google Calendar to keep dates in one place", "Not connected"],
  ["classroom", "Classroom", "Connect", "Connect Google Classroom to read school updates", "Not connected"],
] as const;

async function ensureProfile(clerkUserId: string) {
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.clerkUserId, clerkUserId))
    .limit(1);
  if (existing[0]) return;
  await db.insert(userProfiles).values({ clerkUserId });
}

router.post("/family/tasks", requireAuth, async (req, res) => {
  const clerkUserId = (req as AuthenticatedRequest).userId;
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const childId = typeof req.body?.childId === "string" ? req.body.childId.trim() : "user";
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const [task] = await db.insert(schoolTasks).values({
    clerkUserId,
    title,
    kind: typeof req.body.kind === "string" ? req.body.kind : "Homework",
    priority: ["urgent", "important", "normal"].includes(req.body.priority) ? req.body.priority : "normal",
    childId,
    dueDate: typeof req.body.dueDate === "string" && req.body.dueDate ? req.body.dueDate : "Unscheduled",
    dueTime: typeof req.body.dueTime === "string" ? req.body.dueTime : null,
    source: typeof req.body.source === "string" ? req.body.source : "SchoolLife AI",
    items: Array.isArray(req.body.items) ? req.body.items.filter((item: unknown): item is string => typeof item === "string") : [],
  }).returning();
  res.status(201).json({ ...task, id: String(task.id) });
});

router.get("/family", requireAuth, async (req, res) => {
  const clerkUserId = (req as AuthenticatedRequest).userId;
  await ensureProfile(clerkUserId);
  await Promise.all(sourceDefaults.map(([sourceKey, name, status, detail, lastSync]) =>
    db.insert(schoolSources).values({
      clerkUserId,
      sourceKey,
      name,
      status,
      detail,
      lastSync,
    }).onConflictDoUpdate({
      target: [schoolSources.clerkUserId, schoolSources.sourceKey],
      // Preserve live connection status and last-sync metadata from OAuth/sync routes.
      set: { name, updatedAt: new Date() },
    }),
  ));

  const [instructions, tasks, events, messages, sources] = await Promise.all([
    db.select().from(userInstructions).where(eq(userInstructions.clerkUserId, clerkUserId)).limit(1),
    db.select().from(schoolTasks).where(eq(schoolTasks.clerkUserId, clerkUserId)),
    db.select().from(schoolEvents).where(eq(schoolEvents.clerkUserId, clerkUserId)),
    db.select().from(schoolMessages).where(eq(schoolMessages.clerkUserId, clerkUserId)),
    db.select().from(schoolSources).where(eq(schoolSources.clerkUserId, clerkUserId)),
  ]);

  res.json({
    instructions: instructions[0]?.content || "",
    tasks: tasks.map((task) => ({ ...task, id: String(task.id), items: task.items ?? [] })),
    events: events.map((event) => ({ ...event, id: String(event.id) })),
    messages: messages.map((message) => ({
      ...message,
      id: String(message.id),
      source: message.source === "email" ? "Gmail" : message.source === "whatsapp" ? "WhatsApp" : message.source,
    })),
    sources: sources.map((source) => ({ ...source, id: source.sourceKey, groups: source.groups ?? [] })),
  });
});

router.patch("/family/tasks/:id", requireAuth, async (req, res) => {
  const clerkUserId = (req as AuthenticatedRequest).userId;
  const taskId = Number(req.params.id);
  const status = req.body?.status;
  if (!Number.isInteger(taskId) || !["open", "completed"].includes(status)) {
    res.status(400).json({ error: "A valid task id and status are required" });
    return;
  }

  const updated = await db
    .update(schoolTasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(schoolTasks.id, taskId), eq(schoolTasks.clerkUserId, clerkUserId)))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json({ ...updated[0], id: String(updated[0].id) });
});

// Instructions endpoints
router.get("/family/instructions", requireAuth, async (req, res) => {
  const clerkUserId = (req as AuthenticatedRequest).userId;
  const [instructions] = await db
    .select()
    .from(userInstructions)
    .where(eq(userInstructions.clerkUserId, clerkUserId))
    .limit(1);
  res.json({ content: instructions?.content || "" });
});

router.put("/family/instructions", requireAuth, async (req, res) => {
  const clerkUserId = (req as AuthenticatedRequest).userId;
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  
  const [existing] = await db
    .select()
    .from(userInstructions)
    .where(eq(userInstructions.clerkUserId, clerkUserId))
    .limit(1);
  
  if (existing) {
    const [updated] = await db
      .update(userInstructions)
      .set({ content, updatedAt: new Date() })
      .where(eq(userInstructions.clerkUserId, clerkUserId))
      .returning();
    res.json({ content: updated.content });
  } else {
    const [created] = await db
      .insert(userInstructions)
      .values({ clerkUserId, content })
      .returning();
    res.json({ content: created.content });
  }
});

export default router;
