import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const PORT = 3000;

// POST /users — create user (body: { email, name })
app.post('/users', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const user = await prisma.user.create({
      data: { email, name },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /tasks — create task (body: { title, description, userId, priority })
app.post('/tasks', async (req, res) => {
  const { title, description, userId, priority } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId are required' });
  }
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: parseInt(userId),
        priority: priority !== undefined ? parseInt(priority) : undefined,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /tasks — list all tasks, supports ?status=todo filter and ?userId=<id> filter
app.get('/tasks', async (req, res) => {
  const { status, userId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = parseInt(userId);

  try {
    const tasks = await prisma.task.findMany({ where });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id — get single task with user included
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /tasks/:id — update task fields (body: any subset of title/description/status/priority)
app.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;
  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = parseInt(priority);

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /tasks/:id — delete task, returns 204
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
