const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new PDF document
const doc = new PDFDocument();

// Pipe to a file
const outputPath = path.join(__dirname, '../public/samples/sample-resume.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Add content
doc.fontSize(20).text('John Doe', { align: 'center' });
doc.fontSize(12).text('Software Engineer | john.doe@email.com | (555) 123-4567', { align: 'center' });
doc.moveDown();

doc.fontSize(16).text('EXPERIENCE');
doc.fontSize(12);
doc.moveDown(0.5);
doc.text('Senior Software Engineer');
doc.text('Google Inc. | Mountain View, CA | Jan 2020 - Present');
doc.text('• Developed scalable microservices handling 1M+ requests per day');
doc.text('• Led team of 5 engineers in building cloud-native applications');
doc.text('• Improved system performance by 40% through optimization');
doc.moveDown();

doc.text('Software Engineer');
doc.text('Microsoft Corporation | Redmond, WA | Jun 2017 - Dec 2019');
doc.text('• Built features for Azure cloud platform using C# and .NET');
doc.text('• Implemented CI/CD pipelines reducing deployment time by 60%');
doc.text('• Collaborated with cross-functional teams on product roadmap');
doc.moveDown();

doc.fontSize(16).text('EDUCATION');
doc.fontSize(12);
doc.moveDown(0.5);
doc.text('Bachelor of Science in Computer Science');
doc.text('Stanford University | Stanford, CA | 2013 - 2017');
doc.text('GPA: 3.8/4.0');
doc.moveDown();

doc.fontSize(16).text('PROJECTS');
doc.fontSize(12);
doc.moveDown(0.5);
doc.text('E-Commerce Platform');
doc.text('• Built full-stack web application using React, Node.js, and MongoDB');
doc.text('• Implemented payment processing with Stripe API');
doc.text('• Deployed on AWS with auto-scaling capabilities');
doc.moveDown();

doc.text('Machine Learning Image Classifier');
doc.text('• Developed CNN model achieving 95% accuracy on image classification');
doc.text('• Used TensorFlow and Python for model training');
doc.text('• Created REST API for model inference');
doc.moveDown();

doc.fontSize(16).text('SKILLS');
doc.fontSize(12);
doc.moveDown(0.5);
doc.text('Languages: JavaScript, TypeScript, Python, Java, C++, SQL');
doc.text('Frameworks: React, Node.js, Express, Next.js, Django, Spring Boot');
doc.text('Tools: Git, Docker, Kubernetes, AWS, Azure, Jenkins, MongoDB, PostgreSQL');
doc.moveDown();

doc.fontSize(16).text('CERTIFICATIONS');
doc.fontSize(12);
doc.moveDown(0.5);
doc.text('AWS Certified Solutions Architect - Associate (2021)');
doc.text('Google Cloud Professional Developer (2020)');

// Finalize the PDF
doc.end();

console.log('Sample resume PDF generated at:', outputPath);
