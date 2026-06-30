CREATE DATABASE nhpc_db;
USE nhpc_db;

CREATE TABLE solutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    area VARCHAR(100),
    description TEXT,
    employee VARCHAR(50),
    status VARCHAR(20),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



ALTER TABLE solutions MODIFY image LONGTEXT;

ALTER TABLE solutions MODIFY image VARCHAR(255);

SELECT image FROM solutions;

SELECT id, title, employee FROM solutions;

SELECT id, image FROM solutions;

DELETE FROM solutions WHERE id = 7;

ALTER TABLE solutions
ADD COLUMN pdf_file VARCHAR(255);

ALTER TABLE solutions
ADD COLUMN reject_reason VARCHAR(255);


ALTER TABLE solutions
ADD COLUMN views INT DEFAULT 0;

SELECT id, views FROM solutions WHERE id = 9;

ALTER TABLE solutions
ADD COLUMN likes INT DEFAULT 0,
ADD COLUMN dislikes INT DEFAULT 0;

SELECT id, status FROM solutions;

SELECT id, title, employee, status, updated_at
FROM solutions
WHERE status='Draft';


ALTER TABLE solutions
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP;

UPDATE solutions
SET updated_at = created_at
WHERE updated_at IS NULL;

DESCRIBE solutions;

SELECT 
  MIN(created_at) AS oldest,
  MAX(created_at) AS latest
FROM solutions;


SELECT DISTINCT area, LENGTH(area) 
FROM solutions;

SELECT id, title, area, status, created_at
FROM solutions
WHERE status='Pending';

SELECT id, title, area
FROM solutions
WHERE status='Pending' AND area LIKE '%CO Office%';

delete from solutions where id >=1;

select * from solutions;

