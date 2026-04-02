export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      grants: {
        Row: {
          id: string;
          name: string;
          program: string;
          deadline: string;
          status: 'not-started' | 'in-progress' | 'submitted' | 'won' | 'archived';
          estimated_value: number;
          fit_score: number;
          owner_id: string;
          owner_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          program: string;
          deadline: string;
          status?: 'not-started' | 'in-progress' | 'submitted' | 'won' | 'archived';
          estimated_value: number;
          fit_score?: number;
          owner_id: string;
          owner_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          program?: string;
          deadline?: string;
          status?: 'not-started' | 'in-progress' | 'submitted' | 'won' | 'archived';
          estimated_value?: number;
          fit_score?: number;
          owner_id?: string;
          owner_name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          grant_id: string;
          title: string;
          completed: boolean;
          due_date: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          grant_id: string;
          title: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          grant_id?: string;
          title?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          grant_id: string;
          name: string;
          size: string;
          type: string;
          uploaded_at: string;
          storage_path: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          grant_id: string;
          name: string;
          size: string;
          type: string;
          uploaded_at?: string;
          storage_path?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          grant_id?: string;
          name?: string;
          size?: string;
          type?: string;
          uploaded_at?: string;
          storage_path?: string | null;
          user_id?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          grant_id: string;
          content: string;
          created_at: string;
          author: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          grant_id: string;
          content: string;
          created_at?: string;
          author: string;
          user_id: string;
        };
        Update: {
          id?: string;
          grant_id?: string;
          content?: string;
          created_at?: string;
          author?: string;
          user_id?: string;
        };
      };
      timeline_events: {
        Row: {
          id: string;
          grant_id: string;
          date: string;
          title: string;
          type: 'milestone' | 'deadline' | 'review';
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          grant_id: string;
          date: string;
          title: string;
          type: 'milestone' | 'deadline' | 'review';
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          grant_id?: string;
          date?: string;
          title?: string;
          type?: 'milestone' | 'deadline' | 'review';
          created_at?: string;
          user_id?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          grant_id: string;
          grant_name: string;
          submitted_at: string;
          format: 'PDF' | 'Word' | 'CSV';
          user_id: string;
        };
        Insert: {
          id?: string;
          grant_id: string;
          grant_name: string;
          submitted_at?: string;
          format: 'PDF' | 'Word' | 'CSV';
          user_id: string;
        };
        Update: {
          id?: string;
          grant_id?: string;
          grant_name?: string;
          submitted_at?: string;
          format?: 'PDF' | 'Word' | 'CSV';
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          organization: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
