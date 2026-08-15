const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Tasks API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  // ============================================================
  // GET /tasks
  // ============================================================

  describe('GET /tasks', () => {
    test('returns an empty task list initially', async () => {
      const response = await request(app)
        .get('/tasks');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // ============================================================
  // POST /tasks
  // ============================================================

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Write tests',
          description: 'Write API tests',
          priority: 'high',
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toMatchObject({
        title: 'Write tests',
        description: 'Write API tests',
        status: 'todo',
        priority: 'high',
        dueDate: null,
        completedAt: null,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    test('rejects a task without a title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          description: 'No title',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  // ============================================================
  // GET /tasks/:id
  // ============================================================

  describe('GET /tasks/:id', () => {
    test('returns a created task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Find this task',
        });

      const response = await request(app)
        .get(`/tasks/${created.body.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(created.body.id);
      expect(response.body.title).toBe('Find this task');
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .get('/tasks/does-not-exist');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  // ============================================================
  // PUT /tasks/:id
  // ============================================================

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Original title',
        });

      const response = await request(app)
        .put(`/tasks/${created.body.id}`)
        .send({
          title: 'Updated title',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(created.body.id);
      expect(response.body.title).toBe('Updated title');
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .put('/tasks/does-not-exist')
        .send({
          title: 'Updated title',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  // ============================================================
  // PATCH /tasks/:id/assign
  // NEW FEATURE
  // ============================================================

  describe('PATCH /tasks/:id/assign', () => {
    test('assigns a task to a valid assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign this task',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: 'John',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(created.body.id);
      expect(response.body.assignee).toBe('John');
    });

    test('trims whitespace from the assignee name', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign this task',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: '  John  ',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.assignee).toBe('John');
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/assign')
        .send({
          assignee: 'John',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('rejects a missing assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign this task',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('rejects an empty assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign this task',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: '   ',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('rejects a non-string assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign this task',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: 123,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('returns 409 when the task is already assigned', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Already assigned task',
        });

      const firstAssignment = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: 'John',
        });

      expect(firstAssignment.statusCode).toBe(200);

      const secondAssignment = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({
          assignee: 'Sarah',
        });

      expect(secondAssignment.statusCode).toBe(409);
      expect(secondAssignment.body.error).toBe('Task is already assigned');
    });
  });

  // ============================================================
  // DELETE /tasks/:id
  // ============================================================

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Delete me',
        });

      const response = await request(app)
        .delete(`/tasks/${created.body.id}`);

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app)
        .get(`/tasks/${created.body.id}`);

      expect(getResponse.statusCode).toBe(404);
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .delete('/tasks/does-not-exist');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  // ============================================================
  // PATCH /tasks/:id/complete
  // ============================================================

  describe('PATCH /tasks/:id/complete', () => {
    test('marks an existing task as complete', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Complete me',
          priority: 'high',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/complete`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toBeDefined();
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/complete');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  // ============================================================
  // GET /tasks/stats
  // ============================================================

  describe('GET /tasks/stats', () => {
    test('returns task statistics', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo task',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'In progress task',
          status: 'in_progress',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done task',
          status: 'done',
        });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        todo: 1,
        in_progress: 1,
        done: 1,
      });

      expect(response.body.overdue).toBeDefined();
    });
  });

  // ============================================================
  // GET /tasks with filters
  // ============================================================

  describe('GET /tasks with filters', () => {
    test('filters tasks by status', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo task',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done task',
          status: 'done',
        });

      const response = await request(app)
        .get('/tasks?status=todo');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo task');
      expect(response.body[0].status).toBe('todo');
    });
  });
});