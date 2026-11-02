const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --------------- Session store ---------------
const sessions = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return sessions.has(code) ? generateCode() : code;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function avatarColor(index) {
  const palette = ['#1D4E3E', '#D94040', '#C5952B', '#7A756C', '#4A4540'];
  return palette[index % palette.length];
}

// Secret Santa draw: circular derangement
function drawSecretSanta(participants) {
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const assignments = {};
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    assignments[giver.id] = {
      id: receiver.id,
      name: receiver.name,
      giftIdea: receiver.giftIdea || null,
      budget: receiver.budget || null,
    };
  }
  return assignments;
}

// --------------- Socket.io ---------------
io.on('connection', (socket) => {

  socket.on('create-session', ({ organizerName, sessionName, budget }, cb) => {
    const code = generateCode();
    const organizerId = generateId();
    const session = {
      code,
      name: sessionName,
      budget: budget || null,
      organizerId,
      participants: [{
        id: organizerId,
        name: organizerName,
        giftIdea: null,
        budget: budget || null,
        mode: 'connected',
        color: avatarColor(0),
        socketId: socket.id,
        isOrganizer: true,
      }],
      status: 'waiting',
      assignments: null,
    };
    sessions.set(code, session);
    socket.join(code);
    socket.data = { code, participantId: organizerId };
    cb({ ok: true, code, session: sanitizeSession(session), participantId: organizerId });
  });

  socket.on('join-session', ({ code, name, giftIdea }, cb) => {
    const session = sessions.get(code.toUpperCase());
    if (!session) return cb({ ok: false, error: 'Session introuvable' });
    if (session.status === 'drawn') return cb({ ok: false, error: 'Le tirage a déjà eu lieu' });
    const existing = session.participants.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) return cb({ ok: false, error: 'Ce prénom est déjà pris' });

    const participant = {
      id: generateId(),
      name,
      giftIdea: giftIdea || null,
      budget: null,
      mode: 'connected',
      color: avatarColor(session.participants.length),
      socketId: socket.id,
      isOrganizer: false,
    };
    session.participants.push(participant);
    socket.join(code);
    socket.data = { code, participantId: participant.id };
    io.to(code).emit('participants-updated', { participants: sanitizeParticipants(session) });
    cb({ ok: true, participantId: participant.id, session: sanitizeSession(session) });
  });

  socket.on('add-manual', ({ code, name, giftIdea }, cb) => {
    const session = sessions.get(code);
    if (!session) return cb({ ok: false, error: 'Session introuvable' });
    if (session.status === 'drawn') return cb({ ok: false, error: 'Le tirage a déjà eu lieu' });
    const existing = session.participants.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) return cb({ ok: false, error: 'Ce prénom est déjà pris' });

    const participant = {
      id: generateId(),
      name,
      giftIdea: giftIdea || null,
      budget: null,
      mode: 'manual',
      color: avatarColor(session.participants.length),
      socketId: null,
      isOrganizer: false,
    };
    session.participants.push(participant);
    io.to(code).emit('participants-updated', { participants: sanitizeParticipants(session) });
    cb({ ok: true, participant: sanitizeParticipant(participant) });
  });

  socket.on('remove-participant', ({ code, participantId }, cb) => {
    const session = sessions.get(code);
    if (!session) return cb({ ok: false });
    session.participants = session.participants.filter(p => p.id !== participantId);
    io.to(code).emit('participants-updated', { participants: sanitizeParticipants(session) });
    cb({ ok: true });
  });

  socket.on('launch-draw', ({ code }, cb) => {
    const session = sessions.get(code);
    if (!session) return cb({ ok: false, error: 'Session introuvable' });
    if (session.participants.length < 3) return cb({ ok: false, error: 'Il faut au moins 3 participants' });
    if (session.status === 'drawn') return cb({ ok: false, error: 'Déjà tiré' });

    session.assignments = drawSecretSanta(session.participants);
    session.status = 'drawn';

    const manualParticipants = session.participants
      .filter(p => p.mode === 'manual')
      .map(p => ({ id: p.id, name: p.name, color: p.color }));

    // Notify connected participants
    session.participants.forEach(p => {
      if (p.mode === 'connected' && p.socketId) {
        const assignment = session.assignments[p.id];
        io.to(p.socketId).emit('draw-result', { assignment });
      }
    });

    cb({ ok: true, manualParticipants });
  });

  socket.on('get-manual-assignment', ({ code, participantId }, cb) => {
    const session = sessions.get(code);
    if (!session || !session.assignments) return cb({ ok: false });
    const assignment = session.assignments[participantId];
    if (!assignment) return cb({ ok: false });
    cb({ ok: true, assignment });
  });

  socket.on('get-session', ({ code }, cb) => {
    const session = sessions.get(code.toUpperCase());
    if (!session) return cb({ ok: false, error: 'Session introuvable' });
    cb({ ok: true, session: sanitizeSession(session) });
  });

  socket.on('disconnect', () => {
    // Mark participant as disconnected but keep them in session
  });
});

function sanitizeParticipant(p) {
  return { id: p.id, name: p.name, mode: p.mode, color: p.color, giftIdea: p.giftIdea, isOrganizer: p.isOrganizer };
}

function sanitizeParticipants(session) {
  return session.participants.map(sanitizeParticipant);
}

function sanitizeSession(session) {
  return {
    code: session.code,
    name: session.name,
    budget: session.budget,
    status: session.status,
    participants: sanitizeParticipants(session),
  };
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GiftShuffle running on http://localhost:${PORT}`);
});
