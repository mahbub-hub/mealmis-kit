// prisma/seed.ts
// Seed file to populate Bangladesh administrative divisions

import {prisma} from '../src/lib/prisma'

async function main() {
  console.log('Starting seed...');

  const dhakaDivision = await prisma.division.findUnique({
    where: { name: 'Dhaka' },
  });

  // Sample Bangladesh Districts (Add all 64 districts as needed)
  if (dhakaDivision) {
    const dhakaDistricts = [
      { name: 'Dhaka', divisionId: dhakaDivision.id },
      { name: 'Gazipur', divisionId: dhakaDivision.id },
      { name: 'Narayanganj', divisionId: dhakaDivision.id },
      { name: 'Tangail', divisionId: dhakaDivision.id },
      { name: 'Munshiganj', divisionId: dhakaDivision.id },
      { name: 'Manikganj', divisionId: dhakaDivision.id },
      { name: 'Narsingdi', divisionId: dhakaDivision.id },
      { name: 'Faridpur', divisionId: dhakaDivision.id },
      { name: 'Rajbari', divisionId: dhakaDivision.id },
      { name: 'Gopalganj', divisionId: dhakaDivision.id },
      { name: 'Madaripur', divisionId: dhakaDivision.id },
      { name: 'Shariatpur', divisionId: dhakaDivision.id },
      { name: 'Kishoreganj', divisionId: dhakaDivision.id }
    ];

    for (const districtData of dhakaDistricts) {
      await prisma.district.upsert({
        where: { 
            name_divisionId: {
                name: districtData.name,
                divisionId: districtData.divisionId
            }
        }, 
        update: {},
        create: districtData,
      });
      console.log(`Created district: ${districtData.name}`);
    }

  // Upazilas by District (Sample data - add all upazilas)
  const upazilas = {
    'Dhaka': [
      'Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar',
      'Tejgaon', 'Mohammadpur', 'Gulshan', 'Mirpur', 'Uttara'
    ],
    'Chattogram': [
      'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari',
      'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan',
      'Sandwip', 'Satkania', 'Sitakunda'
    ],
    'Gazipur': [
      'Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'
    ],
    'Tangail': [
      'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari',
      'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur',
      'Nagarpur', 'Sakhipur'
    ],
    'Rajshahi': [
      'Rajshahi Sadar', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur',
      'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'
    ],
    'Khulna': [
      'Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia',
      'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada'
    ],
    'Coxs Bazar': [
      'Coxs Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali',
      'Pekua', 'Ramu', 'Teknaf', 'Ukhia'
    ],
  };

  // Unions by Upazila (Sample data)
  const unions = {
    'Dhamrai': [
      'Amta', 'Baisakanda', 'Balia', 'Bhakurta', 'Dhamrai', 'Gangutia',
      'Jadabpur', 'Kulla', 'Nannar', 'Rowail', 'Sanora', 'Sombhag', 'Suapur'
    ],
    'Savar': [
      'Amin Bazar', 'Ashulia', 'Birulia', 'Dhamsona', 'Kaundia',
      'Pathalia', 'Savar', 'Shimulia', 'Tetuljhora', 'Yearpur'
    ],
    'Gazipur Sadar': [
      'Baria', 'Gazipur', 'Kapasia', 'Maona', 'Prembagan',
      'Rajendrapur', 'Telihati', 'Tongi'
    ],
    'Tangail Sadar': [
      'Bantail', 'Bilbathuagani', 'Kagmari', 'Katuli', 'Mahera',
      'Mogra', 'Pakutia', 'Santosh', 'Tangail Sadar'
    ],
    'Coxs Bazar Sadar': [
      'Bakkhali', 'Eidgaon', 'Chowfaldandi', 'Islamabad', 'Jalalabad',
      'Khurushkul', 'PMkhali', 'Vabanipur', 'Jhilwanja'
    ],
  };

  // Create Districts with Upazilas and Unions in cascade
  for (const districtData of districts) {
    const district = await prisma.district.upsert({
      where: { name: districtData.name },
      update: {},
      create: {
        name: districtData.name,
        code: districtData.code,
      },
    });

    console.log(`Created district: ${district.name}`);

    // Get upazilas for this district
    const districtUpazilas = upazilas[districtData.name] || [];

    for (const upazilaName of districtUpazilas) {
      const upazila = await prisma.upazila.upsert({
        where: {
          name_districtId: {
            name: upazilaName,
            districtId: district.id,
          },
        },
        update: {},
        create: {
          name: upazilaName,
          districtId: district.id,
        },
      });

      console.log(`  Created upazila: ${upazila.name}`);

      // Get unions for this upazila
      const upazilaUnions = unions[upazilaName] || [];

      for (const unionName of upazilaUnions) {
        await prisma.union.upsert({
          where: {
            name_upazilaId: {
              name: unionName,
              upazilaId: upazila.id,
            },
          },
          update: {},
          create: {
            name: unionName,
            upazilaId: upazila.id,
          },
        });

        console.log(`    Created union: ${unionName}`);
      }
    }
  }

  // Create sample donors
  const donors = [
    {
      donorName: 'USAID',
      donorType: 'INTERNATIONAL',
      country: 'United States',
      description: 'United States Agency for International Development',
    },
    {
      donorName: 'UNICEF',
      donorType: 'MULTILATERAL',
      country: 'International',
      description: 'United Nations Children\'s Fund',
    },
    {
      donorName: 'World Bank',
      donorType: 'MULTILATERAL',
      country: 'International',
      description: 'International financial institution',
    },
    {
      donorName: 'EU',
      donorType: 'MULTILATERAL',
      country: 'European Union',
      description: 'European Union Development Fund',
    },
    {
      donorName: 'DFID',
      donorType: 'BILATERAL',
      country: 'United Kingdom',
      description: 'Department for International Development',
    },
  ];

  for (const donorData of donors) {
    await prisma.donor.upsert({
      where: { donorName: donorData.donorName },
      update: {},
      create: donorData,
    });
    console.log(`Created donor: ${donorData.donorName}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Add to package.json:
// "prisma": {
//   "seed": "ts-node prisma/seed.ts"
// }