const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Create a new team
router.post('/', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {
    const team = await prisma.team.create({
      data: {
        name,
        description,
        creatorId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get user's teams
router.get('/my-teams', authMiddleware, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Invite user to team
router.post('/:teamId/invite', authMiddleware, async (req, res) => {
  const { teamId } = req.params;
  const { email } = req.body;

  try {
    // Check if user is team admin
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: parseInt(teamId),
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'Only team admins can invite members' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: parseInt(teamId),
        userId: user.id
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Add user to team
    const newMember = await prisma.teamMember.create({
      data: {
        teamId: parseInt(teamId),
        userId: user.id,
        role: 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json(newMember);
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// Update team member points and level
router.patch('/:teamId/members/:userId', authMiddleware, async (req, res) => {
  const { teamId, userId } = req.params;
  const { points, level } = req.body;

  try {
    // Check if user is team admin
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: parseInt(teamId),
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'Only team admins can update member stats' });
    }

    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: parseInt(userId)
        }
      },
      data: {
        points: points || undefined,
        level: level || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member stats' });
  }
});

// Leave team
router.delete('/:teamId/leave', authMiddleware, async (req, res) => {
  const { teamId } = req.params;

  try {
    // Check if user is the last admin
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: {
        members: {
          where: { role: 'admin' }
        }
      }
    });

    if (team.members.length === 1 && team.members[0].userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot leave team as the last admin. Please transfer admin role first.' });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: req.user.id
        }
      }
    });

    res.json({ message: 'Successfully left the team' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

module.exports = router; 