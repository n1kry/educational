-- Users
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'STUDENT',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    category      VARCHAR(100),
    thumbnail_url VARCHAR(500),
    is_published  BOOLEAN      NOT NULL DEFAULT FALSE,
    teacher_id    BIGINT       NOT NULL REFERENCES users(id)
);

-- Sections
CREATE TABLE sections (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title     VARCHAR(255) NOT NULL,
    position  INT          NOT NULL
);

-- Lessons
CREATE TABLE lessons (
    id               BIGSERIAL PRIMARY KEY,
    section_id       BIGINT       NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    video_url        VARCHAR(500),
    duration_minutes INT,
    position         INT          NOT NULL
);

-- Quizzes (section quiz OR final course quiz)
CREATE TABLE quizzes (
    id            BIGSERIAL PRIMARY KEY,
    section_id    BIGINT REFERENCES sections(id) ON DELETE CASCADE,
    course_id     BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    passing_score INT          NOT NULL DEFAULT 70,
    is_final      BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_quiz_owner CHECK (
        (section_id IS NOT NULL AND course_id IS NULL AND is_final = FALSE) OR
        (section_id IS NULL AND course_id IS NOT NULL AND is_final = TRUE)
    )
);

-- Questions
CREATE TABLE questions (
    id             BIGSERIAL PRIMARY KEY,
    quiz_id        BIGINT      NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    text           TEXT        NOT NULL,
    correct_answer VARCHAR(10) NOT NULL
);

-- Answer options (A, B, C, D)
CREATE TABLE answer_options (
    id          BIGSERIAL PRIMARY KEY,
    question_id BIGINT      NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key  VARCHAR(10) NOT NULL,
    text        TEXT        NOT NULL
);

-- Enrollments
CREATE TABLE enrollments (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT    NOT NULL REFERENCES users(id),
    course_id   BIGINT    NOT NULL REFERENCES courses(id),
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

-- Lesson progress
CREATE TABLE lesson_progress (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT    NOT NULL REFERENCES users(id),
    lesson_id    BIGINT    NOT NULL REFERENCES lessons(id),
    completed    BOOLEAN   NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (student_id, lesson_id)
);

-- Quiz results
CREATE TABLE quiz_results (
    id         BIGSERIAL PRIMARY KEY,
    student_id BIGINT    NOT NULL REFERENCES users(id),
    quiz_id    BIGINT    NOT NULL REFERENCES quizzes(id),
    score      INT       NOT NULL,
    passed     BOOLEAN   NOT NULL,
    attempts   INT       NOT NULL DEFAULT 1,
    passed_at  TIMESTAMP,
    UNIQUE (student_id, quiz_id)
);

-- Course progress
CREATE TABLE course_progress (
    id               BIGSERIAL PRIMARY KEY,
    student_id       BIGINT NOT NULL REFERENCES users(id),
    course_id        BIGINT NOT NULL REFERENCES courses(id),
    progress_percent INT    NOT NULL DEFAULT 0,
    UNIQUE (student_id, course_id)
);
