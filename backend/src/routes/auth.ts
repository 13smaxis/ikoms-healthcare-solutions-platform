import { Router, Response } from 'express';
import { supabaseAdmin, createAuthenticatedClient } from '../config/supabase.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { errorResponse, successResponse } from '../utils/response.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json(errorResponse('Email and password are required'));
  }

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      return res.status(401).json(errorResponse(error?.message || 'Invalid email or password'));
    }

    const session = data.session;
    const tokenClient = createAuthenticatedClient(session.access_token);

    const { data: userData, error: userError } = await tokenClient
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (userError || !userData) {
      return res.status(401).json(errorResponse('User profile not found'));
    }

    const { data: assignmentData } = await tokenClient
      .from('staff_assignments')
      .select(`
        roleid,
        roles (
          rolename
        )
      `)
      .eq('userid', userData.userid)
      .eq('status', 'active')
      .maybeSingle();

    const roleRecord = Array.isArray(assignmentData?.roles)
      ? assignmentData.roles[0]
      : assignmentData?.roles;

    const role = roleRecord?.rolename?.toLowerCase() || 'customer';
    let storeid: string | undefined;

    if (role === 'manager') {
      const { data: storeData } = await tokenClient
        .from('stores')
        .select('storeid')
        .eq('managerid', userData.userid)
        .maybeSingle();

      storeid = storeData?.storeid;
    }

    return res.json(
      successResponse(
        {
          session,
          profile: {
            ...userData,
            role,
            storeid,
          },
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return res.status(500).json(errorResponse('Failed to authenticate')); 
  }
});

authRouter.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.supabaseClient || !req.user) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  try {
    const { data: userData, error: userError } = await req.supabaseClient
      .from('users')
      .select('*')
      .eq('userid', req.user.userid)
      .single();

    if (userError || !userData) {
      return res.status(404).json(errorResponse('Profile not found'));
    }

    return res.json(
      successResponse(
        {
          ...userData,
          role: req.user.role,
          storeid: req.user.storeid,
        },
        'Profile loaded'
      )
    );
  } catch (error) {
    console.error('GET /api/auth/profile error:', error);
    return res.status(500).json(errorResponse('Failed to load profile'));
  }
});
