-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('family', 'caregiver', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 간병인 프로필 테이블
CREATE TABLE caregiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  experience INT DEFAULT 0,
  certifications TEXT[],
  regions TEXT[],
  available_days TEXT[],
  hourly_rate INT,
  bio TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 매칭 요청 테이블
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
