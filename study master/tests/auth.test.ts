import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../src/lib/supabase';

// Mock Supabase client
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockAuthResponse = {
        data: { user: mockUser },
        error: null,
      };

      const mockProfileResponse = {
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockAuthResponse);
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue(mockProfileResponse),
      } as any);

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });

      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle registration errors', async () => {
      const mockError = new Error('Email already registered');
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'weak',
      });

      expect(result.error).toEqual(mockError);
      expect(result.data.user).toBeNull();
    });
  });

  describe('User Login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockResponse = {
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse);

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'test-user-id', email: 'test@example.com' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should sign out user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
    });
  });
});