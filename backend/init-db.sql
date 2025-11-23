-- Initialize EasyCoach database
-- This script runs when PostgreSQL container starts for the first time

-- Create database if it doesn't exist (already handled by POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS easycoach;

-- Connect to the easycoach database
\c easycoach;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables will be handled by TypeORM migrations
-- This file is mainly for any initial setup or seed data

COMMIT;