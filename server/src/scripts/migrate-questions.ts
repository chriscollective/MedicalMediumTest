import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question';
import existingQuestions from './existing-questions.json';

dotenv.config();

async function migrate() {
  try {
    console.log('🚀 開始資料遷移...');

    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB 連接成功');

    // 清空現有題目（可選，謹慎使用）
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  資料庫中已有 ${existingCount} 題`);
      console.log('🗑️  清空現有題目...');
      await Question.deleteMany({});
      console.log('✅ 已清空現有題目');
    }

    // 匯入題目
    let successCount = 0;
    let failCount = 0;

    for (const q of existingQuestions) {
      try {
        await Question.create(q);
        successCount++;
        console.log(`✅ [${successCount}/${existingQuestions.length}] 已匯入: ${q.question.substring(0, 30)}...`);
      } catch (error: any) {
        failCount++;
        console.error(`❌ 匯入失敗: ${q.question.substring(0, 30)}...`);
        console.error(`   錯誤: ${error.message}`);
      }
    }

    console.log('\n📊 遷移結果:');
    console.log(`   ✅ 成功: ${successCount} 題`);
    console.log(`   ❌ 失敗: ${failCount} 題`);
    console.log(`   📝 總計: ${existingQuestions.length} 題`);

    // 驗證結果
    const finalCount = await Question.countDocuments();
    console.log(`\n🎉 資料庫中現有 ${finalCount} 題`);

    // 顯示題目分布
    const distribution = await Question.aggregate([
      {
        $group: {
          _id: { type: '$type', difficulty: '$difficulty' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.type': 1, '_id.difficulty': 1 } }
    ]);

    console.log('\n📈 題目分布:');
    distribution.forEach(d => {
      const typeLabel = d._id.type === 'single' ? '單選' :
                       d._id.type === 'multiple' ? '多選' : '填空';
      console.log(`   ${typeLabel} - ${d._id.difficulty}: ${d.count} 題`);
    });

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 資料庫連接已關閉');
  }
}

migrate();
