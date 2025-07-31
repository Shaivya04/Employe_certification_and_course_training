const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Employee = require('../models/Employee');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({ role: 'employee', employee: { $exists: false } });

  console.log(`Found ${users.length} users without employee record`);

  for (const user of users) {
    const existingEmployee = await Employee.findOne({ email: user.email });

    let employee = existingEmployee;

    // If no employee exists, create one
    if (!existingEmployee) {
      employee = new Employee({
        name: user.name,
        email: user.email,
        joinDate: new Date()
      });
      await employee.save();
      console.log(`✅ Created employee for ${user.email}`);
    } else {
      console.log(`ℹ️ Using existing employee for ${user.email}`);
    }

    // Link employee to user
    user.employee = employee._id;
    await user.save();
    console.log(`🔗 Linked ${user.email} -> ${employee._id}`);
  }

  console.log('🎉 Done!');
  mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Error:', err.message);
  mongoose.disconnect();
});
