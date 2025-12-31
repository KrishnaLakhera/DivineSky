import { useState, useEffect, useRef } from 'react';
import "../styles/Testimonials.css";

const testimonials = [
  {
    name: "HG Hridaya Chaitanya Prabhu",
    role: "GBC, Europe",
    image: "/images/HG-Hridaya-Chaitanya-Prabhu.jpg",
    message: "Your polishing work is of high quality.",
  },
  {
    name: "HG Radhe Shyam Prabhu",
    role: "Temple President, ISKCON Pune",
    image: "/images/HG-Radhe-Shyam-Prabhu.jpg",
    message:
      "When I had gone to Ujjain, I was deeply inspired by the gold-leafed small size altars which I felt our grihasthas in our community may appreciate very much.",
  },
  {
    name: "HG Gauranga Prabhu",
    role: "ISKCON GBC, India",
    image: "/images/Gauranga-Prabhu.webp",
    message:
      "HG Gauranga Prabhu visited our temple and very much appreciated our humble service attempts. He emphasized that for the future growth of ISKCON, it is important that ISKCON funds remain within the society, helping us become a self-sufficient movement. He also introduced us to HH Radhanath Swami Maharaja.",
  },
  {
    name: "HG Hridaya Chaitanya Prabhu",
    role: "GBC, Europe",
    image: "/images/HG-Hridaya-Chaitanya-Prabhu.jpg",
    message: "Your polishing work is of high quality.",
  },
  {
    name: "HG Radhe Shyam Prabhu",
    role: "Temple President, ISKCON Pune",
    image: "/images/HG-Radhe-Shyam-Prabhu.jpg",
    message:
      "When I had gone to Ujjain, I was deeply inspired by the gold-leafed small size altars which I felt our grihasthas in our community may appreciate very much.",
  },
  {
    name: "HG Gauranga Prabhu",
    role: "ISKCON GBC, India",
    image: "/images/Gauranga-Prabhu.webp",
    message:
      "HG Gauranga Prabhu visited our temple and very much appreciated our humble service attempts. He emphasized that for the future growth of ISKCON, it is important that ISKCON funds remain within the society, helping us become a self-sufficient movement. He also introduced us to HH Radhanath Swami Maharaja.",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef(null);
  
  // Create infinite loop by duplicating testimonials
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  const startIndex = testimonials.length;

  const scrollCarousel = (direction) => {
    if (direction === 'left') {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Initialize to middle set on mount
    setCurrentIndex(startIndex);
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      const cardWidth = 380;
      const gap = 35;
      const containerWidth = gridRef.current.offsetWidth;
      const actualIndex = startIndex + currentIndex;
      const scrollPosition = (cardWidth + gap) * actualIndex - (containerWidth / 2) + (cardWidth / 2);
      
      gridRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      // Reset position for infinite loop
      const timer = setTimeout(() => {
        if (currentIndex >= testimonials.length) {
          gridRef.current.scrollTo({
            left: (cardWidth + gap) * startIndex - (containerWidth / 2) + (cardWidth / 2),
            behavior: 'auto'
          });
          setCurrentIndex(0);
        } else if (currentIndex < 0) {
          gridRef.current.scrollTo({
            left: (cardWidth + gap) * (startIndex + testimonials.length - 1) - (containerWidth / 2) + (cardWidth / 2),
            behavior: 'auto'
          });
          setCurrentIndex(testimonials.length - 1);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const getVisibleIndex = (index) => {
    return ((index % testimonials.length) + testimonials.length) % testimonials.length;
  };

  return (
    <section className="testimonials">
      <h2>Words of Encouragement</h2>
      <p className="testimonials-subtitle">
        Appreciation and blessings from senior Vaishnavas
      </p>

      <div className="testimonial-carousel">
        <button 
          className="carousel-arrow left" 
          onClick={() => scrollCarousel('left')}
          aria-label="Previous testimonial"
        >
          <span className="arrow-icon"></span>
        </button>
        
        <div className="testimonial-grid" ref={gridRef}>
          {extendedTestimonials.map((item, index) => (
            <div 
              key={index}
              className={`testimonial-card ${index === startIndex + currentIndex ? 'active' : ''}`}
            >
              <img src={item.image} alt={item.name} />
              <p className="testimonial-text">"{item.message}"</p>
              <div className="testimonial-author">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-arrow right" 
          onClick={() => scrollCarousel('right')}
          aria-label="Next testimonial"
        >
          <span className="arrow-icon"></span>
        </button>
      </div>

      <div className="carousel-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === getVisibleIndex(currentIndex) ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}