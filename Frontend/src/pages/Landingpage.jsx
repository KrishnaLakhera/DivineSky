// LandingPage.jsx
import "../styles/Landingpage.css";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import CategoryGallery from "../components/Category_Gallery_Components/CategoryGallery";
import { title } from "framer-motion/client";

const LandingPage = () => {
  const navigate = useNavigate();

  const NavigateCatalog = () => {
    navigate("/catalog");
  };

  const handleCategoryClick = (slug) => {
    navigate(`/catalog?category=${slug}`);
  };

  const categories = [
     { title: "Altars & Temple Setups", slug: "altars", image: "https://pub-43e577891e9c4714928c02b437c487ce.r2.dev/DeitySample.jpeg" },    
    { title: "Deity Statues", slug: "deities", image: "https://pub-43e577891e9c4714928c02b437c487ce.r2.dev/products/deities/5f44c360-60a5-4170-8df5-eec47ae2b98b.jpeg" },
    { title: "3D Reviels", slug: "sculptures", image:"" },
    { title: "Divine Gifts", slug: "custom", image: "" }
  ];

  return (
    <>
      <HeroSection onExploreClick={NavigateCatalog} />
        <Bridge />
      <CategoryGallery 
        categories={categories} 
        onCategoryClick={handleCategoryClick} 
      />
    </>
  );
};


const Bridge = () => {
  return(

    <div className="section-bridge">
  <div className="divider">
    <span>✦</span>
  </div>
  <p className="bridge-text">
    Crafted with devotion • Experienced in detail
  </p>
</div>

  )  

}

export default LandingPage;