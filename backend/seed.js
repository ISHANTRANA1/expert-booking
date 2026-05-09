const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expert = require('./models/Expert');

dotenv.config();

const generateAvailability = () => {
  const availability = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Sundays
    if (date.getDay() === 0) continue;

    const dateStr = date.toISOString().split('T')[0];
    const slots = [
      { time: '09:00', isBooked: false },
      { time: '10:00', isBooked: false },
      { time: '11:00', isBooked: false },
      { time: '13:00', isBooked: false },
      { time: '14:00', isBooked: false },
      { time: '15:00', isBooked: false },
      { time: '16:00', isBooked: false },
    ];

    // Randomly pre-book some slots to simulate existing bookings
    const numBooked = Math.floor(Math.random() * 3);
    for (let j = 0; j < numBooked; j++) {
      const randIndex = Math.floor(Math.random() * slots.length);
      slots[randIndex].isBooked = true;
    }

    availability.push({ date: dateStr, slots });
  }

  return availability;
};

const experts = [
  {
    name: 'Dr. Priya Sharma',
    category: 'Healthcare',
    experience: 12,
    rating: 4.9,
    bio: 'Board-certified physician specializing in preventive medicine and holistic health. Former head of wellness at Apollo Hospitals.',
    specializations: ['Preventive Medicine', 'Nutrition Counseling', 'Stress Management'],
    hourlyRate: 150,
    totalSessions: 842,
    avatar: 'PS',
  },
  {
    name: 'Arjun Mehta',
    category: 'Technology',
    experience: 8,
    rating: 4.8,
    bio: 'Full-stack engineer and startup advisor. Built products at Google and scaled two SaaS startups from zero to profitable.',
    specializations: ['System Design', 'React/Node.js', 'Cloud Architecture', 'Startup Tech'],
    hourlyRate: 200,
    totalSessions: 524,
    avatar: 'AM',
  },
  {
    name: 'Neha Kapoor',
    category: 'Finance',
    experience: 10,
    rating: 4.7,
    bio: 'CFA charterholder and former Goldman Sachs analyst. Helps individuals and businesses build robust financial strategies.',
    specializations: ['Investment Planning', 'Tax Optimization', 'Portfolio Management'],
    hourlyRate: 180,
    totalSessions: 389,
    avatar: 'NK',
  },
  {
    name: 'Rajesh Nair',
    category: 'Legal',
    experience: 15,
    rating: 4.9,
    bio: 'Senior advocate with 15+ years in corporate and IP law. Represented Fortune 500 clients across international arbitration.',
    specializations: ['Corporate Law', 'Intellectual Property', 'Contract Drafting'],
    hourlyRate: 220,
    totalSessions: 1120,
    avatar: 'RN',
  },
  {
    name: 'Sunita Patel',
    category: 'Marketing',
    experience: 7,
    rating: 4.6,
    bio: 'Digital marketing strategist who grew brands from zero to 1M followers. Ex-CMO of two D2C unicorns.',
    specializations: ['Growth Hacking', 'Social Media Strategy', 'Brand Building', 'SEO'],
    hourlyRate: 130,
    totalSessions: 276,
    avatar: 'SP',
  },
  {
    name: 'Vikram Iyer',
    category: 'Business',
    experience: 18,
    rating: 4.8,
    bio: 'Serial entrepreneur and business mentor. Founded and exited 3 companies. Advisor to 40+ startups across India and Southeast Asia.',
    specializations: ['Business Strategy', 'Fundraising', 'Operations', 'P&L Management'],
    hourlyRate: 250,
    totalSessions: 967,
    avatar: 'VI',
  },
  {
    name: 'Dr. Ananya Roy',
    category: 'Psychology',
    experience: 9,
    rating: 4.9,
    bio: 'Clinical psychologist specializing in CBT and mindfulness-based interventions. Trained at NIMHANS Bangalore.',
    specializations: ['Cognitive Behavioral Therapy', 'Anxiety & Depression', 'Mindfulness', 'Workplace Stress'],
    hourlyRate: 140,
    totalSessions: 601,
    avatar: 'AR',
  },
  {
    name: 'Karthik Subramanian',
    category: 'Design',
    experience: 6,
    rating: 4.7,
    bio: 'Product designer with a portfolio spanning fintech, healthtech, and edtech. Former design lead at Swiggy.',
    specializations: ['UI/UX Design', 'Product Thinking', 'Design Systems', 'Figma'],
    hourlyRate: 120,
    totalSessions: 198,
    avatar: 'KS',
  },
  {
    name: 'Meera Joshi',
    category: 'Education',
    experience: 11,
    rating: 4.8,
    bio: 'EdTech innovator and learning scientist. Designed curricula for 500,000+ learners. Former IIT-Delhi faculty.',
    specializations: ['Curriculum Design', 'E-Learning', 'Academic Coaching', 'Study Methods'],
    hourlyRate: 110,
    totalSessions: 743,
    avatar: 'MJ',
  },
  {
    name: 'Aditya Bose',
    category: 'Career',
    experience: 13,
    rating: 4.6,
    bio: 'Executive career coach with experience in FAANG recruitment. Helped 200+ professionals land senior roles.',
    specializations: ['Resume Review', 'Interview Coaching', 'LinkedIn Optimization', 'Salary Negotiation'],
    hourlyRate: 160,
    totalSessions: 458,
    avatar: 'AB',
  },
  {
    name: 'Pooja Verma',
    category: 'Technology',
    experience: 5,
    rating: 4.5,
    bio: 'Machine learning engineer at a leading AI lab. Specializes in making AI concepts accessible to product teams.',
    specializations: ['Machine Learning', 'Python', 'Data Science', 'AI Strategy'],
    hourlyRate: 170,
    totalSessions: 134,
    avatar: 'PV',
  },
  {
    name: 'Sanjay Gupta',
    category: 'Business',
    experience: 20,
    rating: 4.9,
    bio: 'Veteran management consultant, ex-McKinsey partner. Specializes in turnarounds and organizational transformation.',
    specializations: ['Management Consulting', 'Change Management', 'Organizational Design'],
    hourlyRate: 300,
    totalSessions: 1543,
    avatar: 'SG',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking');
    console.log('✅ Connected to MongoDB');

    await Expert.deleteMany({});
    console.log('🗑  Cleared existing experts');

    const expertsWithAvailability = experts.map(expert => ({
      ...expert,
      availability: generateAvailability(),
    }));

    await Expert.insertMany(expertsWithAvailability);
    console.log(`✅ Seeded ${experts.length} experts with availability slots`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
