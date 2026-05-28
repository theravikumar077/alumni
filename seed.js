const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Alumni = require("./models/Alumni");
const Mentor = require("./models/Mentor");
const Admin = require("./models/Admin");
const Event = require("./models/Event");
const Job = require("./models/Job");
const Post = require("./models/Post");

const alumniData = [
  {"id": 1, "name": "John Doe", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "batch": 2010, "degree": "BSc Computer Science", "role": "Software Engineer", "company": "Tech Corp", "location": "New York", "tags": ["tech", "coding"], "bio": "Passionate developer.", "linkedin": "https://linkedin.com/in/johndoe", "email": "john@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Technology", "activity": 80, "connections": 150},
  {"id": 2, "name": "Jane Smith", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "batch": 2012, "degree": "MBA", "role": "Product Manager", "company": "Biz Inc", "location": "San Francisco", "tags": ["business", "management"], "bio": "Product visionary.", "linkedin": "https://linkedin.com/in/janesmith", "email": "jane@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Business", "activity": 70, "connections": 120},
  {"id": 3, "name": "Alice Johnson", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", "batch": 2008, "degree": "PhD Physics", "role": "Data Scientist", "company": "Data Labs", "location": "Boston", "tags": ["data", "science"], "bio": "Data enthusiast.", "linkedin": "https://linkedin.com/in/alicejohnson", "email": "alice@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Science", "activity": 90, "connections": 200},
  {"id": 4, "name": "Bob Brown", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "batch": 2015, "degree": "BA Design", "role": "UX Designer", "company": "Design Co", "location": "Los Angeles", "tags": ["design", "ux"], "bio": "Creative designer.", "linkedin": "https://linkedin.com/in/bobbrown", "email": "bob@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Design", "activity": 60, "connections": 100},
  {"id": 5, "name": "Charlie Davis", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", "batch": 2011, "degree": "BEng", "role": "DevOps Engineer", "company": "Cloud Services", "location": "Seattle", "tags": ["devops", "cloud"], "bio": "Infrastructure expert.", "linkedin": "https://linkedin.com/in/charliedavis", "email": "charlie@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Technology", "activity": 85, "connections": 180},
  {"id": 6, "name": "Dana Evans", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "batch": 2013, "degree": "BS Marketing", "role": "Marketing Specialist", "company": "Ad Agency", "location": "Chicago", "tags": ["marketing", "ads"], "bio": "Marketing pro.", "linkedin": "https://linkedin.com/in/danaevans", "email": "dana@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "Marketing", "activity": 75, "connections": 140},
  {"id": 7, "name": "Evan Fox", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "batch": 2009, "degree": "BA HR", "role": "HR Manager", "company": "People Inc", "location": "Austin", "tags": ["hr", "people"], "bio": "HR specialist.", "linkedin": "https://linkedin.com/in/evanfox", "email": "evan@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "HR", "activity": 65, "connections": 110},
  {"id": 8, "name": "Fiona Green", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "batch": 2014, "degree": "BCom", "role": "Sales Executive", "company": "Sales Corp", "location": "Miami", "tags": ["sales", "business"], "bio": "Sales leader.", "linkedin": "https://linkedin.com/in/fionagreen", "email": "fiona@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Sales", "activity": 95, "connections": 220},
  {"id": 9, "name": "George Harris", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", "batch": 2016, "degree": "BS Accounting", "role": "Accountant", "company": "Finance Firm", "location": "Denver", "tags": ["finance", "accounting"], "bio": "Numbers expert.", "linkedin": "https://linkedin.com/in/georgeharris", "email": "george@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Finance", "activity": 55, "connections": 90},
  {"id": 10, "name": "Hannah Irving", "avatar": "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150", "batch": 2007, "degree": "JD", "role": "Lawyer", "company": "Law Office", "location": "Washington", "tags": ["law", "legal"], "bio": "Legal advisor.", "linkedin": "https://linkedin.com/in/hannahirving", "email": "hannah@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Law", "activity": 82, "connections": 160},
  {"id": 11, "name": "Ian Jackson", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150", "batch": 2017, "degree": "BEd", "role": "Teacher", "company": "School District", "location": "Phoenix", "tags": ["education", "teaching"], "bio": "Educator.", "linkedin": "https://linkedin.com/in/ianjackson", "email": "ian@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Education", "activity": 68, "connections": 130},
  {"id": 12, "name": "Judy King", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "batch": 2018, "degree": "MD", "role": "Doctor", "company": "Hospital", "location": "Houston", "tags": ["medicine", "health"], "bio": "Healthcare professional.", "linkedin": "https://linkedin.com/in/judyking", "email": "judy@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "Healthcare", "activity": 88, "connections": 190},
  {"id": 13, "name": "Kevin Lee", "avatar": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150", "batch": 2006, "degree": "BEng Mechanical", "role": "Engineer", "company": "Eng Corp", "location": "Detroit", "tags": ["engineering", "mechanical"], "bio": "Mechanical expert.", "linkedin": "https://linkedin.com/in/kevinlee", "email": "kevin@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Engineering", "activity": 78, "connections": 150},
  {"id": 14, "name": "Laura Miller", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "batch": 2019, "degree": "BA Art", "role": "Artist", "company": "Studio", "location": "Portland", "tags": ["art", "creative"], "bio": "Artist.", "linkedin": "https://linkedin.com/in/lauramiller", "email": "laura@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Arts", "activity": 62, "connections": 100},
  {"id": 15, "name": "Mike Nolan", "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "batch": 2005, "degree": "PhD Chemistry", "role": "Scientist", "company": "Research Lab", "location": "San Diego", "tags": ["science", "research"], "bio": "Researcher.", "linkedin": "https://linkedin.com/in/mikenolan", "email": "mike@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Science", "activity": 92, "connections": 210},
  {"id": 16, "name": "Nina Owens", "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150", "batch": 2020, "degree": "BA Writing", "role": "Writer", "company": "Publishing", "location": "New Orleans", "tags": ["writing", "content"], "bio": "Writer.", "linkedin": "https://linkedin.com/in/ninaowens", "email": "nina@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Media", "activity": 72, "connections": 140},
  {"id": 17, "name": "Oscar Patel", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "batch": 2004, "degree": "MBA", "role": "Entrepreneur", "company": "Startup", "location": "Silicon Valley", "tags": ["startup", "business"], "bio": "Founder.", "linkedin": "https://linkedin.com/in/oscarpatel", "email": "oscar@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Business", "activity": 98, "connections": 250},
  {"id": 18, "name": "Paula Quinn", "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150", "batch": 2021, "degree": "BS Consulting", "role": "Consultant", "company": "Consult Firm", "location": "Atlanta", "tags": ["consulting", "strategy"], "bio": "Strategist.", "linkedin": "https://linkedin.com/in/paulaquinn", "email": "paula@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "Consulting", "activity": 58, "connections": 90},
  {"id": 19, "name": "Quinn Ramirez", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "batch": 2003, "degree": "BS Analytics", "role": "Analyst", "company": "Data Co", "location": "Dallas", "tags": ["analytics", "data"], "bio": "Analyst.", "linkedin": "https://linkedin.com/in/quinnramirez", "email": "quinn@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Data", "activity": 84, "connections": 170},
  {"id": 20, "name": "Rachel Sanchez", "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "batch": 2022, "degree": "BSc CS", "role": "Developer", "company": "Code Inc", "location": "Orlando", "tags": ["coding", "dev"], "bio": "Coder.", "linkedin": "https://linkedin.com/in/rachelsanchez", "email": "rachel@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Technology", "activity": 76, "connections": 130},
  {"id": 21, "name": "Steve Thomas", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "batch": 2002, "degree": "MBA", "role": "Manager", "company": "Manage Co", "location": "Las Vegas", "tags": ["management", "leadership"], "bio": "Leader.", "linkedin": "https://linkedin.com/in/stevethomas", "email": "steve@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Business", "activity": 89, "connections": 200},
  {"id": 22, "name": "Tina Underwood", "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", "batch": 2023, "degree": "BA Design", "role": "Designer", "company": "Design Studio", "location": "Salt Lake City", "tags": ["design", "ui"], "bio": "UI expert.", "linkedin": "https://linkedin.com/in/tinaunderwood", "email": "tina@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Design", "activity": 64, "connections": 110},
  {"id": 23, "name": "Uma Vance", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "batch": 2001, "degree": "BEng", "role": "Engineer", "company": "Tech Eng", "location": "Minneapolis", "tags": ["engineering", "tech"], "bio": "Engineer.", "linkedin": "https://linkedin.com/in/umavance", "email": "uma@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Engineering", "activity": 81, "connections": 160},
  {"id": 24, "name": "Victor White", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "batch": 2000, "degree": "PhD Science", "role": "Scientist", "company": "Sci Lab", "location": "Baltimore", "tags": ["science", "lab"], "bio": "Scientist.", "linkedin": "https://linkedin.com/in/victorwhite", "email": "victor@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "Science", "activity": 93, "connections": 220},
  {"id": 25, "name": "Wendy Xu", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "batch": 1999, "degree": "BEd", "role": "Teacher", "company": "Education Center", "location": "Charlotte", "tags": ["education", "teaching"], "bio": "Teacher.", "linkedin": "https://linkedin.com/in/wendyxu", "email": "wendy@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Education", "activity": 69, "connections": 120},
  {"id": 26, "name": "Xander Young", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "batch": 1998, "degree": "MD", "role": "Doctor", "company": "Clinic", "location": "Indianapolis", "tags": ["medicine", "health"], "bio": "Doctor.", "linkedin": "https://linkedin.com/in/xanderyoung", "email": "xander@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Healthcare", "activity": 87, "connections": 180},
  {"id": 27, "name": "Yara Zimmerman", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "batch": 1997, "degree": "JD", "role": "Lawyer", "company": "Law Firm", "location": "Columbus", "tags": ["law", "legal"], "bio": "Lawyer.", "linkedin": "https://linkedin.com/in/yarazimmerman", "email": "yara@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Law", "activity": 77, "connections": 140},
  {"id": 28, "name": "Zach Adams", "avatar": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150", "batch": 1996, "degree": "BS Accounting", "role": "Accountant", "company": "Finance Co", "location": "Fort Worth", "tags": ["finance", "accounting"], "bio": "Accountant.", "linkedin": "https://linkedin.com/in/zachadams", "email": "zach@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Finance", "activity": 59, "connections": 95},
  {"id": 29, "name": "Amy Baker", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "batch": 1995, "degree": "BCom", "role": "Sales Manager", "company": "Sales Inc", "location": "Jacksonville", "tags": ["sales", "management"], "bio": "Sales manager.", "linkedin": "https://linkedin.com/in/amybaker", "email": "amy@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Sales", "activity": 94, "connections": 230},
  {"id": 30, "name": "Brian Carter", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", "batch": 1994, "degree": "BA HR", "role": "HR Specialist", "company": "HR Services", "location": "San Jose", "tags": ["hr", "recruiting"], "bio": "HR specialist.", "linkedin": "https://linkedin.com/in/briancarter", "email": "brian@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "HR", "activity": 66, "connections": 115},
  {"id": 31, "name": "Cathy Diaz", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "batch": 1993, "degree": "BS Marketing", "role": "Marketing Director", "company": "Marketing Firm", "location": "Austin", "tags": ["marketing", "digital"], "bio": "Marketing director.", "linkedin": "https://linkedin.com/in/cathydiaz", "email": "cathy@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Marketing", "activity": 79, "connections": 155},
  {"id": 32, "name": "David Ellis", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "batch": 1992, "degree": "BEng", "role": "DevOps Lead", "company": "Cloud Co", "location": "Philadelphia", "tags": ["devops", "lead"], "bio": "DevOps lead.", "linkedin": "https://linkedin.com/in/davidellis", "email": "david@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Technology", "activity": 83, "connections": 175},
  {"id": 33, "name": "Emma Fisher", "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150", "batch": 1991, "degree": "BA Design", "role": "UX Lead", "company": "Design Inc", "location": "San Antonio", "tags": ["ux", "lead"], "bio": "UX lead.", "linkedin": "https://linkedin.com/in/emmafisher", "email": "emma@example.com", "verified": false, "isMentor": true, "isMentee": false, "industry": "Design", "activity": 61, "connections": 105},
  {"id": 34, "name": "Frank Gomez", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "batch": 1990, "degree": "PhD Data", "role": "Data Lead", "company": "Data Inc", "location": "San Diego", "tags": ["data", "lead"], "bio": "Data lead.", "linkedin": "https://linkedin.com/in/frankgomez", "email": "frank@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Data", "activity": 91, "connections": 205},
  {"id": 35, "name": "Grace Hill", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "batch": 1989, "degree": "MBA", "role": "PM Lead", "company": "Project Co", "location": "Dallas", "tags": ["pm", "lead"], "bio": "PM lead.", "linkedin": "https://linkedin.com/in/gracehill", "email": "grace@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Business", "activity": 74, "connections": 145},
  {"id": 36, "name": "Henry Ingram", "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", "batch": 1988, "degree": "BSc CS", "role": "Software Lead", "company": "Soft Inc", "location": "San Jose", "tags": ["software", "lead"], "bio": "Software lead.", "linkedin": "https://linkedin.com/in/henryingram", "email": "henry@example.com", "verified": false, "isMentor": false, "isMentee": true, "industry": "Technology", "activity": 86, "connections": 185},
  {"id": 37, "name": "Ivy Jenkins", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "batch": 1987, "degree": "BS Analytics", "role": "Analyst Lead", "company": "Analytics Co", "location": "Washington", "tags": ["analytics", "lead"], "bio": "Analyst lead.", "linkedin": "https://linkedin.com/in/ivyjenkins", "email": "ivy@example.com", "verified": true, "isMentor": true, "isMentee": false, "industry": "Data", "activity": 73, "connections": 135},
  {"id": 38, "name": "Jack Keller", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "batch": 1986, "degree": "MBA", "role": "Consultant Lead", "company": "Consult Co", "location": "Boston", "tags": ["consulting", "lead"], "bio": "Consultant lead.", "linkedin": "https://linkedin.com/in/jackkeller", "email": "jack@example.com", "verified": true, "isMentor": false, "isMentee": true, "industry": "Consulting", "activity": 57, "connections": 85}
];

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Alumni.deleteMany({});
    await Mentor.deleteMany({});
    await Admin.deleteMany({});
    await Event.deleteMany({});
    await Job.deleteMany({});
    await Post.deleteMany({});

    console.log("Seeding admin...");
    const adminUser = new User({
      name: "System Admin",
      email: "admin@alumnihub.com", // Treat admin or admin@alumnihub.com as admin
      password: "123456",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      isVerified: true
    });
    const savedAdmin = await adminUser.save();
    
    const adminRole = new Admin({
      userId: savedAdmin._id,
      accessLevel: "full"
    });
    await adminRole.save();
    console.log("Admin seeded.");

    console.log(`Seeding ${alumniData.length} alumni/mentor profiles...`);
    
    // We will save user references to link jobs/events
    const createdUsers = [];

    for (const a of alumniData) {
      // Determine role
      let role = "alumni";
      if (a.isMentor) {
        role = "mentor";
      }

      // Create base User
      const user = new User({
        name: a.name,
        email: a.email,
        password: "password123", // Default password
        role: role,
        avatar: a.avatar,
        location: a.location,
        linkedin: a.linkedin,
        bio: a.bio,
        skills: a.tags,
        isVerified: a.verified
      });

      const savedUser = await user.save();
      createdUsers.push(savedUser);

      // Create Alumni profile
      const alumni = new Alumni({
        userId: savedUser._id,
        batch: a.batch,
        degree: a.degree,
        company: a.company,
        role: a.role,
        industry: a.industry,
        activity: a.activity,
        connections: a.connections,
        tags: a.tags,
        isMentor: a.isMentor
      });

      const savedAlumni = await alumni.save();

      // Create Mentor profile if true
      if (a.isMentor) {
        const mentor = new Mentor({
          userId: savedUser._id,
          alumniId: savedAlumni._id,
          expertise: a.tags,
          availability: "Saturdays, 10 AM - 4 PM",
          bio: a.bio,
          isApproved: true,
          rating: 4.8 + Math.random() * 0.2
        });
        await mentor.save();
      }
    }

    console.log("Seeding default events...");
    const sampleOrganizer = createdUsers[0]; // John Doe
    const sampleOrganizer2 = createdUsers[4]; // Charlie Davis

    const event1 = new Event({
      title: "Annual Tech Networking Gala",
      description: "Join us for an evening of networking with industry-leading alumni at tech giants. Food and drinks will be served.",
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
      time: "6:00 PM - 9:00 PM",
      location: "San Francisco Tech Center / Hybrid",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
      organizer: sampleOrganizer._id,
      rsvps: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id],
      status: "approved"
    });

    const event2 = new Event({
      title: "Startup Founders Round Table",
      description: "A close-knit mentorship and pitching circle with VC alumni and successful startup founders.",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      time: "4:00 PM - 7:00 PM",
      location: "Boston Incubator Hall",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
      organizer: sampleOrganizer2._id,
      rsvps: [createdUsers[0]._id, createdUsers[3]._id],
      status: "approved"
    });

    await event1.save();
    await event2.save();

    console.log("Seeding default jobs...");
    const job1 = new Job({
      title: "Senior Full Stack Engineer",
      company: "Google",
      description: "Looking for an experienced engineer to join our Next-Gen Search Platform team. Experience with Node.js and systems architecture is a plus.",
      location: "Mountain View, CA / Remote",
      type: "Full-time",
      salary: "$160k - $210k",
      tags: ["tech", "coding", "node", "systems"],
      postedBy: sampleOrganizer._id,
      applicants: [],
      status: "approved"
    });

    const job2 = new Job({
      title: "Associate Product Manager Intern",
      company: "Stripe",
      description: "Great summer internship opportunity for recent or current students. Drive product features and interface with global dev teams.",
      location: "San Francisco, CA / Hybrid",
      type: "Internship",
      salary: "$40 - $60 / hour",
      tags: ["business", "management", "product"],
      postedBy: createdUsers[1]._id, // Jane Smith
      applicants: [createdUsers[3]._id],
      status: "approved"
    });

    const job3 = new Job({
      title: "DevOps Consultant",
      company: "AWS Partner Services",
      description: "Help scale cloud infrastructures for high-growth tech startups. Expertise in AWS and Docker required.",
      location: "Seattle, WA / Remote",
      type: "Contract",
      salary: "$90 - $120 / hour",
      tags: ["devops", "cloud", "aws"],
      postedBy: sampleOrganizer2._id,
      applicants: [],
      status: "approved"
    });

    await job1.save();
    await job2.save();
    await job3.save();

    console.log("Seeding initial community stories and discussions...");
    const post1 = new Post({
      title: "How I transitioned from BSc Computer Science to Senior Engineer at Tech Corp",
      content: "Hi everyone! I wanted to share my journey since graduating in 2010. Getting that first role was hard, but focusing on open source contributions and building robust side projects made all the difference. Feel free to connect and ask questions!",
      author: createdUsers[0]._id, // John Doe
      type: "story",
      likes: [createdUsers[1]._id, createdUsers[2]._id],
      comments: [
        {
          author: createdUsers[1]._id,
          content: "Incredible story, John! Thanks for sharing and giving back.",
          createdAt: new Date()
        }
      ]
    });

    const post2 = new Post({
      title: "Looking for recommendations on learning system design",
      content: "Hey community, I am a junior developer looking to level up. What are the best books, channels, or repositories for system design patterns?",
      author: createdUsers[3]._id, // Bob Brown
      type: "discussion",
      likes: [createdUsers[0]._id],
      comments: [
        {
          author: createdUsers[0]._id,
          content: "Read 'Designing Data-Intensive Applications' by Martin Kleppmann. It's the gold standard!",
          createdAt: new Date()
        },
        {
          author: createdUsers[4]._id,
          content: "Also check out System Design Primer on GitHub. Extremely helpful visual breakdown.",
          createdAt: new Date()
        }
      ]
    });

    await post1.save();
    await post2.save();

    console.log("All data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
