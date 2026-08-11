class ResourceLinkMapper {
  static getYouTubeLink(title) {
    const links = {
      "Hospital Management System using Spring Boot":
        "https://www.youtube.com/results?search_query=Hospital+Management+System+Spring+Boot",

      "Designing a Hospital Management System Database":
        "https://www.youtube.com/results?search_query=Hospital+Management+System+Database+Design",
    };

    return (
      links[title] ||
      `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`
    );
  }

  static getDocumentationLink(title) {
    const links = {
      "Spring Boot Documentation: Building Web Applications":
        "https://docs.spring.io/spring-boot/docs/current/reference/html/",

      "Hospital Management System Requirements and Specifications":
        "https://en.wikipedia.org/wiki/Hospital_information_system",
    };

    return (
      links[title] ||
      `https://www.google.com/search?q=${encodeURIComponent(title)}`
    );
  }

  static getPracticeLink(title) {
    return `https://www.google.com/search?q=${encodeURIComponent(title)}`;
  }

  static getProjectLink(title) {
    return `https://github.com/search?q=${encodeURIComponent(title)}`;
  }
}

module.exports = ResourceLinkMapper;
