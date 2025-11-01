import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Admin from '../models/Admin';
import mongoose from 'mongoose';

dotenv.config();

async function seedAdmin() {
  try {
    await connectDatabase();

    console.log('\n📝 建立管理員帳戶...\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  管理員 "admin" 已存在，跳過建立');
    } else {
      // Create admin
      const admin = new Admin({
        username: 'admin',
        password: 'admin123',  // Will be hashed automatically
        email: 'admin@mmquiz.com',
        role: 'super',
        isActive: true
      });

      await admin.save();

      console.log('✅ 超級管理員帳戶建立成功！');
      console.log('==================================================');
      console.log('使用者名稱: admin');
      console.log('密碼: admin123');
      console.log('角色: 超級管理員');
      console.log('Email: admin@mmquiz.com');
      console.log('==================================================');
    }

    console.log('\n請使用此帳戶登入管理後台。\n');

  } catch (error) {
    console.error('\n❌ 錯誤:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 資料庫連接已關閉\n');
  }
}

seedAdmin();
