import "./SocialLinksCard.css";

function SocialLinksCard({ profile }) {
  const social = profile?.socialLinks;

  return (
    <div className="profile-card">
      <h2>🌐 Social Links</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>GitHub</label>

          {social?.github ? (
            <a href={social.github} target="_blank" rel="noreferrer">
              Open GitHub
            </a>
          ) : (
            <p>Not Added</p>
          )}
        </div>

        <div className="info-item">
          <label>LinkedIn</label>

          {social?.linkedin ? (
            <a href={social.linkedin} target="_blank" rel="noreferrer">
              Open LinkedIn
            </a>
          ) : (
            <p>Not Added</p>
          )}
        </div>

        <div className="info-item">
          <label>Portfolio</label>

          {social?.portfolio ? (
            <a href={social.portfolio} target="_blank" rel="noreferrer">
              Open Portfolio
            </a>
          ) : (
            <p>Not Added</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialLinksCard;
