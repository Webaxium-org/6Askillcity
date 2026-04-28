import mongoose from "mongoose";
import dotenv from "dotenv";
import PartnerPermission from "../models/partnerPermission.js";
import AdmissionPoint from "../models/admissionPoint.js";
import Program from "../models/program.js";

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/6askillcity");
    console.log("Connected to MongoDB");

    const partners = await AdmissionPoint.find({ status: "approved" });
    console.log(`Found ${partners.length} approved partners`);

    for (const partner of partners) {
      console.log(`\nPartner: ${partner.centerName} (${partner._id})`);
      const permissions = await PartnerPermission.find({ partnerId: partner._id });
      console.log(`Permissions: ${permissions.length}`);
      for (const p of permissions) {
        console.log(` - Type: ${p.type}, Status: ${p.status}, UniId: ${p.universityId}, ProgId: ${p.programId}`);
        if (p.type === 'university' && p.universityId) {
            const progs = await Program.find({ university: p.universityId });
            console.log(`   - Found ${progs.length} programs for this university`);
            for(const pr of progs) console.log(`     - ${pr.name} (Active: ${pr.isActive})`);
        }
        if (p.type === 'program' && p.programId) {
            const prog = await Program.findById(p.programId);
            console.log(`   - Program: ${prog?.name}, IsActive: ${prog?.isActive}`);
        }
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

debug();
