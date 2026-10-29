import { useEffect, useState } from "react";
import "./CareerDiscovery.css";

import Loader from "../../components/Loader/Loader";
import CareerSearch from "../../components/CareerSearch/CareerSearch";
import CategoryFilter from "../../components/CategoryFilter/CategoryFilter";
import CareerStatistics from "../../components/CareerStatistics/CareerStatistics";

import {
  getCareers,
  getCategories,
  getStatistics,
} from "../../services/careerService";

function CareerDiscovery() {
  const [careers, setCareers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCareerDiscovery();
  }, []);

  const loadCareerDiscovery = async () => {
    try {
      setLoading(true);
      setError("");

      const [careersResponse, categoriesResponse, statisticsResponse] =
        await Promise.all([getCareers(), getCategories(), getStatistics()]);

      setCareers(careersResponse.data.data?.careers || []);
      setCategories(categoriesResponse.data.data || []);
      setStatistics(statisticsResponse.data.data || null);
    } catch (err) {
      console.error("Career Discovery Error:", err);

      setError(
        err.response?.data?.message || "Unable to load Career Discovery.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading Career Discovery..." />;
  }

  if (error) {
    return (
      <div className="career-discovery-error">
        <div className="error-icon">⚠️</div>

        <h2>Unable to Load Career Discovery</h2>

        <p>{error}</p>

        <button onClick={loadCareerDiscovery}>Try Again</button>
      </div>
    );
  }

  const filteredCareers =
    selectedCategory === ""
      ? careers
      : careers.filter(
          (career) =>
            career.category?.slug === selectedCategory ||
            career.category === selectedCategory,
        );

  return (
    <div className="career-discovery">
      {/* Hero Section */}
      <section className="career-hero">
        <div className="hero-content">
          <span className="hero-badge">🚀 Explore Your Future</span>

          <h1>
            Discover the Right Career
            <span> for Your Future</span>
          </h1>

          <p>
            Explore career opportunities based on your interests, skills,
            strengths, and goals. Choose a career and let EduPath-AI create your
            personalized learning journey.
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <span>🎯</span>
              <div>
                <strong>Find Your Direction</strong>
                <small>Explore suitable career paths</small>
              </div>
            </div>

            <div className="hero-feature">
              <span>🧠</span>
              <div>
                <strong>AI-Powered Assessment</strong>
                <small>Understand your skill level</small>
              </div>
            </div>

            <div className="hero-feature">
              <span>📚</span>
              <div>
                <strong>Personalized Learning</strong>
                <small>Build the skills you need</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="career-statistics-section">
        <div className="section-heading">
          <span>📊 Overview</span>
          <h2>Explore Career Opportunities</h2>
          <p>
            Discover different career paths and understand what skills you need
            to succeed.
          </p>
        </div>

        <CareerStatistics statistics={statistics} />
      </section>

      {/* Career Explorer */}
      <section className="career-explorer">
        <div className="section-heading explorer-heading">
          <span>🔎 Career Explorer</span>

          <h2>Find Your Perfect Career</h2>

          <p>Search by career name, skills, description, tags, or category.</p>
        </div>

        {/* Category Filter */}
        <div className="category-section">
          <h3>Browse by Category</h3>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Search + Cards */}
        <CareerSearch careers={filteredCareers} />
      </section>

      {/* Career Journey */}
      <section className="career-journey">
        <div className="section-heading">
          <span>🛤️ Your Journey</span>

          <h2>From Career Discovery to Career Readiness</h2>

          <p>EduPath-AI guides you step-by-step toward your career goal.</p>
        </div>

        <div className="journey-grid">
          <div className="journey-card">
            <div className="journey-number">01</div>
            <div className="journey-icon">🎯</div>
            <h3>Choose a Career</h3>
            <p>
              Explore careers and select the path that matches your interests
              and goals.
            </p>
          </div>

          <div className="journey-line"></div>

          <div className="journey-card">
            <div className="journey-number">02</div>
            <div className="journey-icon">📝</div>
            <h3>Skill Assessment</h3>
            <p>
              Complete an assessment to understand your current knowledge,
              strengths, and weaknesses.
            </p>
          </div>

          <div className="journey-line"></div>

          <div className="journey-card">
            <div className="journey-number">03</div>
            <div className="journey-icon">🤖</div>
            <h3>AI Analysis</h3>
            <p>
              EduPath-AI analyzes your assessment and identifies the skills you
              need to improve.
            </p>
          </div>

          <div className="journey-line"></div>

          <div className="journey-card">
            <div className="journey-number">04</div>
            <div className="journey-icon">📚</div>
            <h3>Learning Path</h3>
            <p>
              Get a personalized learning roadmap based on your career goal and
              skill gaps.
            </p>
          </div>

          <div className="journey-line"></div>

          <div className="journey-card">
            <div className="journey-number">05</div>
            <div className="journey-icon">📈</div>
            <h3>Track Progress</h3>
            <p>
              Track your learning progress, study hours, milestones, and career
              readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="career-cta">
        <div>
          <span>🚀 Ready to start?</span>

          <h2>Your career journey starts here.</h2>

          <p>
            Choose a career, complete your assessment, and let EduPath-AI build
            your personalized path.
          </p>
        </div>
      </section>
    </div>
  );
}

export default CareerDiscovery;
