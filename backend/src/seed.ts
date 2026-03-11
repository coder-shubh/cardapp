import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './db.js';
import { User } from './models/User.js';
import { Link } from './models/Link.js';

async function main() {
  await connectDb();

  const hashedPassword = await bcrypt.hash('demo123', 10);

  let user = await User.findOne({ email: 'demo@cardapp.com' });
  if (!user) {
    user = await User.create({
      name: 'Shubham Kumar',
      username: 'shubham',
      email: 'demo@cardapp.com',
      password: hashedPassword,
      bio: 'Full-stack developer building digital experiences.',
      phone: '+919999999999',
      theme_color: '#6366f1',
    });
    await Link.insertMany([
      { user_id: user._id, platform: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com/in/shubham', order: 0 },
      { user_id: user._id, platform: 'github', title: 'GitHub', url: 'https://github.com/shubham', order: 1 },
      { user_id: user._id, platform: 'portfolio', title: 'Portfolio', url: 'https://portfolio.example.com', order: 2 },
    ]);
  }

  console.log('Seed completed. Demo user:', user.username);

  await disconnectDb();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
