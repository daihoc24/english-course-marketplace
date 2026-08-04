UPDATE coursedetail
SET link = NULL,
    video_public_id = NULL
WHERE link LIKE '%youtube.com%'
   OR link LIKE '%youtu.be%';
