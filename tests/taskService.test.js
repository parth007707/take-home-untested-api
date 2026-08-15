const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = taskService.create({
        title: 'Write tests',
      });

      expect(task).toMatchObject({
        title: 'Write tests',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
      });

      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
    });
  });

  describe('findById', () => {
    test('returns a task when the id exists', () => {
      const created = taskService.create({
        title: 'Find me',
      });

      expect(taskService.findById(created.id)).toEqual(created);
    });

    test('returns undefined for an unknown id', () => {
      expect(
        taskService.findById('does-not-exist')
      ).toBeUndefined();
    });
  });

  describe('getAll', () => {
    test('returns all created tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      expect(taskService.getAll()).toHaveLength(2);
    });
  });

  describe('getByStatus', () => {
    test('returns tasks matching the status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      expect(taskService.getByStatus('todo')).toHaveLength(1);
      expect(
        taskService.getByStatus('todo')[0].title
      ).toBe('Todo task');
    });

    test('only returns tasks with an exact matching status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'In progress task',
        status: 'in_progress',
      });

      const result = taskService.getByStatus('todo');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('todo');
    });
  });

  describe('getPaginated', () => {
    test('returns the requested page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const result = taskService.getPaginated(1, 2);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });

    test('returns an empty array when the page is beyond the data', () => {
      taskService.create({ title: 'Task 1' });

      expect(
        taskService.getPaginated(10, 2)
      ).toEqual([]);
    });

    test('page 1 returns the first page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const result = taskService.getPaginated(1, 2);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });
  });

  describe('getStats', () => {
    test('returns counts by status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'In progress task',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
    });

    test('counts overdue unfinished tasks', () => {
      taskService.create({
        title: 'Overdue task',
        dueDate: '2020-01-01T00:00:00.000Z',
        status: 'todo',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });

    test('does not count completed overdue tasks as overdue', () => {
      taskService.create({
        title: 'Completed overdue task',
        dueDate: '2020-01-01T00:00:00.000Z',
        status: 'done',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(0);
    });
  });

  describe('update', () => {
    test('updates an existing task', () => {
      const task = taskService.create({
        title: 'Old title',
      });

      const updated = taskService.update(task.id, {
        title: 'New title',
      });

      expect(updated.title).toBe('New title');
      expect(
        taskService.findById(task.id).title
      ).toBe('New title');
    });

    test('returns null for an unknown id', () => {
      expect(
        taskService.update('does-not-exist', {
          title: 'New title',
        })
      ).toBeNull();
    });
  });

  describe('remove', () => {
    test('removes an existing task', () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      expect(
        taskService.remove(task.id)
      ).toBe(true);

      expect(
        taskService.findById(task.id)
      ).toBeUndefined();
    });

    test('returns false for an unknown id', () => {
      expect(
        taskService.remove('does-not-exist')
      ).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('marks a task as done', () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe('done');
      expect(completed.completedAt).toBeDefined();
    });

    test('returns null for an unknown id', () => {
      expect(
        taskService.completeTask('does-not-exist')
      ).toBeNull();
    });
  });
});