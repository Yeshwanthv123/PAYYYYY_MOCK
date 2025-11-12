/*
  # Palm Authentication Schema

  ## Overview
  Creates the database schema for palm-based biometric authentication system.
  Users authenticate with email/password and register/verify their palm data.

  ## Tables Created
  
  ### 1. palm_data
  Stores biometric palm landmark data for each user
  - `id` (uuid, primary key) - Unique identifier for palm data record
  - `user_id` (uuid, foreign key) - References auth.users.id
  - `landmarks_json` (jsonb) - Stores 21 palm keypoints as JSON array
  - `created_at` (timestamptz) - Timestamp of palm registration
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on palm_data table
  - Users can only read their own palm data
  - Users can only insert palm data for themselves
  - Users can only update their own palm data
  - Users can only delete their own palm data

  ## Indexes
  - Index on user_id for fast lookups
  - Constraint to ensure one palm record per user
*/

-- Create palm_data table
CREATE TABLE IF NOT EXISTS palm_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landmarks_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_palm_data_user_id ON palm_data(user_id);

-- Enable Row Level Security
ALTER TABLE palm_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for palm_data table
CREATE POLICY "Users can view own palm data"
  ON palm_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own palm data"
  ON palm_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own palm data"
  ON palm_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own palm data"
  ON palm_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);