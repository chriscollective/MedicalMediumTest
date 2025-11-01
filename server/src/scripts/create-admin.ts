import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Admin from '../models/Admin';
import mongoose from 'mongoose';
import * as readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    await connectDatabase();

    console.log('\n📝 建立新的管理員帳戶\n');
    console.log('='.repeat(50));

    const username = await question('請輸入使用者名稱: ');
    const password = await question('請輸入密碼 (至少6個字元): ');
    const email = await question('請輸入 Email (選填): ');
    const roleInput = await question('請選擇角色 (1: 超級管理員, 2: 一般管理員) [預設: 2]: ');

    const role = roleInput === '1' ? 'super' : 'admin';

    // Validation
    if (!username || username.length < 3) {
      console.log('\n❌ 使用者名稱至少需要 3 個字元');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    if (!password || password.length < 6) {
      console.log('\n❌ 密碼至少需要 6 個字元');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log('\n❌ 使用者名稱已存在');
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      username,
      password,
      email: email || undefined,
      role,
      isActive: true
    });

    await admin.save();

    console.log('\n✅ 管理員帳戶建立成功！');
    console.log('='.repeat(50));
    console.log(`使用者名稱: ${username}`);
    console.log(`角色: ${role === 'super' ? '超級管理員' : '一般管理員'}`);
    console.log(`Email: ${email || '(未設定)'}`);
    console.log('='.repeat(50));
    console.log('\n請使用此帳戶登入管理後台。\n');

  } catch (error) {
    console.error('\n❌ 錯誤:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n👋 資料庫連接已關閉');
  }
}

createAdmin();
