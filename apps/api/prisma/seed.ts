// ==========================================
// DATABASE SEED - MD HEALTH CARE CENTER
// ==========================================

import { PrismaClient, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mdhealthcare.mn' },
    update: {},
    create: {
      email: 'admin@mdhealthcare.mn',
      password: hashedPassword,
      name: 'Админ',
      role: 'admin',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Service Categories
  const categories = [
    {
      id: 'womens-health',
      name: 'Эмэгтэйчүүдийн эрүүл мэнд',
      description: 'Эмэгтэйчүүдийн бүх төрлийн үзлэг оношилгоо зөвлөгөө',
      icon: '👩‍⚕️',
      order: 1,
    },
    {
      id: 'pregnancy',
      name: 'Жирэмслэлт',
      description: 'Жирэмслэлтэд бэлдэх болон жирэмсний хяналт',
      icon: '🤰',
      order: 2,
    },
    {
      id: 'infertility',
      name: 'Үргүйдэл',
      description: 'Үргүйдлийн оношилгоо, эмчилгээ',
      icon: '💝',
      order: 3,
    },
    {
      id: 'aesthetics',
      name: 'Гоо сайхан',
      description: 'Арьс гоо засал, бэлгийн эрүүл мэнд',
      icon: '✨',
      order: 4,
    },
    {
      id: 'laboratory',
      name: 'Лаборатори',
      description: 'Лабораторийн бүх төрлийн шинжилгээ',
      icon: '🔬',
      order: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Service categories created');

  // Create Services
  const services = [
    // Эмэгтэйчүүдийн эрүүл мэнд
    { id: 's1', name: 'Эмэгтэйчүүдийн үзлэг оношилгоо', categoryId: 'womens-health', duration: 30, price: 50000, order: 1 },
    { id: 's2', name: 'Цэвэршилтийн үеийн тусламж үйлчилгээ', categoryId: 'womens-health', duration: 30, price: 60000, order: 2 },
    { id: 's3', name: 'Биеийн юмны мөчлөг алдагдах эмгэгүүд', categoryId: 'womens-health', duration: 45, price: 70000, order: 3 },
    { id: 's4', name: 'Бага аарцгийн архаг өвдөлт, үрэвсэл', categoryId: 'womens-health', duration: 30, price: 60000, order: 4 },
    { id: 's5', name: 'Умайн хүзүүний өнгөт дуран', categoryId: 'womens-health', duration: 30, price: 80000, order: 5 },
    { id: 's6', name: 'Умайн хүзүүний эс, эдийн шинжилгээ', categoryId: 'womens-health', duration: 20, price: 45000, order: 6 },
    { id: 's7', name: 'Охид, өсвөр үеийн тусламж үйлчилгээ', categoryId: 'womens-health', duration: 30, price: 45000, order: 7 },
    { id: 's8', name: 'Өдрийн эмчилгээ', categoryId: 'womens-health', duration: 60, price: 100000, order: 8 },
    
    // Жирэмслэлт
    { id: 's9', name: 'Жирэмсний эхо', categoryId: 'pregnancy', duration: 30, price: 50000, order: 1 },
    { id: 's10', name: 'Жирэмслэлтэд бэлдэх үзлэг, шинжилгээ, зөвлөгөө', categoryId: 'pregnancy', duration: 45, price: 80000, order: 2 },
    { id: 's11', name: 'Жирэмслэлтээс сэргийлэх арга хэрэгслүүд', categoryId: 'pregnancy', duration: 30, price: 40000, order: 3 },
    { id: 's12', name: 'Үү, ургацаг авах', categoryId: 'pregnancy', duration: 20, price: 30000, order: 4 },
    
    // Үргүйдэл
    { id: 's13', name: 'Үргүйдлийн оношилгоо', categoryId: 'infertility', duration: 45, price: 100000, order: 1 },
    { id: 's14', name: 'Үргүйдлийн эмчилгээ', categoryId: 'infertility', duration: 60, price: 150000, order: 2 },
    { id: 's15', name: 'Ихэсийн эмчилгээ', categoryId: 'infertility', duration: 45, price: 120000, order: 3 },
    
    // Гоо сайхан
    { id: 's16', name: 'Бэлгийн уруул, үтрээ, хэлүүний мэс засал', categoryId: 'aesthetics', duration: 90, price: 500000, order: 1 },
    { id: 's17', name: 'Бэлгийн уруул дүүргэлт тарилга', categoryId: 'aesthetics', duration: 45, price: 300000, order: 2 },
    { id: 's18', name: 'Үтрээ, нүүр, биеийн HIFU', categoryId: 'aesthetics', duration: 60, price: 400000, order: 3 },
    { id: 's19', name: 'Ботокс эмчилгээ', categoryId: 'aesthetics', duration: 30, price: 250000, order: 4 },
    { id: 's20', name: 'Өөх хайлуулах тарилга', categoryId: 'aesthetics', duration: 45, price: 200000, order: 5 },
    { id: 's21', name: 'Шингэн лифтинг тарилга эмчилгээ', categoryId: 'aesthetics', duration: 45, price: 350000, order: 6 },
    { id: 's22', name: 'O-SHOT тарилга (үтрээ чийгшүүлэх)', categoryId: 'aesthetics', duration: 45, price: 400000, order: 7 },
    { id: 's23', name: 'Үтрээний лазер', categoryId: 'aesthetics', duration: 45, price: 300000, order: 8 },
    { id: 's24', name: 'Умайн хүзүүний улайлтын PRP эмчилгээ', categoryId: 'aesthetics', duration: 45, price: 250000, order: 9 },
    { id: 's25', name: 'Умайн хүзүүний улайлтын ТЕРМОГЛАЙД эмчилгээ', categoryId: 'aesthetics', duration: 45, price: 280000, order: 10 },
    
    // Лаборатори
    { id: 's26', name: 'Эмэгтэйчүүдийн даавар шинжилгээ', categoryId: 'laboratory', duration: 15, price: 80000, order: 1 },
    { id: 's27', name: 'Эрдсийн шинжилгээ', categoryId: 'laboratory', duration: 15, price: 50000, order: 2 },
    { id: 's28', name: 'Хавдрын маркерын шинжилгээ', categoryId: 'laboratory', duration: 15, price: 100000, order: 3 },
    { id: 's29', name: 'БЗДХ оношилгоо шинжилгээ', categoryId: 'laboratory', duration: 15, price: 60000, order: 4 },
    { id: 's30', name: 'Ерөнхий шинжилгээ', categoryId: 'laboratory', duration: 15, price: 40000, order: 5 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }
  console.log('✅ Services created');

  // Create Doctors
  const doctors = [
    {
      id: 'doctor-1',
      name: 'Б. Оюунгэрэл',
      specialization: 'Эмэгтэйчүүдийн эмч',
      bio: 'АШУҮИС-ийн эмэгтэйчүүдийн мэргэшсэн эмч. 10+ жилийн туршлагатай. Нөхөн үржихүй, дотоод шүүрлийн чиглэлээр мэргэшсэн.',
    },
    {
      id: 'doctor-2',
      name: 'Д. Нарангэрэл',
      specialization: 'Эмэгтэйчүүдийн эмч',
      bio: 'Эх барих, эмэгтэйчүүдийн эмч. Үргүйдлийн эмчилгээ, гоо заслын чиглэлээр мэргэшсэн.',
    },
  ];

  for (const doctorData of doctors) {
    const doctor = await prisma.doctor.upsert({
      where: { id: doctorData.id },
      update: doctorData,
      create: doctorData,
    });
    console.log('✅ Doctor created:', doctor.name);

    // Create Schedule for each doctor (Monday - Saturday, 9:00 - 18:00)
    const workdays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    for (const day of workdays) {
      await prisma.schedule.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: doctor.id,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          slotDuration: 30,
        },
      });
    }
    console.log(`  📅 Schedule created for ${doctor.name}`);

    // Assign all services to doctors
    for (const service of services) {
      await prisma.doctorService.upsert({
        where: {
          doctorId_serviceId: {
            doctorId: doctor.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          serviceId: service.id,
        },
      });
    }
    console.log(`  🏥 Services assigned to ${doctor.name}`);
  }

  // Create Sample Patient
  const patient = await prisma.patient.upsert({
    where: { phone: '99001234' },
    update: {},
    create: {
      name: 'Тэст Хэрэглэгч',
      phone: '99001234',
      email: 'test@example.com',
    },
  });
  console.log('✅ Sample patient created:', patient.phone);

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📧 Admin login: admin@mdhealthcare.mn');
  console.log('🔑 Admin password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
