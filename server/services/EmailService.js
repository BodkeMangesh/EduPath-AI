const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"EduPath AI" <${process.env.EMAIL_USER}>`,

        to: user.email,

        subject: "Welcome to EduPath AI 🎓",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
            color: #1e293b;
          ">

            <div style="
              background: #2563eb;
              color: white;
              padding: 25px;
              border-radius: 12px;
              text-align: center;
            ">
              <h1>🎓 Welcome to EduPath AI</h1>

              <p>
                Your personalized career journey starts here.
              </p>
            </div>

            <div style="
              background: white;
              padding: 25px;
              margin-top: 20px;
              border-radius: 12px;
            ">

              <h2>Hello ${user.fullName || "there"} 👋</h2>

              <p>
                Welcome to <strong>EduPath AI</strong>.
              </p>

              <p>
                We're excited to have you with us. EduPath AI helps you
                understand your skills, discover suitable career paths,
                identify skill gaps and follow a personalized learning
                journey.
              </p>

              <h3>What you can do with EduPath AI:</h3>

              <ul>
                <li>🧠 Analyze your skills</li>
                <li>🎯 Discover suitable careers</li>
                <li>🗺️ Get a personalized roadmap</li>
                <li>📚 Find relevant learning resources</li>
                <li>📈 Track your learning progress</li>
              </ul>

              <p>
                Your journey is just beginning.
              </p>

              <p>
                <strong>Discover. Learn. Improve. Grow.</strong>
              </p>

              <p>
                Best regards,<br />
                <strong>EduPath AI Team</strong>
              </p>

            </div>

            <div style="
              text-align: center;
              margin-top: 20px;
              color: #64748b;
              font-size: 12px;
            ">
              <p>
                This is an automated email from EduPath AI.
              </p>
            </div>

          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log("Welcome email sent successfully:", result.messageId);

      return result;
    } catch (error) {
      console.error("Welcome email failed:", error.message);

      throw new Error("Unable to send welcome email.");
    }
  }
}

module.exports = new EmailService();
