import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Admin from '../models/Admin';

dotenv.config();

async function ensureAdmin(username: string, password: string, email?: string) {
  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`✓ 管理員已存在：${username}`);
    return existing;
  }
  const admin = new Admin({
    username,
    password,
    email,
    role: 'admin',
    isActive: true,
  });
  await admin.save();
  console.log(`✓ 建立管理員完成：${username}`);
  return admin;
}

async function main() {
  try {
    await connectDatabase();
    console.log('連線資料庫成功');

    await ensureAdmin('Bebe', 'bebeapplelight', 'bebe@example.com');
    await ensureAdmin('Miruki', 'mirukilight', 'miruki@example.com');

    console.log('\n完成：Bebe 與 Miruki 皆已存在（如原先不存在則已建立）。');
  } catch (err) {
    console.error('建立管理員時發生錯誤：', err);
    process.exitCode = 1;
  }
}

main().finally(() => {
  // eslint-disable-next-line no-process-exit
  process.exit();
});

