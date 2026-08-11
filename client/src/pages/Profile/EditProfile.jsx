import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/profileService";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",

    education: {
      collegeName: "",
      university: "",
      degree: "",
      branch: "",
      semester: 1,
    },

    professional: {
      experienceLevel: "beginner",
      skills: "",
      certifications: "",
      resumeUrl: "",
    },

    aiProfile: {
      careerGoal: "",
      preferredLanguage: "English",
      dailyStudyHours: 2,
      interests: "",
    },

    placement: {
      targetRole: "",
      dreamCompany: "",
      dsaLevel: "beginner",
      interviewReadiness: 0,
    },

    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const profile = res.data.data;

      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",

        education: {
          collegeName: profile.education?.collegeName || "",
          university: profile.education?.university || "",
          degree: profile.education?.degree || "",
          branch: profile.education?.branch || "",
          semester: profile.education?.semester || 1,
        },

        professional: {
          experienceLevel: profile.professional?.experienceLevel || "beginner",
          skills: profile.professional?.skills?.join(", ") || "",
          certifications:
            profile.professional?.certifications?.join(", ") || "",
          resumeUrl: profile.professional?.resumeUrl || "",
        },

        aiProfile: {
          careerGoal: profile.aiProfile?.careerGoal || "",
          preferredLanguage: profile.aiProfile?.preferredLanguage || "English",
          dailyStudyHours: profile.aiProfile?.dailyStudyHours || 2,
          interests: profile.aiProfile?.interests?.join(", ") || "",
        },

        placement: {
          targetRole: profile.placement?.targetRole || "",
          dreamCompany: profile.placement?.dreamCompany || "",
          dsaLevel: profile.placement?.dsaLevel || "beginner",
          interviewReadiness: profile.placement?.interviewReadiness || 0,
        },

        socialLinks: {
          github: profile.socialLinks?.github || "",
          linkedin: profile.socialLinks?.linkedin || "",
          portfolio: profile.socialLinks?.portfolio || "",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  if (loading) return <h2>Loading Profile...</h2>;

  return (
    <div className="edit-profile-page">
      <h1>✏ Edit Profile</h1>

      <form className="edit-profile-form">
        <div className="form-section">
          <h2>👤 Personal Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>🎓 Education</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>College Name</label>
              <input
                type="text"
                value={formData.education.collegeName}
                onChange={(e) =>
                  handleNestedChange("education", "collegeName", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>University</label>
              <input
                type="text"
                value={formData.education.university}
                onChange={(e) =>
                  handleNestedChange("education", "university", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={formData.education.degree}
                onChange={(e) =>
                  handleNestedChange("education", "degree", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Branch</label>
              <input
                type="text"
                value={formData.education.branch}
                onChange={(e) =>
                  handleNestedChange("education", "branch", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Semester</label>
              <input
                type="number"
                value={formData.education.semester}
                onChange={(e) =>
                  handleNestedChange(
                    "education",
                    "semester",
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <h2>💼 Professional</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Experience Level</label>
              <select
                value={formData.professional.experienceLevel}
                onChange={(e) =>
                  handleNestedChange(
                    "professional",
                    "experienceLevel",
                    e.target.value,
                  )
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                value={formData.professional.skills}
                onChange={(e) =>
                  handleNestedChange("professional", "skills", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Certifications</label>
              <input
                type="text"
                value={formData.professional.certifications}
                onChange={(e) =>
                  handleNestedChange(
                    "professional",
                    "certifications",
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>Resume URL</label>
              <input
                type="url"
                value={formData.professional.resumeUrl}
                onChange={(e) =>
                  handleNestedChange(
                    "professional",
                    "resumeUrl",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>🤖 AI Learning Profile</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Career Goal</label>
              <input
                type="text"
                value={formData.aiProfile.careerGoal}
                onChange={(e) =>
                  handleNestedChange("aiProfile", "careerGoal", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Preferred Language</label>
              <select
                value={formData.aiProfile.preferredLanguage}
                onChange={(e) =>
                  handleNestedChange(
                    "aiProfile",
                    "preferredLanguage",
                    e.target.value,
                  )
                }
              >
                <option value="English">English</option>
                <option value="Marathi">Marathi</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div className="form-group">
              <label>Daily Study Hours</label>
              <input
                type="number"
                value={formData.aiProfile.dailyStudyHours}
                onChange={(e) =>
                  handleNestedChange(
                    "aiProfile",
                    "dailyStudyHours",
                    Number(e.target.value),
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>Interests</label>
              <input
                type="text"
                value={formData.aiProfile.interests}
                onChange={(e) =>
                  handleNestedChange("aiProfile", "interests", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>🎯 Placement</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Target Role</label>
              <input
                type="text"
                value={formData.placement.targetRole}
                onChange={(e) =>
                  handleNestedChange("placement", "targetRole", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Dream Company</label>
              <input
                type="text"
                value={formData.placement.dreamCompany}
                onChange={(e) =>
                  handleNestedChange(
                    "placement",
                    "dreamCompany",
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>DSA Level</label>
              <select
                value={formData.placement.dsaLevel}
                onChange={(e) =>
                  handleNestedChange("placement", "dsaLevel", e.target.value)
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interview Readiness (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.placement.interviewReadiness}
                onChange={(e) =>
                  handleNestedChange(
                    "placement",
                    "interviewReadiness",
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>🌐 Social Links</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) =>
                  handleNestedChange("socialLinks", "github", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  handleNestedChange("socialLinks", "linkedin", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Portfolio</label>
              <input
                type="url"
                value={formData.socialLinks.portfolio}
                onChange={(e) =>
                  handleNestedChange("socialLinks", "portfolio", e.target.value)
                }
              />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={saving}
            onClick={async (e) => {
              e.preventDefault();

              try {
                setSaving(true);

                const payload = {
                  ...formData,

                  professional: {
                    ...formData.professional,
                    skills: formData.professional.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),

                    certifications: formData.professional.certifications
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },

                  aiProfile: {
                    ...formData.aiProfile,
                    interests: formData.aiProfile.interests
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                };

                await updateProfile(payload);

                alert("Profile updated successfully!");

                navigate("/profile");
              } catch (error) {
                console.error(error);
                alert("Failed to update profile");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
