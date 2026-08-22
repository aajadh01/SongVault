import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Sibling } from '../models/Sibling.js';
import { Recording } from '../models/Recording.js';

export const seedInitialData = async () => {
  try {
    // 1. Ensure Admin Account Exists
    const existingAdmin = await Admin.findOne({ email: 'admin@siblingvault.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123456', salt);
      await Admin.create({
        email: 'admin@siblingvault.com',
        name: 'Vault Master',
        passwordHash,
      });
      console.log('👤 Seeded Admin: admin@siblingvault.com / admin123456');
    }

    // 2. Check if any siblings exist
    const siblingCount = await Sibling.countDocuments();
    if (siblingCount === 0) {
      console.log('🌱 Seeding demo siblings and songs for acceptance test verification...');

      // Sibling 1: Thrailokya (3 songs: video, image, none) -> Tests Case C (Multiple Songs)
      const salt1 = await bcrypt.genSalt(10);
      const thrailokya = await Sibling.create({
        name: 'Thrailokya',
        cardId: 'THR7X9',
        secretCodeHash: await bcrypt.hash('060705', salt1),
        hint: 'Where two birthdays become one. ❤️',
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
        welcomeMessage: 'Some memories deserve their own little place. ♡',
        isActive: true,
      });

      // Sample verified audio and video URLs (public domain / royalty free CDN audio & video loops)
      await Recording.create([
        {
          siblingId: thrailokya._id,
          title: 'Our First Song',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          backgroundMediaType: 'video',
          backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
          description: 'The song that played on the endless drive home under the stars.',
          personalMessage: 'Every time I hear this, I remember how hard we laughed that night. Never lose that smile!',
          order: 1,
          duration: 372,
          isActive: true,
        },
        {
          siblingId: thrailokya._id,
          title: 'Birthday Recording',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          coverImageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
          backgroundMediaType: 'image',
          backgroundImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80',
          description: 'A special acoustic melody recorded on your 20th birthday.',
          personalMessage: 'To the best sister anyone could ask for. Happy memories forever! ♡',
          order: 2,
          duration: 215,
          isActive: true,
        },
        {
          siblingId: thrailokya._id,
          title: 'That Random Call',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
          backgroundMediaType: 'none',
          description: 'Just a random piano tune when we talked for 4 hours about life.',
          personalMessage: 'Always here for you, anytime, anywhere.',
          order: 3,
          duration: 321,
          isActive: true,
        },
      ]);

      // Sibling 2: SIB1S1 (Exactly 1 Song) -> Tests Case B (Direct Music Player)
      const salt2 = await bcrypt.genSalt(10);
      const singleSongSibling = await Sibling.create({
        name: 'Aajadh',
        cardId: 'SIB1S1',
        secretCodeHash: await bcrypt.hash('112233', salt2),
        hint: 'The year our favorite adventure began. 🌟',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        welcomeMessage: 'A single melody made especially for you. ♡',
        isActive: true,
      });

      await Recording.create({
        siblingId: singleSongSibling._id,
        title: 'A Single Precious Note',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverImageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
        backgroundMediaType: 'video',
        backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
        description: 'The one song that connects all our travels.',
        personalMessage: 'One song, infinite memories.',
        order: 1,
        duration: 240,
        isActive: true,
      });

      // Sibling 3: MEM0S0 (0 Songs) -> Tests Case A (Empty State)
      const salt3 = await bcrypt.genSalt(10);
      await Sibling.create({
        name: 'Little Star',
        cardId: 'MEM0S0',
        secretCodeHash: await bcrypt.hash('998877', salt3),
        hint: 'The secret promise under the stars. 🌙',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        welcomeMessage: 'Your vault is being crafted with love. ♡',
        isActive: true,
      });

      console.log('✅ Demo test siblings seeded successfully.');
      console.log('   - THR7X9 (3 songs, pin: 060705)');
      console.log('   - SIB1S1 (1 song,  pin: 112233)');
      console.log('   - MEM0S0 (0 songs, pin: 998877)');
    }
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../config/db.js').then(async ({ connectDB, closeDB }) => {
      await connectDB();
      await seedInitialData();
      console.log('✨ Seed process complete.');
      process.exit(0);
    });
  });
}

