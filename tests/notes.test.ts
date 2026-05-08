import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, resetNotes } from '../server';

describe('Notes API', () => {
  beforeEach(() => {
    resetNotes();
  });

  it('GET /health → returns { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/notes → returns 200 and empty array initially', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('POST /api/notes → creates a note and returns 201 with default status and folder', async () => {
    const newNote = {
      title: 'Test Note',
      body: 'This is a test note body',
      important: true,
      folder: 'Work'
    };
    const res = await request(app)
      .post('/api/notes')
      .send(newNote);
    
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(newNote.title);
    expect(res.body.folder).toBe('Work');
    expect(res.body.status).toBe('active');
    expect(res.body.id).toBeDefined();
  });

  it('PATCH /api/notes/:id → can archive a note', async () => {
    const createRes = await request(app)
      .post('/api/notes')
      .send({ title: 'To Archive', body: '...' });
    
    const id = createRes.body.id;
    const patchRes = await request(app)
      .patch(`/api/notes/${id}`)
      .send({ status: 'archived' });
    
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('archived');
  });

  it('DELETE /api/notes/:id → deletes note and returns 200', async () => {
    // First create a note
    const createRes = await request(app)
      .post('/api/notes')
      .send({ title: 'To Delete', body: 'Will be deleted' });
    
    const id = createRes.body.id;

    // Then delete it
    const deleteRes = await request(app).delete(`/api/notes/${id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Note deleted permanently');

    // Verify it's gone
    const getRes = await request(app).get('/api/notes');
    expect(getRes.body.length).toBe(0);
  });
});
