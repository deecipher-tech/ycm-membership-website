USE ycm_db;

-- Insert sample states
INSERT INTO states (name, code) VALUES 
('Lagos', 'LA'),
('Kano', 'KN'),
('Abuja FCT', 'FCT'),
('Rivers', 'RI'),
('Oyo', 'OY'),
('Kaduna', 'KD');

-- Insert sample LGAs
INSERT INTO lgas (state_id, name) VALUES 
((SELECT id FROM states WHERE name='Lagos'), 'Ikeja'),
((SELECT id FROM states WHERE name='Lagos'), 'Eti-Osa'),
((SELECT id FROM states WHERE name='Lagos'), 'Surulere'),
((SELECT id FROM states WHERE name='Lagos'), 'Alimosho'),
((SELECT id FROM states WHERE name='Kano'), 'Nasarawa'),
((SELECT id FROM states WHERE name='Kano'), 'Dala'),
((SELECT id FROM states WHERE name='Kano'), 'Fagge'),
((SELECT id FROM states WHERE name='Abuja FCT'), 'Abaji'),
((SELECT id FROM states WHERE name='Abuja FCT'), 'Bwari'),
((SELECT id FROM states WHERE name='Abuja FCT'), 'Gwagwalada'),
((SELECT id FROM states WHERE name='Rivers'), 'Port Harcourt'),
((SELECT id FROM states WHERE name='Rivers'), 'Obio-Akpor'),
((SELECT id FROM states WHERE name='Oyo'), 'Ibadan North'),
((SELECT id FROM states WHERE name='Oyo'), 'Ibadan South-West'),
((SELECT id FROM states WHERE name='Kaduna'), 'Kaduna North'),
((SELECT id FROM states WHERE name='Kaduna'), 'Kaduna South');

-- Insert admin users (password for all: P@ssw0rd!)
INSERT INTO admins (username, email, password_hash, role) VALUES 
('superadmin', 'superadmin@ycm.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super'),
('editoradmin', 'editor@ycm.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'editor'),
('vieweradmin', 'viewer@ycm.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'viewer');

-- Insert sample members
INSERT INTO members 
(membership_id, full_name, phone, email, dob, gender, state_id, lga_id, residential_address, occupation, passport_photo, voters_card_front, voters_card_back, password_hash, status) 
VALUES
('YCM-202500001', 'Aisha Bello', '+2348012345678', 'aisha.bello@ycm.ng', '1995-07-12', 'Female', 
 (SELECT id FROM states WHERE name='Lagos'), (SELECT id FROM lgas WHERE name='Ikeja'), 
 '12 Ahmed St, Ikeja, Lagos', 'Software Developer', 'uploads/members/1/passport.jpg', 
 'uploads/members/1/voter_front.jpg', 'uploads/members/1/voter_back.jpg', 
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'approved'),
 
('YCM-202500002', 'Emeka Okafor', '+2348039876543', 'emeka.okafor@ycm.ng', '1992-02-01', 'Male', 
 (SELECT id FROM states WHERE name='Kano'), (SELECT id FROM lgas WHERE name='Nasarawa'), 
 '45 Borno Rd, Kano', 'Teacher', 'uploads/members/2/passport.jpg', 
 'uploads/members/2/voter_front.jpg', 'uploads/members/2/voter_back.jpg', 
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pending'),
 
('YCM-202500003', 'Fatima Yusuf', '+2348051234567', 'fatima.yusuf@ycm.ng', '1998-11-25', 'Female', 
 (SELECT id FROM states WHERE name='Abuja FCT'), (SELECT id FROM lgas WHERE name='Bwari'), 
 '78 Garki Area, Abuja', 'Medical Student', 'uploads/members/3/passport.jpg', 
 'uploads/members/3/voter_front.jpg', 'uploads/members/3/voter_back.jpg', 
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'rejected');

-- Insert sample events
INSERT INTO events 
(title, slug, category, description, start_datetime, end_datetime, venue, featured_image, max_attendees, registration_deadline, status, created_by) 
VALUES
('Youth Empowerment Summit 2025', 'youth-empowerment-summit-2025', 'Conference', 
 'Join us for the annual Youth Empowerment Summit featuring keynote speakers, workshops, and networking opportunities for young Nigerians.', 
 '2025-03-15 09:00:00', '2025-03-16 17:00:00', 'International Conference Centre, Abuja', 
 'uploads/events/summit2025.jpg', 500, '2025-03-10 23:59:00', 'published', 1),
 
('Community Clean-up Initiative', 'community-clean-up-initiative', 'Volunteering', 
 'Lets make our community cleaner! Join YCM members for a day of environmental sanitation and community service.', 
 '2025-02-20 08:00:00', '2025-02-20 14:00:00', 'Central Business District, Lagos', 
 'uploads/events/cleanup.jpg', 100, '2025-02-18 23:59:00', 'published', 2);

-- Insert sample news
INSERT INTO news 
(title, slug, excerpt, content, featured_image, author, published_at, status, created_by) 
VALUES
('YCM Launches Digital Skills Training Program', 'ycm-launches-digital-skills-training', 
 'Youth Concessive Movement announces new digital skills training initiative to empower 5,000 Nigerian youth with in-demand tech skills.', 
 'The Youth Concessive Movement (YCM) is proud to announce the launch of our Digital Skills Training Program, aimed at equipping young Nigerians with essential technology skills for the 21st century economy. The program will offer courses in web development, digital marketing, data analysis, and cybersecurity.\n\nThis initiative aligns with our mission to create opportunities for Nigerian youth and prepare them for the digital workforce. Applications open next month.', 
 'uploads/news/digital-skills.jpg', 'Admin Team', NOW(), 'published', 1),
 
('New Leadership Structure Announced', 'new-leadership-structure-announced', 
 'YCM introduces new leadership roles and state coordinators to better serve our growing membership across Nigeria.', 
 'To better serve our expanding membership base across all 36 states and FCT, the Youth Concessive Movement has established a new leadership structure. The organization will now have state coordinators in each state, supported by local government area representatives.\n\nThis decentralized approach will ensure that YCM activities and initiatives are more responsive to local needs and opportunities.', 
 'uploads/news/leadership.jpg', 'Admin Team', NOW(), 'published', 2);

-- Insert sample gallery albums
INSERT INTO gallery_albums (title, description, cover_image, status, created_by) 
VALUES
('Empowerment Summit 2024', 'Photos from our successful Youth Empowerment Summit held in Lagos', 'uploads/gallery/album1/cover.jpg', 'active', 1),
('Community Projects', 'YCM members engaged in various community development projects', 'uploads/gallery/album2/cover.jpg', 'active', 2);

-- Insert sample gallery images
INSERT INTO gallery_images (album_id, file_path, caption, uploaded_by) 
VALUES
(1, 'uploads/gallery/album1/image1.jpg', 'Keynote session at the summit', 1),
(1, 'uploads/gallery/album1/image2.jpg', 'Participants during workshop session', 1),
(2, 'uploads/gallery/album2/image1.jpg', 'Community clean-up activity', 2),
(2, 'uploads/gallery/album2/image2.jpg', 'Tree planting initiative', 2);

-- Insert site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('site_name', 'Youth Concessive Movement', 'string'),
('site_description', 'Empowering Nigerian Youth for Positive Change', 'string'),
('contact_email', 'info@ycm.ng', 'string'),
('contact_phone', '+234 800 123 4567', 'string'),
('office_address', '123 Youth Avenue, Central District, Abuja, Nigeria', 'string'),
('facebook_url', 'https://facebook.com/youthconcessivemovement', 'string'),
('twitter_url', 'https://twitter.com/ycm_ng', 'string'),
('instagram_url', 'https://instagram.com/ycm_ng', 'string'),
('membership_fee', '0', 'integer'),
('registration_open', '1', 'boolean');