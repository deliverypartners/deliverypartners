import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deliverypartner.com' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@deliverypartner.com',
      phoneNumber: '+1234567890',
      password: hashedAdminPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      adminProfile: {
        create: {
          permissions: ['ALL'],
          department: 'IT'
        }
      }
    },
    include: {
      adminProfile: true
    }
  });

  // Create sample customer
  const hashedCustomerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      fullName: 'John Customer',
      email: 'customer@example.com',
      phoneNumber: '+1234567891',
      password: hashedCustomerPassword,
      role: 'CUSTOMER',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        create: {
          preferredPaymentMethod: 'CARD',
          loyaltyPoints: 0
        }
      },
      profile: {
        create: {
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      }
    },
    include: {
      customerProfile: true,
      profile: true
    }
  });

  // Create sample driver
  const hashedDriverPassword = await bcrypt.hash('driver123', 12);
  const driver = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      fullName: 'Mike Driver',
      email: 'driver@example.com',
      phoneNumber: '+1234567892',
      password: hashedDriverPassword,
      role: 'DRIVER',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      driverProfile: {
        create: {
          aadhaarNumber: '123456789012',
          licenseNumber: 'DL1234567890',
          experienceYears: 5,
          isOnline: true,
          isVerified: true,
          rating: 4.5,
          totalTrips: 10,
          totalEarnings: 5000,
          walletBalance: 1500
        }
      },
      profile: {
        create: {
          address: '456 Driver Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002'
        }
      }
    },
    include: {
      driverProfile: true,
      profile: true
    }
  });

  // Create sample vehicle for driver
  const vehicle = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'MH01AB1234',
      vehicleType: 'BIKE',
      vehicleModel: 'Honda Activa',
      yearOfManufacture: '2022',
      insuranceNumber: 'INS123456789',
      registrationDocument: 'registration.pdf',
      insuranceDocument: 'insurance.pdf',
      isVerified: true,
      isActive: true,
      driverProfileId: driver.driverProfile!.id
    }
  });

  console.log('✅ Seed completed successfully');
  console.log(`👤 Admin: ${admin.email}`);
  console.log(`👤 Customer: ${customer.email}`);
  console.log(`👤 Driver: ${driver.email}`);
  console.log(`🚗 Vehicle: ${vehicle.vehicleNumber}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
