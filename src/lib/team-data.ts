/**
 * Static team data extracted from the original CodingClubWeb-main project.
 * Used by the seed script to populate the database.
 *
 * Category names match the sections rendered on the team page.
 */

export type RawTeamMember = {
  name: string
  position: string
  image: string
  bio?: string
  skills?: string[]
  social?: {
    github?: string
    linkedin?: string
    twitter?: string
  }
}

export const TEAM_DATA: Record<string, RawTeamMember[]> = {
  coreCommittee: [
    {
      name: "B Tharun Reddy",
      position: "Secretary",
      image: "/professional-male-student-president.png",
      bio: "Final year CSE student passionate about leading tech initiatives and building innovative solutions. Experienced in project management and team coordination.",
      skills: ["JavaScript", "Python", "React", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
  ],
  jointSecretaries: [
    {
      name: "Yeswanth Chirumamilla",
      position: "Joint Secretary",
      image: "/professional-male-student-technical-lead.png",
      bio: "Final year CSE student with expertise in web development and competitive programming. Passionate about creating scalable applications and mentoring peers.",
      skills: ["React", "Node.js", "Java", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Navya Ungarala",
      position: "Joint Secretary",
      image: "/professional-female-student-vice-president.png",
      bio: "Final year CSE student specializing in full-stack development and data structures. Enthusiastic about solving complex problems and team collaboration.",
      skills: ["Python", "JavaScript", "MongoDB", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Veerendra Kumar",
      position: "Joint Secretary",
      image: "/professional-male-student-web-development.png",
      bio: "Final year CSE student focused on backend development and algorithm optimization. Experienced in building robust systems and API development.",
      skills: ["Java", "Spring Boot", "MySQL", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Lahari Kethu",
      position: "Joint Secretary",
      image: "/professional-female-student-vice-president.png",
      bio: "Final year CSE student passionate about frontend technologies and user experience design. Skilled in creating responsive and interactive web applications.",
      skills: ["React", "CSS", "JavaScript", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "I Harsha Vardhan",
      position: "Joint Secretary",
      image: "/professional-male-student-technical-lead.png",
      bio: "Final year CSE student with strong foundation in programming and software development. Passionate about competitive coding and problem-solving.",
      skills: ["C++", "Python", "Git", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "N Jaswanth",
      position: "Joint Secretary",
      image: "/professional-male-student-competitive-programming.png",
      bio: "Final year CSE student interested in machine learning and data science applications. Experienced in developing intelligent systems and analytics tools.",
      skills: ["Python", "TensorFlow", "SQL", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Mansi Mehta",
      position: "Joint Secretary",
      image: "/professional-female-student-events-coordinator.png",
      bio: "Final year ECE student bridging hardware and software domains with expertise in embedded systems. Passionate about IoT and electronic circuit design.",
      skills: ["C", "Arduino", "Python", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Kausalya K",
      position: "Joint Secretary",
      image: "/professional-female-student-ai-ml.png",
      bio: "Final year Chemical Engineering student with interest in process automation and data analysis. Skilled in applying programming to engineering solutions.",
      skills: ["Python", "MATLAB", "R", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "B Sasanka",
      position: "Joint Secretary",
      image: "/professional-male-student-web-development.png",
      bio: "Third year CSE student enthusiastic about web development and open-source contributions. Actively learning new technologies and framework implementations.",
      skills: ["HTML", "CSS", "JavaScript", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Adithya Sai Srinivas M",
      position: "Joint Secretary",
      image: "/professional-male-student-technical-lead.png",
      bio: "Third year CSE student focused on mobile app development and cross-platform solutions. Passionate about creating user-friendly applications.",
      skills: ["Flutter", "Dart", "Firebase", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "V Chaitanya Kalyana Varma",
      position: "Joint Secretary",
      image: "/professional-male-student-web-development.png",
      bio: "Third year CSE student specializing in backend development and database management. Interested in scalable architecture and system design.",
      skills: ["Node.js", "Express", "PostgreSQL", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Kavya Telagareddi",
      position: "Joint Secretary",
      image: "/professional-female-student-ai-ml.png",
      bio: "Third year CSE student passionate about artificial intelligence and machine learning applications. Experienced in developing predictive models and data analysis.",
      skills: ["Python", "Scikit-learn", "Pandas", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Pavani Potturi",
      position: "Joint Secretary",
      image: "/professional-female-student-events-coordinator.png",
      bio: "Third year CSE student interested in cybersecurity and ethical hacking practices. Focused on building secure applications and network security.",
      skills: ["Python", "Linux", "Networking", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Soham Tripathy",
      position: "Joint Secretary",
      image: "/professional-male-student-competitive-programming.png",
      bio: "Third year CSE student enthusiastic about game development and graphics programming. Skilled in creating interactive experiences and visual applications.",
      skills: ["C#", "Unity", "OpenGL", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "S Sri Adinarayana Reddy",
      position: "Joint Secretary",
      image: "/professional-male-student-technical-lead.png",
      bio: "Third year ECE student with expertise in digital signal processing and embedded programming. Passionate about hardware-software integration projects.",
      skills: ["C", "VHDL", "MATLAB", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
  ],
  executiveMembers: [
    {
      name: "A Sriram",
      position: "Executive Member",
      image: "/professional-male-student-web-development.png",
      bio: "Third year CSE student with keen interest in web development and modern JavaScript frameworks. Building scalable and maintainable web applications.",
      skills: ["React", "Node.js", "MongoDB", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "B Sai Likhitha",
      position: "Executive Member",
      image: "/professional-female-student-vice-president.png",
      bio: "Third year CSE student exploring data structures and algorithms in depth. Active participant in competitive programming contests and coding hackathons.",
      skills: ["C++", "Python", "Algorithms", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "C Varun Teja",
      position: "Executive Member",
      image: "/professional-male-student-web-development.png",
      bio: "Third year ECE student passionate about IoT and embedded systems. Working on projects that bridge hardware and software domains.",
      skills: ["C", "Python", "Arduino", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "D Divya Lakshmi",
      position: "Executive Member",
      image: "/professional-female-student-vice-president.png",
      bio: "Third year CSE student interested in machine learning and data analytics. Building intelligent systems with Python and modern ML frameworks.",
      skills: ["Python", "TensorFlow", "Pandas", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "E Rakesh Babu",
      position: "Executive Member",
      image: "/professional-male-student-web-development.png",
      bio: "Third year CSE student with expertise in mobile app development using Flutter and React Native. Passionate about cross-platform solutions.",
      skills: ["Flutter", "Dart", "Firebase", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "F Sandhya Rani",
      position: "Executive Member",
      image: "/professional-female-student-vice-president.png",
      bio: "Third year CSE student focused on cybersecurity and network security. Building secure applications and learning ethical hacking practices.",
      skills: ["Python", "Linux", "Networking", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "G Vamsi Krishna",
      position: "Executive Member",
      image: "/professional-male-student-web-development.png",
      bio: "Third year EEE student with interests in automation and control systems. Applying programming skills to electrical engineering problems.",
      skills: ["C", "MATLAB", "Python", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "H Anjali Rao",
      position: "Executive Member",
      image: "/professional-female-student-vice-president.png",
      bio: "Third year CSE student passionate about UI/UX design and frontend development. Creating beautiful and intuitive user interfaces.",
      skills: ["React", "CSS", "Figma", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
  ],
  volunteers: [
    {
      name: "Ch.S.S.Harsha",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student beginning journey in programming and software development. Eager to learn new technologies and contribute to team projects.",
      skills: ["C", "Java", "HTML", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Chenna Sai Charan",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student passionate about learning programming fundamentals and problem-solving techniques. Active participant in coding practice sessions.",
      skills: ["Python", "C++", "Git", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "C Hemanth Sagar",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student interested in web development and database systems. Learning frontend and backend technologies for full-stack development.",
      skills: ["HTML", "CSS", "MySQL", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Anumitha Reddy",
      position: "Volunteer",
      image: "/professional-female-student-vice-president.png",
      bio: "Second year CSE student exploring mobile app development and user interface design. Learning modern programming languages and development frameworks.",
      skills: ["Java", "Android", "XML", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Krishna Myaka",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student focused on learning algorithms and competitive programming. Passionate about mathematical problem-solving and code optimization.",
      skills: ["C++", "Python", "Mathematics", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Spandana",
      position: "Volunteer",
      image: "/professional-female-student-vice-president.png",
      bio: "Second year CSE student interested in data science and analytics. Learning Python programming and statistical analysis for data-driven insights.",
      skills: ["Python", "Statistics", "Excel", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Puligundla Charith Chowdari",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student passionate about software engineering and system design. Learning object-oriented programming and software development practices.",
      skills: ["Java", "C++", "UML", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Sujay Nunna",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student exploring machine learning and artificial intelligence concepts. Interested in developing intelligent systems and automation tools.",
      skills: ["Python", "TensorFlow", "NumPy", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Vegi Bhanu Phanindra",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year CSE student focused on web technologies and responsive design. Learning modern JavaScript frameworks and frontend development tools.",
      skills: ["JavaScript", "React", "CSS", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Katari Harshavardhan Reddy",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year EEE student with interests in embedded programming and IoT applications. Learning to bridge electrical engineering with software development.",
      skills: ["C", "Arduino", "Sensors", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Poojari Nagashiva",
      position: "Volunteer",
      image: "/professional-male-student-web-development.png",
      bio: "Second year EEE student passionate about power electronics and automation systems. Learning programming for electrical system control and monitoring.",
      skills: ["C", "MATLAB", "LabVIEW", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
    {
      name: "Hasini",
      position: "Volunteer",
      image: "/professional-female-student-vice-president.png",
      bio: "Second year CSE student beginning exploration of programming languages and software development. Enthusiastic about learning new technologies and frameworks.",
      skills: ["Python", "HTML", "CSS", "DSA"],
      social: { github: "/", linkedin: "/", twitter: "/" },
    },
  ],
}

export const FACULTY_ADVISOR = {
  name: "Dr. K. Himabindu",
  position: "Faculty Advisor",
  department: "Computer Science & Engineering",
  image: "http://nitandhra.ac.in/faculty/assets/uploads/profile_images/16909.jpg",
  bio: "Dr. K. Himabindu is an Assistant Professor at NIT Andhra Pradesh, specializing in Artificial Intelligence and Natural Language Processing. With rich experience in academia and industry, she mentors students in cutting-edge technologies, fosters research and innovation, and guides them toward achieving their professional goals.",
  expertise: [
    "Natural Language Processing through Deep Learning",
    "Explainable AI",
    "Few Shot Learning",
    "Educational Data Mining",
  ],
  email: "himabinduk@nitandhra.ac.in",
}

// Map section keys to human-readable category labels used in DB
export const TEAM_SECTION_LABELS: Record<string, string> = {
  coreCommittee: "Secretary",
  jointSecretaries: "Joint Secretary",
  executiveMembers: "Executive Member",
  volunteers: "Volunteer",
}
