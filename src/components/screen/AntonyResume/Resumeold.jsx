import React, { useRef, useState } from 'react';
import {
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiGlobe,
  FiDatabase,
  FiCode,
  FiCloud,
  FiServer,
  FiTool,
  FiAward,
  FiBook,
  FiBriefcase,
  FiGitBranch
} from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import './Resume.css';

const Resume = () => {
  const [activeSection, setActiveSection] = useState(null);

  const resumeRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);

    const element = resumeRef.current;
    const opt = {
      margin: 10,
      filename: 'Antony_Prabu_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Create a clone to avoid modifying the original
    const clonedElement = element.cloneNode(true);

    // Apply print styles to the clone
    clonedElement.classList.add('pdf-export');

    // Temporarily add to document to calculate dimensions
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    document.body.appendChild(clonedElement);

    html2pdf()
      .set(opt)
      .from(clonedElement)
      .save()
      .then(() => {
        document.body.removeChild(clonedElement);
        setIsGeneratingPDF(false);
      });
  };



  // Data structure remains mostly the same as before
  const personalDetails = {
    nationality: 'Indian',
    gender: 'Male',
    dob: '24-May-1988',
    maritalStatus: 'Married',
    languages: 'Tamil, English, Kanada (speak only)',
    passport: 'H2********'
  };

  const skills = {
    core: ['.NET Core', 'ASP.NET', 'C#', 'Web API', 'Entity Framework & Dapper',
      'Microservice Architecture', 'SQL Server', 'React JS', 'Angular',
      'Azure', 'SSRS', 'SSIS', 'MongoDB'],
    frameworks: ['.NET 4.0', '.Core 5.0', '6.0', '7.0'],
    methodologies: ['Waterfall Model', 'SCRUM'],
    domains: ['Finance Management', 'Logistics', 'ERP', 'Health Care'],
    tools: ['Visual Studio', 'VS Code', 'MS SQL Server', 'Postman', 'TFS', 'GitHub/GitLab']
  };

  const experience = [
    {
      company: "Mimasoft Technologies Pvt Ltd",
      role: "Lead Engineer",
      period: "Feb 2024 - Present",
      location: "Chennai, India",
      projects: [
        {
          name: "Ora Health Care - Dental System",
          points: [
            "Demonstrated strong backend and integration development skills using C# .NET and Azure",
            "Led legacy system integration with modern cloud architecture via Azure Service Bus",
            "Built and deployed Azure Function Apps, Logic Apps, and Web Apps",
            "Utilized App Insights and Key Vault for monitoring and secure configuration",
            "Executed ETL processes using MS SQL Stored Procedures and Entity Framework"
          ]
        }
      ]
    },
    {
      company: "AES Technologies (India) Pvt Ltd",
      role: "Senior Software Engineer",
      period: "October 2021 - Jan 2024",
      location: "Coimbatore, India",
      projects: [
        {
          name: "AFIPL ERP Application",
          points: [
            "Developed API using .NET Core with MSSQL backend in Microservice Architecture",
            "Created frontend using React.js for textile preproduction management",
            "Managed orders, fulfillment details, and shipment tracking systems"
          ]
        }
      ]
    },
    {
      company: "Easy Design Systems (ACER ODC)",
      role: "Senior Software Engineer",
      period: "September 2017 - September 2021",
      location: "Coimbatore, India",
      projects: [
        {
          name: "Acer ERP Applications",
          points: [
            "Handled full-stack development of ERP systems",
            "Conducted client meetings and requirements gathering",
            "Implemented project in multiple regions simultaneously",
            "Mentored junior team members and conducted code reviews"
          ]
        }
      ]
    },
    {
      company: "GTR Aluminium Pvt Ltd",
      role: "Software Engineer",
      period: "Jan 2012 - Sept 2017",
      location: "Bangalore, India",
      projects: [
        {
          name: "G Systems - ERP Applications",
          points: [
            "Developed responsive web pages using .NET C#",
            "Created SSIS packages and SSRS/Crystal Reports",
            "Handled database design and optimization"
          ]
        }
      ]
    }
  ];


  const education = [
    {
      degree: "MCA - Master in Computer Application",
      university: "Bharathidhasan University",
      college: "St Joseph's College, Trichy",
      percentage: "77%",
      year: "2011"
    },
    {
      degree: "B.Sc - Physics",
      university: "Bharathidhasan University",
      college: "St Joseph's College, Trichy",
      percentage: "72%",
      year: "2008"
    },
    {
      degree: "HSC - Biology",
      university: "State Board",
      college: "St. Arulanandar Hr. Sec. School, Oriyur",
      percentage: "82%",
      year: "2005"
    },
    {
      degree: "SSLC",
      university: "State Board",
      college: "St. Joseph's High School, Vichoor",
      percentage: "89%",
      year: "2005"
    }
  ];

  return (
    <div className="resume-container" ref={resumeRef}>
      {/* Header Section */}
      <header className="resume-header">
        <div className="header-content">
          <div className="name-section">
            <div className="name-title-container">
              <h1>ANTONY PRABU V</h1>
              <div className="title-divider"></div>
              <p className="tagline">Senior Full-Stack Engineer</p>
            </div>

            <div className="badge-container">
              <div className="experience-badge">
                <span className="badge-icon">⏳</span>
                <span>13+ Years Experience</span>
              </div>
              <div className="tech-badge">
                <span className="badge-icon">🚀</span>
                <span>Lead Engineer</span>
              </div>
              <div className="tech-badge">
                <span className="badge-icon">💻</span>
                <span>.NET Core Expert</span>
              </div>
              <div className="tech-badge">
                <span className="badge-icon">🗄️</span>
                <span>SQL Specialist</span>
              </div>
              <div className="tech-badge">
                <span className="badge-icon">☁️</span>
                <span>Azure Experienced</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-icon">✨</div>
                <h3>Professional Profile</h3>
              </div>
              <p className="summary">
                Highly experienced Senior Software Engineer with over 13 years in the IT industry.
                Expertise in managing Software Development Life Cycle (SDLC) and leading project teams
                to successful completion. Proven ability to deliver enterprise solutions across multiple
                domains including ERP, Healthcare, and Finance.
              </p>
              <div className="metric-highlights">
                <div className="metric">
                  <span className="metric-value">50+</span>
                  <span className="metric-label">Features Delivered</span>
                </div>
                <div className="metric">
                  <span className="metric-value">15+</span>
                  <span className="metric-label">Projects Led</span>
                </div>
                <div className="metric">
                  <span className="metric-value">8+</span>
                  <span className="metric-label">Tech Mentored</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <div className="contact-card">
              <div className="contact-item">
                <FiPhone className="icon" />
                <div>
                  <div className="contact-label">Phone</div>
                  <div>+91-8050386769</div>
                </div>
              </div>
              <div className="contact-item">
                <FiMail className="icon" />
                <div>
                  <div className="contact-label">Email</div>
                  <a href="mailto:successprabumca@gmail.com">successprabumca@gmail.com</a>
                </div>
              </div>
              <div className="contact-item">
                <FiMapPin className="icon" />
                <div>
                  <div className="contact-label">Location</div>
                  <div>Chennai, Tamil Nadu, India</div>
                </div>
              </div>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/antony-prabu-v-45618b219" target="_blank" rel="noopener noreferrer" className="social-link">
                  <div className="social-icon linkedin">in</div>
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/successprabu?tab=overview&from=2025-05-01&to=2025-05-31" target="_blank" rel="noopener noreferrer" className="social-link">
                  <div className="social-icon github">gh</div>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            <button
              className="download-btn"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              <FiDownload className="btn-icon" />
              <span>
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Resume'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="resume-body">
        {/* Left Column */}
        <div className="left-column">
          {/* Technical Skills */}
          <section className="skills-section">
            <div className="section-header">
              <FiCode className="section-icon" />
              <h2>Technical Expertise</h2>
            </div>
            <div className="skill-category">
              <h3><FiServer /> Core Technologies</h3>
              <div className="skill-chips">
                {skills.core.map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>

            <div className="skill-category">
              <h3><FiCloud /> Cloud & Frameworks</h3>
              <div className="skill-chips">
                {skills.frameworks.map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>

            <div className="skill-category">
              <h3><FiTool /> Tools & Methods</h3>
              <div className="skill-chips">
                {[...skills.methodologies, ...skills.tools].map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>

            <div className="skill-category">
              <h3><FiGlobe /> Domain Knowledge</h3>
              <div className="skill-chips">
                {skills.domains.map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="education-section">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h2>Education</h2>
            </div>
            <div className="education-list">
              {education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h3>{edu.degree}</h3>
                  <p className="institution">{edu.college}</p>
                  <div className="education-details">
                    <span>{edu.university}</span>
                    <span>{edu.year}</span>
                    <span className="grade">Grade: {edu.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personal Details */}
          <section className="personal-section">
            <div className="section-header">
              <FiUser className="section-icon" />
              <h2>Personal Details</h2>
            </div>
            <div className="personal-grid">
              <div className="detail-item">
                <span>Nationality:</span>
                <span>{personalDetails.nationality}</span>
              </div>
              <div className="detail-item">
                <span>Date of Birth:</span>
                <span>{personalDetails.dob}</span>
              </div>
              <div className="detail-item">
                <span>Marital Status:</span>
                <span>{personalDetails.maritalStatus}</span>
              </div>
              <div className="detail-item">
                <span>Languages:</span>
                <span>{personalDetails.languages}</span>
              </div>
              <div className="detail-item">
                <span>Passport:</span>
                <span>{personalDetails.passport}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Work Experience */}
          <section className="experience-section">
            <div className="section-header">
              <FiBriefcase className="section-icon" />
              <h2>Professional Experience</h2>
            </div>
            <div className="experience-timeline">
              {experience.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="experience-card">
                    <div className="role-header">
                      <h3>{exp.role}</h3>
                      <span className="company-pill">{exp.company}</span>
                    </div>
                    <p className="duration-location">
                      <FiCalendar className="icon-sm" /> {exp.period}
                      <FiMapPin className="icon-sm" /> {exp.location}
                    </p>

                    {exp.projects.map((project, pIndex) => (
                      <div key={pIndex} className="project-card">
                        <h4 className="project-title">{project.name}</h4>
                        <ul className="achievement-list">
                          {project.points.map((point, ptIndex) => (
                            <li key={ptIndex}>
                              <div className="bullet"></div>
                              {point}
                            </li>
                          ))}
                        </ul>
                        <div className="tech-used">
                          <span>Key Technologies:</span>
                          <div className="tech-tags">
                            {index === 0 && ['C#', '.Net Core', 'MSSQL', 'Angular', 'Azure', 'Entity Framework'].map(t => (
                              <span key={t} className="tech-tag">{t}</span>
                            ))}
                            {index === 1 && ['.NET Core', 'MSSQL', 'React.js', 'Microservices', 'Bootstrap'].map(t => (
                              <span key={t} className="tech-tag">{t}</span>
                            ))}
                            {index === 2 && ['ASP.NET', '.NET Core', 'MSSQL', 'SSIS', 'SSRS', 'Angular js'].map(t => (
                              <span key={t} className="tech-tag">{t}</span>
                            ))}
                            {index === 3 && ['ASP.NET', 'MSSQL', 'HTML', 'CSS', 'javascript'].map(t => (
                              <span key={t} className="tech-tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Career Summary */}
          <section className="summary-section">
            <div className="section-header">
              <FiAward className="section-icon" />
              <h2>Career Summary</h2>
            </div>
            <div className="career-highlights">
              <div className="highlight-card">
                <div className="highlight-icon">💼</div>
                <div>
                  <h3>Proven Leadership</h3>
                  <p>Managed full SDLC for 15+ projects across multiple domains</p>
                </div>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon">🔄</div>
                <div>
                  <h3>Technical Expertise</h3>
                  <p>Full-stack development with .NET Core, React, Angular & Azure</p>
                </div>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon">🌐</div>
                <div>
                  <h3>Domain Knowledge</h3>
                  <p>Specialized in ERP, Healthcare, Finance & Logistics systems</p>
                </div>
              </div>

              <ul className="summary-points">
                <li>Total 13+ years experience in development and implementation of Web, APIs, Data Migration</li>
                <li>Expertise in .NET Core, Entity Framework, ASP.NET, JavaScript, CSS, C#, Crystal Reports</li>
                <li>Extensive experience in SQL Server (Stored Procedures, Functions, Views)</li>
                <li>Knowledge of n-Tier Architecture and Microservices</li>
                <li>Proven ability to mentor junior developers and conduct code reviews</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      {/* Declaration */}
      <footer className="resume-footer">
      <div className="declaration">
  <p>I do hereby declare that the particulars of information stated above are true, to the best of my knowledge and belief.</p>
  
  <div className="signature-container">
    <div className="place-date">
      <div className="place">
        <FiMapPin className="icon" />
        <span>Place: Chennai</span>
      </div>
      <div className="date">
        <FiCalendar className="icon" />
        <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
      </div>
    </div>
    
    <div className="signature">
      <div className="signature-line">(ANTONY PRABU V)</div>
   
    </div>
  </div>
</div>
      </footer>
    </div>
  );
};

export default Resume;